import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const API_KEY = process.env.KINETIC_API_KEY || 'kinetic-dev-key';

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === API_KEY;
}

function generateId(): string {
  return 'wt_' + Math.random().toString(36).substring(2, 11);
}

// GET /api/weight - List weight entries
// POST /api/weight - Add weight entry
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const weightData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'weight.json'), 'utf-8')
    );
    
    let entries = weightData.entries || [];
    
    // Apply filters
    if (userId) {
      entries = entries.filter((e: any) => e.userId === userId);
    }
    if (startDate) {
      entries = entries.filter((e: any) => e.date >= startDate);
    }
    if (endDate) {
      entries = entries.filter((e: any) => e.date <= endDate);
    }
    
    // Sort by date ascending
    entries.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read weight data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const weightFilePath = path.join(DATA_DIR, 'weight.json');
    
    const currentData = JSON.parse(fs.readFileSync(weightFilePath, 'utf-8'));
    
    // Check if entry for this date already exists, if so update it
    const existingIndex = currentData.entries.findIndex(
      (e: any) => e.date === body.date && e.userId === (body.userId || 'user_1')
    );
    
    const newEntry = {
      id: existingIndex >= 0 ? currentData.entries[existingIndex].id : generateId(),
      userId: body.userId || 'user_1',
      date: body.date || new Date().toISOString().split('T')[0],
      weight: body.weight,
      unit: body.unit || 'lbs'
    };
    
    if (existingIndex >= 0) {
      currentData.entries[existingIndex] = newEntry;
    } else {
      currentData.entries.push(newEntry);
    }
    
    // Sort by date
    currentData.entries.sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    fs.writeFileSync(weightFilePath, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ entry: newEntry }, { status: existingIndex >= 0 ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add weight entry' }, { status: 500 });
  }
}
