// Types for the Kinetic fitness app

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  name: string;
  scheduledDate: string;
  exercises: Exercise[];
  completed: boolean;
  completedAt?: string;
  duration?: number; // in minutes
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface ProgramPhase {
  name: string;
  workouts: string[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  phases: ProgramPhase[];
  currentPhase: number;
  startedAt: string;
}

export interface UserStats {
  workoutsThisWeek: number;
  streak: number;
  totalVolume: number;
  totalWorkouts: number;
}

// Helper to generate IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
