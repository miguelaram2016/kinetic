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
  return 'food_' + Math.random().toString(36).substring(2, 11);
}

// Helper to calculate totals
function calculateTotals(meals: any[]) {
  return meals.reduce((acc, meal) => {
    meal.items.forEach((item: any) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.carbs += item.carbs || 0;
      acc.fats += item.fats || 0;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
}

// GET /api/food - List food entries
// POST /api/food - Add food entry
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    const foodData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'food.json'), { encoding: 'utf-8' })
    );
    
    let entries = foodData.entries || [];
    
    // Apply filters
    if (userId) {
      entries = entries.filter((e: any) => e.userId === userId);
    }
    if (date) {
      entries = entries.filter((e: any) => e.date === date);
    }
    
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: 'Failed to read food data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const foodFilePath = path.join(DATA_DIR, 'food.json');
    
    const currentData = JSON.parse(fs.readFileSync(foodFilePath, 'utf-8'));
    
    const newEntry = {
      id: generateId(),
      userId: body.userId || 'user_1',
      date: body.date || new Date().toISOString().split('T')[0],
      meals: body.meals || [],
      totals: body.totals || calculateTotals(body.meals || [])
    };
    
    // Check if entry for this date already exists, if so replace it
    const existingIndex = currentData.entries.findIndex(
      (e: any) => e.date === newEntry.date && e.userId === newEntry.userId
    );
    
    if (existingIndex >= 0) {
      currentData.entries[existingIndex] = newEntry;
    } else {
      currentData.entries.push(newEntry);
    }
    
    fs.writeFileSync(foodFilePath, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ entry: newEntry }, { status: existingIndex >= 0 ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add food entry' }, { status: 500 });
  }
}
