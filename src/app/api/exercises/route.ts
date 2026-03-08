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
  return 'ex_' + Math.random().toString(36).substring(2, 11);
}

// GET /api/exercises - List all exercises
// POST /api/exercises - Add new exercise
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const search = searchParams.get('search');
    
    const exercisesData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'exercises.json'), 'utf-8')
    );
    
    let exercises = exercisesData.exercises || [];
    
    // Apply filters
    if (muscleGroup) {
      exercises = exercises.filter((e: any) => 
        e.muscleGroups?.includes(muscleGroup.toLowerCase())
      );
    }
    if (equipment) {
      exercises = exercises.filter((e: any) => 
        e.equipment?.includes(equipment.toLowerCase())
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      exercises = exercises.filter((e: any) => 
        e.name.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({ exercises });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read exercises' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const exercisesFilePath = path.join(DATA_DIR, 'exercises.json');
    
    const currentData = JSON.parse(fs.readFileSync(exercisesFilePath, 'utf-8'));
    
    const newExercise = {
      id: generateId(),
      name: body.name,
      description: body.description || '',
      muscleGroups: body.muscleGroups || [],
      equipment: body.equipment || [],
      difficulty: body.difficulty || 'beginner'
    };
    
    currentData.exercises = [...currentData.exercises, newExercise];
    
    fs.writeFileSync(exercisesFilePath, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ exercise: newExercise }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}
