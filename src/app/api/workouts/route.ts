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
  return 'wo_' + Math.random().toString(36).substring(2, 11);
}

// GET /api/workouts - List all workouts
// POST /api/workouts - Create new workout
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    const workoutsData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'workouts.json'), 'utf-8')
    );
    
    let workouts = workoutsData.workouts || [];
    
    // Apply filters
    if (userId) {
      workouts = workouts.filter((w: any) => w.userId === userId);
    }
    if (status) {
      workouts = workouts.filter((w: any) => w.status === status);
    }
    if (date) {
      workouts = workouts.filter((w: any) => w.date === date);
    }
    
    return NextResponse.json({ workouts });
  } catch {
    return NextResponse.json({ error: 'Failed to read workouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const workoutsFilePath = path.join(DATA_DIR, 'workouts.json');
    
    const currentData = JSON.parse(fs.readFileSync(workoutsFilePath, 'utf-8'));
    
    const newWorkout = {
      id: generateId(),
      userId: body.userId || 'user_1',
      name: body.name || 'Workout',
      type: body.type || 'custom',
      date: body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'planned',
      source: body.source || 'api',
      exercises: body.exercises || [],
      completedAt: body.completedAt || null,
      duration: body.duration || null
    };
    
    currentData.workouts = [...currentData.workouts, newWorkout];
    
    fs.writeFileSync(workoutsFilePath, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ workout: newWorkout }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}
