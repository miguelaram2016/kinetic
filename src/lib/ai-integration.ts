/**
 * AI Integration Hook for Kinetic Fitness App
 * 
 * This utility allows natural language commands to be parsed and executed.
 * MVP uses rule-based parsing, with a hook to plug in an LLM later.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// Types for command parsing
export interface AICommand {
  action: string;
  entity: string;
  params: Record<string, any>;
  raw: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  command?: AICommand;
}

// Exercise name mappings for natural language
const EXERCISE_ALIASES: Record<string, string> = {
  'bench': 'Bench Press',
  'bp': 'Bench Press',
  'squat': 'Squat',
  'deadlift': 'Deadlift',
  'dl': 'Deadlift',
  'ohp': 'Overhead Press',
  'overhead': 'Overhead Press',
  'press': 'Overhead Press',
  'pullup': 'Pull Up',
  'pull-up': 'Pull Up',
  'pull up': 'Pull Up',
  'chinup': 'Pull Up',
  'row': 'Barbell Row',
  'barbell row': 'Barbell Row',
  'curl': 'Dumbbell Curl',
  'bicep curl': 'Dumbbell Curl',
  'pushdown': 'Tricep Pushdown',
  'tricep': 'Tricep Pushdown',
  'leg press': 'Leg Press',
  'lat pulldown': 'Lat Pulldown',
  'lat': 'Lat Pulldown',
  'incline': 'Incline Dumbbell Press',
  'incline press': 'Incline Dumbbell Press',
  'rdl': 'Romanian Deadlift',
  'romanian': 'Romanian Deadlift',
};

// Action patterns
const ACTION_PATTERNS = {
  add: ['add', 'log', 'record', 'create', 'new', 'insert'],
  get: ['get', 'show', 'list', 'display', 'view', 'what', 'how'],
  update: ['update', 'change', 'modify', 'edit', 'set'],
  delete: ['remove', 'delete', 'clear'],
  complete: ['complete', 'finish', 'done', 'end'],
};

// Entity patterns
const ENTITY_PATTERNS = {
  workout: ['workout', 'exercise', 'training', 'session'],
  weight: ['weight', 'scale', 'bodyweight', 'body weight'],
  food: ['food', 'meal', 'eat', 'nutrition', 'diet', 'calories'],
  exercise: ['exercise', 'movement', 'lift'],
  program: ['program', 'plan', 'routine', 'split'],
  user: ['user', 'profile', 'goals', 'settings'],
};

/**
 * Parse a natural language command into structured data
 */
export function parseCommand(input: string): AICommand {
  const lowerInput = input.toLowerCase();
  const words = lowerInput.split(/\s+/);
  
  // Find action
  let action = 'get';
  for (const [actionName, patterns] of Object.entries(ACTION_PATTERNS)) {
    if (patterns.some(p => lowerInput.includes(p))) {
      action = actionName;
      break;
    }
  }
  
  // Find entity
  let entity = 'workout';
  for (const [entityName, patterns] of Object.entries(ENTITY_PATTERNS)) {
    if (patterns.some(p => lowerInput.includes(p))) {
      entity = entityName;
      break;
    }
  }
  
  // Extract parameters
  const params: Record<string, any> = {};
  
  // Date patterns
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  if (lowerInput.includes('today')) params.date = today;
  else if (lowerInput.includes('yesterday')) params.date = yesterday;
  else if (lowerInput.includes('tomorrow')) params.date = tomorrow;
  
  // Weight patterns (e.g., "175 lbs", "weigh 175")
  const weightMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)/);
  if (weightMatch) {
    params.weight = parseFloat(weightMatch[1]);
  }
  
  // Reps and sets patterns
  const setsMatch = lowerInput.match(/(\d+)\s*(?:sets?|x)/);
  if (setsMatch) {
    params.sets = parseInt(setsMatch[1]);
  }
  
  const repsMatch = lowerInput.match(/(\d+)\s*(?:reps?|r)/);
  if (repsMatch) {
    params.reps = repsMatch[1];
  }
  
  // Exercise name - check aliases first, then look for exercise in exercises list
  for (const [alias, fullName] of Object.entries(EXERCISE_ALIASES)) {
    if (lowerInput.includes(alias)) {
      params.exercise = fullName;
      break;
    }
  }
  
  return { action, entity, params, raw: input };
}

/**
 * Execute a parsed command
 */
