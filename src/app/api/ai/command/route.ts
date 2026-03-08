import { NextRequest, NextResponse } from 'next/server';
import { processCommand, getUserContext } from '@/lib/ai-integration';

const API_KEY = process.env.KINETIC_API_KEY || 'kinetic-dev-key';

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === API_KEY;
}

// POST /api/ai/command - Execute natural language command
// GET /api/ai/context - Get user context for AI assistants
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { command, useLLM } = body;
    
    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }
    
    const result = await processCommand(command, useLLM || false);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process command',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const context = await getUserContext();
    return NextResponse.json(context);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get user context',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
