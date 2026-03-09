import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const API_KEY = process.env.KINETIC_API_KEY || 'kinetic-dev-key';

// Helper to validate API key
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === API_KEY;
}

// GET /api/users - Get user profile
// POST /api/users - Create/update user profile
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'user.json'), 'utf-8')
    );
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json({ error: 'Failed to read user data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userFilePath = path.join(DATA_DIR, 'user.json');
    
    const currentData = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));
    const updatedData = {
      ...currentData,
      user: {
        ...currentData.user,
        ...body,
        updatedAt: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(userFilePath, JSON.stringify(updatedData, null, 2));
    return NextResponse.json(updatedData);
  } catch {
    return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
  }
}