export async function executeCommand(command: AICommand): Promise<AIResponse> {
  const { action, entity, params } = command;
  
  try {
    switch (entity) {
      case 'workout':
        return await handleWorkoutCommand(action, params);
      case 'weight':
        return await handleWeightCommand(action, params);
      case 'food':
        return await handleFoodCommand(action, params);
      case 'exercise':
        return await handleExerciseCommand(action, params);
      case 'program':
        return await handleProgramCommand(action, params);
      case 'user':
        return await handleUserCommand(action, params);
      default:
        return { success: false, message: `Unknown entity: ${entity}` };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Command handlers
async function handleWorkoutCommand(action: string, params: any): Promise<AIResponse> {
  const workoutsPath = path.join(DATA_DIR, 'workouts.json');
  const workouts = JSON.parse(fs.readFileSync(workoutsPath, 'utf-8'));
  
  if (action === 'add' || action === 'create') {
    const exerciseId = findExerciseId(params.exercise);
    
    const newWorkout = {
      id: 'wo_' + Math.random().toString(36).substring(2, 11),
      userId: 'user_1',
      name: params.exercise ? `${params.exercise} Workout` : 'Workout',
      type: 'custom',
      date: params.date || new Date().toISOString().split('T')[0],
      status: 'planned',
      source: 'ai',
      exercises: exerciseId ? [{
        id: 'we_' + Math.random().toString(36).substring(2, 11),
        exerciseId,
        order: 1,
        sets: params.sets || 3,
        reps: params.reps || '8-12',
        weight: params.weight || null,
        rest: 90,
        notes: ''
      }] : [],
      completedAt: null,
      duration: null
    };
    
    workouts.workouts.push(newWorkout);
    fs.writeFileSync(workoutsPath, JSON.stringify(workouts, null, 2));
    
    return {
      success: true,
      message: `Created new workout: ${newWorkout.name}`,
      data: newWorkout,
      command: { action, entity: 'workout', params, raw: '' }
    };
  }
  
  if (action === 'get') {
    // Find today's workout
    const today = new Date().toISOString().split('T')[0];
    const todaysWorkout = workouts.workouts.find((w: any) => w.date === today);
    
    if (todaysWorkout) {
      return {
        success: true,
        message: `Found workout for today`,
        data: todaysWorkout,
        command: { action, entity: 'workout', params, raw: '' }
      };
    }
    
    // Return upcoming workouts
    const upcoming = workouts.workouts
      .filter((w: any) => w.status === 'planned')
      .slice(0, 3);
    
    return {
      success: true,
      message: upcoming.length ? `Found ${upcoming.length} upcoming workouts` : 'No upcoming workouts',
      data: upcoming,
      command: { action, entity: 'workout', params, raw: '' }
    };
  }
  
  return { success: false, message: `Unknown workout action: ${action}` };
}

async function handleWeightCommand(action: string, params: any): Promise<AIResponse> {
  const weightPath = path.join(DATA_DIR, 'weight.json');
  const weightData = JSON.parse(fs.readFileSync(weightPath, 'utf-8'));
  
  if (action === 'add' || action === 'log') {
    if (!params.weight) {
      return { success: false, message: 'Please specify a weight (e.g., "log weight 175 lbs")' };
    }
    
    const newEntry = {
      id: 'wt_' + Math.random().toString(36).substring(2, 11),
      userId: 'user_1',
      date: params.date || new Date().toISOString().split('T')[0],
      weight: params.weight,
      unit: 'lbs'
    };
    
    // Update or add
    const existingIndex = weightData.entries.findIndex(
      (e: any) => e.date === newEntry.date
    );
    
    if (existingIndex >= 0) {
      weightData.entries[existingIndex] = newEntry;
    } else {
      weightData.entries.push(newEntry);
    }
    
    weightData.entries.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    fs.writeFileSync(weightPath, JSON.stringify(weightData, null, 2));
    
    return {
      success: true,
      message: `Logged weight: ${params.weight} lbs for ${newEntry.date}`,
      data: newEntry,
      command: { action, entity: 'weight', params, raw: '' }
    };
  }
  
  if (action === 'get') {
    const recent = weightData.entries.slice(-7);
    const latest = weightData.entries[weightData.entries.length - 1];
    
    return {
      success: true,
      message: latest ? `Latest weight: ${latest.weight} lbs (${latest.date})` : 'No weight entries',
      data: { recent, latest },
      command: { action, entity: 'weight', params, raw: '' }
    };
  }
  
  return { success: false, message: `Unknown weight action: ${action}` };
}

async function handleFoodCommand(action: string, params: any): Promise<AIResponse> {
  const foodPath = path.join(DATA_DIR, 'food.json');
  const foodData = JSON.parse(fs.readFileSync(foodPath, 'utf-8'));
  
  if (action === 'get') {
    const today = new Date().toISOString().split('T')[0];
    const todaysFood = foodData.entries.find((e: any) => e.date === today);
    
    if (todaysFood) {
      return {
        success: true,
        message: `Today's nutrition: ${todaysFood.totals.calories} cal, ${todaysFood.totals.protein}g protein`,
        data: todaysFood,
        command: { action, entity: 'food', params, raw: '' }
      };
    }
    
    return {
      success: true,
      message: 'No food logged for today',
      data: null,
      command: { action, entity: 'food', params, raw: '' }
    };
  }
  
  return { success: false, message: `Unknown food action: ${action}` };
}

async function handleExerciseCommand(action: string, params: any): Promise<AIResponse> {
  const exercisesPath = path.join(DATA_DIR, 'exercises.json');
  const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
  
  if (action === 'get') {
    if (params.exercise) {
      const exercise = exercisesData.exercises.find(
        (e: any) => e.name.toLowerCase() === params.exercise.toLowerCase()
      );
      
      if (exercise) {
        return {
          success: true,
          message: `Found exercise: ${exercise.name}`,
          data: exercise,
          command: { action, entity: 'exercise', params, raw: '' }
        };
      }
      
      return { success: false, message: `Exercise not found: ${params.exercise}` };
    }
    
    // Return all exercises
    return {
      success: true,
      message: `Found ${exercisesData.exercises.length} exercises`,
      data: exercisesData.exercises,
      command: { action, entity: 'exercise', params, raw: '' }
    };
  }
  
  return { success: false, message: `Unknown exercise action: ${action}` };
}

async function handleProgramCommand(action: string, params: any): Promise<AIResponse> {
  const programsPath = path.join(DATA_DIR, 'programs.json');
  const programsData = JSON.parse(fs.readFileSync(programsPath, 'utf-8'));
  
  if (action === 'get') {
    const activeProgram = programsData.programs.find((p: any) => p.active);
    
    if (activeProgram) {
      return {
        success: true,
        message: `Active program: ${activeProgram.name}`,
        data: activeProgram,
        command: { action, entity: 'program', params, raw: '' }
      };
    }
    
    return {
      success: true,
      message: 'No active program',
      data: null,
      command: { action, entity: 'program', params, raw: '' }
    };
  }
  
  return { success: false, message: `Unknown program action: ${action}` };
}

async function handleUserCommand(action: string, params: any): Promise<AIResponse> {
  const userPath = path.join(DATA_DIR, 'user.json');
  const userData = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  
  if (action === 'get') {
    return {
      success: true,
      message: `User: ${userData.user.name}`,
      data: userData.user,
      command: { action, entity: 'user', params, raw: '' }
    };
  }
  
  return { success: false, message: `Unknown user action: ${action}` };
}

// Helper to find exercise ID by name
function findExerciseId(exerciseName: string): string | null {
  if (!exerciseName) return null;
  
  const exercisesPath = path.join(DATA_DIR, 'exercises.json');
  const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
  
  const exercise = exercisesData.exercises.find(
    (e: any) => e.name.toLowerCase() === exerciseName.toLowerCase()
  );
  
  return exercise?.id || null;
}

/**
 * Main entry point - process a natural language command
 * 
 * @param input - Natural language command (e.g., "add bench press to today's workout")
 * @param useLLM - Optional flag to use LLM for parsing (not implemented yet)
 */
export async function processCommand(input: string, useLLM: boolean = false): Promise<AIResponse> {
  // Parse the command
  const command = parseCommand(input);
  
  // Execute the command
  return await executeCommand(command);
}

/**
 * Get user context for AI assistants
 * This loads relevant data that an LLM might need to understand the user's fitness state
 */
export async function getUserContext(): Promise<{
  user: any;
  recentWorkouts: any[];
  currentWeight: any;
  activeProgram: any;
  recentFood: any;
}> {
  const userPath = path.join(DATA_DIR, 'user.json');
  const workoutsPath = path.join(DATA_DIR, 'workouts.json');
  const weightPath = path.join(DATA_DIR, 'weight.json');
  const programsPath = path.join(DATA_DIR, 'programs.json');
  const foodPath = path.join(DATA_DIR, 'food.json');
  
  const userData = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  const workoutsData = JSON.parse(fs.readFileSync(workoutsPath, 'utf-8'));
  const weightData = JSON.parse(fs.readFileSync(weightPath, 'utf-8'));
  const programsData = JSON.parse(fs.readFileSync(programsPath, 'utf-8'));
  const foodData = JSON.parse(fs.readFileSync(foodPath, 'utf-8'));
  
  const today = new Date().toISOString().split('T')[0];
  
  return {
    user: userData.user,
    recentWorkouts: workoutsData.workouts.slice(-5),
    currentWeight: weightData.entries[weightData.entries.length - 1],
    activeProgram: programsData.programs.find((p: any) => p.active),
    recentFood: foodData.entries.find((e: any) => e.date === today)
  };
}
