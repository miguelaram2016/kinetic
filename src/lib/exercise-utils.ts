import { Exercise, ExerciseFilter, MuscleGroup, Equipment, MovementPattern } from './exercise-types';
import exercisesData from '@/data/exercises.json';

// Re-export ExerciseFilter for convenience
export type { ExerciseFilter } from './exercise-types';

// Type assertion for the imported JSON
const exercises: Exercise[] = exercisesData.exercises as Exercise[];

// ============ CORE GETTERS ============

/**
 * Get all exercises
 */
export function getAllExercises(): Exercise[] {
  return exercises;
}

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(e => e.id === id);
}

/**
 * Get exercise by name (case-insensitive)
 */
export function getExerciseByName(name: string): Exercise | undefined {
  return exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
}

// ============ FILTER BY MUSCLE GROUP ============

/**
 * Get exercises that primarily target a muscle group
 */
export function getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
  return exercises.filter(e => e.muscleGroups.includes(muscleGroup));
}

/**
 * Get exercises that target a muscle group (primary or secondary)
 */
export function getExercisesTargetingMuscle(muscleGroup: MuscleGroup): Exercise[] {
  return exercises.filter(e => 
    e.muscleGroups.includes(muscleGroup) || e.secondaryMuscles.includes(muscleGroup)
  );
}

// ============ FILTER BY EQUIPMENT ============

/**
 * Get exercises that can be performed with given equipment
 */
export function getExercisesByEquipment(equipment: Equipment): Exercise[] {
  return exercises.filter(e => e.equipment.includes(equipment));
}

/**
 * Get exercises that can be performed with ANY of the given equipment
 */
export function getExercisesByAnyEquipment(equipmentList: Equipment[]): Exercise[] {
  return exercises.filter(e => 
    equipmentList.some(eq => e.equipment.includes(eq))
  );
}

/**
 * Get exercises that can be performed with ALL of the given equipment
 */
export function getExercisesByAllEquipment(equipmentList: Equipment[]): Exercise[] {
  return exercises.filter(e => 
    equipmentList.every(eq => e.equipment.includes(eq))
  );
}

// ============ FILTER BY DIFFICULTY ============

/**
 * Get exercises by difficulty level
 */
export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return exercises.filter(e => e.difficulty === difficulty);
}

// ============ FILTER BY MOVEMENT PATTERN ============

/**
 * Get exercises by movement pattern
 */
export function getExercisesByMovementPattern(pattern: MovementPattern): Exercise[] {
  return exercises.filter(e => e.movementPattern.includes(pattern));
}

/**
 * Get exercises that match ANY of the given movement patterns
 */
export function getExercisesByAnyMovement(patterns: MovementPattern[]): Exercise[] {
  return exercises.filter(e => 
    patterns.some(p => e.movementPattern.includes(p))
  );
}

// ============ FUZZY SEARCH BY NAME ============

/**
 * Simple fuzzy search by exercise name
 * Returns exercises that contain the search query (case-insensitive)
 */
