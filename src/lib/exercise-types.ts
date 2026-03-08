// Rich exercise type definitions for Kinetic fitness app

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'lats'
  | 'lower-back';

export type Equipment = 
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'resistance-band'
  | 'smith-machine'
  | 'ez-bar'
  | 'trx'
  | 'medicine-ball'
  | 'foam-roller';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type MovementPattern = 
  | 'push'
  | 'pull'
  | 'squat'
  | 'hinge'
  | 'carry'
  | 'rotation'
  | 'isolation'
  | 'anti-rotation';

export interface ExerciseInstruction {
  step: number;
  text: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  movementPattern: MovementPattern[];
  caloriesPerMinute?: number;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  exercises: string[]; // exercise IDs
}

export interface EquipmentCategory {
  id: string;
  name: string;
  icon: string;
  exercises: string[];
}

export interface MovementCategory {
  id: string;
  name: string;
  description: string;
  exercises: string[];
}

// Search/filter types
export interface ExerciseFilter {
  muscleGroups?: MuscleGroup[];
  equipment?: Equipment[];
  difficulty?: Difficulty;
  movementPattern?: MovementPattern[];
  searchQuery?: string;
}

// Helper to generate exercise ID from name
export function generateExerciseId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
