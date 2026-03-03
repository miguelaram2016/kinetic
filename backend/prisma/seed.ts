import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Lower Body - Compound
  {
    name: 'Barbell Back Squat',
    description: 'Classic lower body compound movement targeting quads, glutes, and hamstrings',
    muscleGroups: JSON.stringify(['quadriceps', 'glutes', 'hamstrings', 'core']),
    equipment: JSON.stringify(['barbell', 'squat rack']),
    difficulty: 'intermediate'
  },
  {
    name: 'Conventional Deadlift',
    description: 'Full body compound pulling movement',
    muscleGroups: JSON.stringify(['back', 'glutes', 'hamstrings', 'core', 'forearms']),
    equipment: JSON.stringify(['barbell']),
    difficulty: 'intermediate'
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hip hinge movement targeting hamstrings and glutes',
    muscleGroups: JSON.stringify(['hamstrings', 'glutes', 'lower back']),
    equipment: JSON.stringify(['barbell', 'dumbbells']),
    difficulty: 'intermediate'
  },
  {
    name: 'Front Squat',
    description: 'Squat variation with barbell in front rack position',
    muscleGroups: JSON.stringify(['quadriceps', 'core', 'glutes']),
    equipment: JSON.stringify(['barbell', 'squat rack']),
    difficulty: 'advanced'
  },
  {
    name: 'Bulgarian Split Squat',
    description: 'Unilateral leg exercise',
    muscleGroups: JSON.stringify(['quadriceps', 'glutes', 'hamstrings']),
    equipment: JSON.stringify(['dumbbells', 'bench']),
    difficulty: 'intermediate'
  },
  // Chest - Compound
  {
    name: 'Barbell Bench Press',
    description: 'Primary chest pressing movement',
    muscleGroups: JSON.stringify(['chest', 'triceps', 'shoulders']),
    equipment: JSON.stringify(['barbell', 'bench']),
    difficulty: 'intermediate'
  },
  {
    name: 'Incline Dumbbell Press',
    description: 'Upper chest focused pressing',
    muscleGroups: JSON.stringify(['chest', 'shoulders', 'triceps']),
    equipment: JSON.stringify(['dumbbells', 'incline bench']),
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'Chest pressing with dumbbells for greater range of motion',
    muscleGroups: JSON.stringify(['chest', 'triceps', 'shoulders']),
    equipment: JSON.stringify(['dumbbells', 'bench']),
    difficulty: 'beginner'
  },
  {
    name: 'Dip',
    description: 'Bodyweight pressing movement',
    muscleGroups: JSON.stringify(['chest', 'triceps', 'shoulders']),
    equipment: JSON.stringify(['dip bars']),
    difficulty: 'intermediate'
  },
  // Back - Compound
  {
    name: 'Barbell Row',
    description: 'Horizontal pulling movement for back thickness',
    muscleGroups: JSON.stringify(['back', 'biceps', 'rear delts']),
    equipment: JSON.stringify(['barbell']),
    difficulty: 'intermediate'
  },
  {
    name: 'Pull-Up',
    description: 'Bodyweight vertical pull',
    muscleGroups: JSON.stringify(['lats', 'biceps', 'rear delts']),
    equipment: JSON.stringify(['pull-up bar']),
    difficulty: 'intermediate'
  },
  {
    name: 'Chin-Up',
    description: 'Underhand grip vertical pull',
    muscleGroups: JSON.stringify(['lats', 'biceps']),
    equipment: JSON.stringify(['pull-up bar']),
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Row',
    description: 'Single arm back exercise',
    muscleGroups: JSON.stringify(['lats', 'biceps', 'rhomboids']),
    equipment: JSON.stringify(['dumbbells', 'bench']),
    difficulty: 'beginner'
  },
  {
    name: 'Lat Pulldown',
    description: 'Machine vertical pull',
    muscleGroups: JSON.stringify(['lats', 'biceps']),
    equipment: JSON.stringify(['lat pulldown machine']),
    difficulty: 'beginner'
  },
  // Shoulders
  {
    name: 'Overhead Press',
    description: 'Standing barbell shoulder press',
    muscleGroups: JSON.stringify(['shoulders', 'triceps', 'core']),
    equipment: JSON.stringify(['barbell']),
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Shoulder Press',
    description: 'Seated or standing dumbbell press',
    muscleGroups: JSON.stringify(['shoulders', 'triceps']),
    equipment: JSON.stringify(['dumbbells']),
    difficulty: 'beginner'
  },
  {
    name: 'Lateral Raise',
    description: 'Isolation movement for side delts',
    muscleGroups: JSON.stringify(['shoulders']),
    equipment: JSON.stringify(['dumbbells']),
    difficulty: 'beginner'
  },
  // Arms
  {
    name: 'Barbell Curl',
    description: 'Classic bicep exercise',
    muscleGroups: JSON.stringify(['biceps']),
    equipment: JSON.stringify(['barbell']),
    difficulty: 'beginner'
  },
  {
    name: 'Hammer Curl',
    description: 'Neutral grip curl targeting brachialis',
    muscleGroups: JSON.stringify(['biceps', 'brachialis']),
    equipment: JSON.stringify(['dumbbells']),
    difficulty: 'beginner'
  },
  {
    name: 'Tricep Pushdown',
    description: 'Cable isolation for triceps',
    muscleGroups: JSON.stringify(['triceps']),
    equipment: JSON.stringify(['cable machine']),
    difficulty: 'beginner'
  },
  // Core
  {
    name: 'Plank',
    description: 'Isometric core stabilization',
    muscleGroups: JSON.stringify(['core', 'shoulders']),
    equipment: JSON.stringify([]),
    difficulty: 'beginner'
  },
  {
    name: 'Hanging Leg Raise',
    description: 'Advanced core exercise',
    muscleGroups: JSON.stringify(['core', 'hip flexors']),
    equipment: JSON.stringify(['pull-up bar']),
    difficulty: 'advanced'
  },
  // Lower Body - Accessories
  {
    name: 'Leg Press',
    description: 'Machine-based quad movement',
    muscleGroups: JSON.stringify(['quadriceps', 'glutes']),
    equipment: JSON.stringify(['leg press machine']),
    difficulty: 'beginner'
  },
  {
    name: 'Leg Curl',
    description: 'Machine isolation for hamstrings',
    muscleGroups: JSON.stringify(['hamstrings']),
    equipment: JSON.stringify(['leg curl machine']),
    difficulty: 'beginner'
  },
  {
    name: 'Calf Raise',
    description: 'Isolation for calf muscles',
    muscleGroups: JSON.stringify(['calves']),
    equipment: JSON.stringify(['calf raise machine']),
    difficulty: 'beginner'
  },
  // Compound / Full Body
  {
    name: 'Clean and Press',
    description: 'Olympic lift variation',
    muscleGroups: JSON.stringify(['full body', 'shoulders', 'legs', 'core']),
    equipment: JSON.stringify(['barbell']),
    difficulty: 'advanced'
  },
  {
    name: 'Kettlebell Swing',
    description: 'Hip hinge cardio/strength movement',
    muscleGroups: JSON.stringify(['glutes', 'hamstrings', 'core', 'shoulders']),
    equipment: JSON.stringify(['kettlebell']),
    difficulty: 'intermediate'
  },
  {
    name: 'Goblet Squat',
    description: 'Squat with weight held at chest',
    muscleGroups: JSON.stringify(['quadriceps', 'glutes', 'core']),
    equipment: JSON.stringify(['dumbbell', 'kettlebell']),
    difficulty: 'beginner'
  }
];

async function main() {
  console.log('🌱 Seeding exercises...');
  
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise
    });
  }
  
  console.log(`✅ Seeded ${exercises.length} exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