export function searchExercisesByName(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return exercises;
  
  return exercises.filter(e => 
    e.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Advanced fuzzy search with scoring
 * Returns sorted results by relevance
 */
export function fuzzySearchExercises(query: string): Array<{ exercise: Exercise; score: number }> {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return exercises.map(e => ({ exercise: e, score: 0 }));
  }

  const results: Array<{ exercise: Exercise; score: number }> = [];

  for (const exercise of exercises) {
    const name = exercise.name.toLowerCase();
    let score = 0;

    // Exact match
    if (name === lowerQuery) {
      score = 100;
    }
    // Starts with query
    else if (name.startsWith(lowerQuery)) {
      score = 80;
    }
    // Word starts with query
    else if (name.split(' ').some(word => word.startsWith(lowerQuery))) {
      score = 60;
    }
    // Contains query
    else if (name.includes(lowerQuery)) {
      score = 40;
    }
    // Fuzzy match (character match percentage)
    else {
      const matches = lowerQuery.split('').filter(char => name.includes(char)).length;
      const matchRatio = matches / lowerQuery.length;
      if (matchRatio > 0.5) {
        score = Math.round(matchRatio * 30);
      }
    }

    if (score > 0) {
      results.push({ exercise, score });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

// ============ COMBINED FILTER ============

/**
 * Filter exercises by multiple criteria
 */
export function filterExercises(filter: ExerciseFilter): Exercise[] {
  let result = exercises;

  // Filter by muscle groups (OR logic within, AND with other filters)
  if (filter.muscleGroups && filter.muscleGroups.length > 0) {
    result = result.filter(e => 
      filter.muscleGroups!.some(mg => 
        e.muscleGroups.includes(mg) || e.secondaryMuscles.includes(mg)
      )
    );
  }

  // Filter by equipment (OR logic)
  if (filter.equipment && filter.equipment.length > 0) {
    result = result.filter(e => 
      filter.equipment!.some(eq => e.equipment.includes(eq))
    );
  }

  // Filter by difficulty
  if (filter.difficulty) {
    result = result.filter(e => e.difficulty === filter.difficulty);
  }

  // Filter by movement pattern
  if (filter.movementPattern && filter.movementPattern.length > 0) {
    result = result.filter(e => 
      filter.movementPattern!.some(mp => e.movementPattern.includes(mp))
    );
  }

  // Filter by search query
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    result = result.filter(e => 
      e.name.toLowerCase().includes(query) ||
      e.muscleGroups.some(mg => mg.toLowerCase().includes(query)) ||
      e.equipment.some(eq => eq.toLowerCase().includes(query))
    );
  }

  return result;
}

// ============ FIND SIMILAR EXERCISES ============

/**
 * Find exercises similar to a given exercise (same movement pattern)
 */
export function findSimilarExercises(exerciseId: string, limit: number = 5): Exercise[] {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return [];

  return exercises
    .filter(e => e.id !== exerciseId) // Exclude self
    .map(e => ({
      exercise: e,
      // Score based on movement pattern overlap
      score: e.movementPattern.filter(mp => 
        exercise.movementPattern.includes(mp)
      ).length +
      // Bonus for overlapping muscle groups
      e.muscleGroups.filter(mg => 
        exercise.muscleGroups.includes(mg)
      ).length
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.exercise);
}

/**
 * Find alternative exercises that work the same muscle group
 */
export function findAlternatives(muscleGroup: MuscleGroup, excludeId?: string): Exercise[] {
  return exercises
    .filter(e => e.id !== excludeId && e.muscleGroups.includes(muscleGroup))
    .slice(0, 10);
}

// ============ EXERCISE SUGGESTIONS ============

/**
 * Get workout suggestions based on available equipment
 */
export function getWorkoutSuggestions(equipment: Equipment[]): {
  push: Exercise[];
  pull: Exercise[];
  legs: Exercise[];
  core: Exercise[];
} {
  const available = getExercisesByAnyEquipment(equipment);
  
  return {
    push: available.filter(e => e.movementPattern.includes('push')).slice(0, 5),
    pull: available.filter(e => e.movementPattern.includes('pull')).slice(0, 5),
    legs: available.filter(e => 
      e.movementPattern.includes('squat') || 
      e.movementPattern.includes('hinge')
    ).slice(0, 5),
    core: available.filter(e => 
      e.muscleGroups.includes('core') || 
      e.muscleGroups.includes('abs')
    ).slice(0, 5),
  };
}

/**
 * Get beginner-friendly exercises
 */
export function getBeginnerExercises(): Exercise[] {
  return exercises.filter(e => e.difficulty === 'beginner');
}

/**
 * Get exercises that require no gym equipment
 */
export function getBodyweightExercises(): Exercise[] {
  return exercises.filter(e => e.equipment.includes('bodyweight'));
}

// ============ LEGACY COMPATIBILITY ============

/**
 * Map exercise ID to workout template name (for backward compatibility)
 */
export function getExerciseNameById(id: string): string {
  const exercise = getExerciseById(id);
  return exercise?.name || id;
}

/**
 * Get workout template names that exist in database
 */
export function getKnownExerciseNames(): string[] {
  return exercises.map(e => e.name);
}

