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
  return 'prog_' + Math.random().toString(36).substring(2, 11);
}

// GET /api/programs - List all programs
// POST /api/programs - Create new program
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const active = searchParams.get('active');
    
    const programsData = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'programs.json'), 'utf-8')
    );
    
    let programs = programsData.programs || [];
    
    // Apply filters
    if (userId) {
      programs = programs.filter((p: any) => p.userId === userId);
    }
    if (active !== null) {
      programs = programs.filter((p: any) => p.active === (active === 'true'));
    }
    
    return NextResponse.json({ programs });
  } catch {
    return NextResponse.json({ error: 'Failed to read programs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const programsFilePath = path.join(DATA_DIR, 'programs.json');
    
    const currentData = JSON.parse(fs.readFileSync(programsFilePath, 'utf-8'));
    
    const newProgram = {
      id: generateId(),
      userId: body.userId || 'user_1',
      name: body.name,
      description: body.description || '',
      phases: body.phases || [],
      currentPhase: 0,
      startedAt: new Date().toISOString(),
      active: true
    };
    
    currentData.programs = [...currentData.programs, newProgram];
    
    fs.writeFileSync(programsFilePath, JSON.stringify(currentData, null, 2));
    return NextResponse.json({ program: newProgram }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}
