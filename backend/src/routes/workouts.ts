import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const workoutsRouter = Router();

// Get workouts for a user
workoutsRouter.get('/user/:userId', async (req, res) => {
  const workouts = await prisma.workout.findMany({
    where: { userId: req.params.userId },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { date: 'desc' }
  });
  res.json(workouts);
});

// Get single workout
workoutsRouter.get('/:id', async (req, res) => {
  const workout = await prisma.workout.findUnique({
    where: { id: req.params.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' }
      }
    }
  });
  
  if (!workout) {
    return res.status(404).json({ error: 'Workout not found' });
  }
  
  res.json(workout);
});

// Create workout (user or AI)
workoutsRouter.post('/', async (req, res) => {
  const { userId, date, type, status, name, exercises, source = 'user' } = req.body;
  
  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(date),
      type: type || 'strength',
      status: status || 'planned',
      name: name || 'Workout',
      source, // 'user' or 'ai'
      exercises: exercises ? {
        create: exercises.map((e: any, idx: number) => ({
          exerciseId: e.exerciseId,
          order: idx,
          sets: e.sets || 3,
          reps: e.reps || '10',
          weight: e.weight,
          rest: e.rest || 90,
          notes: e.notes
        }))
      } : undefined
    },
    include: {
      exercises: { include: { exercise: true } }
    }
  });
  
  res.status(201).json(workout);
});

// Update workout (edit by user or AI)
workoutsRouter.put('/:id', async (req, res) => {
  const { name, type, status, date, exercises } = req.body;
  
  // First delete existing exercises
  await prisma.workoutExercise.deleteMany({
    where: { workoutId: req.params.id }
  });
  
  // Then update workout with new exercises
  const workout = await prisma.workout.update({
    where: { id: req.params.id },
    data: {
      name,
      type,
      status,
      date: date ? new Date(date) : undefined,
      exercises: exercises ? {
        create: exercises.map((e: any, idx: number) => ({
          exerciseId: e.exerciseId,
          order: idx,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          rest: e.rest,
          notes: e.notes
        }))
      } : undefined
    },
    include: {
      exercises: { include: { exercise: true } }
    }
  });
  
  res.json(workout);
});

// Delete workout
workoutsRouter.delete('/:id', async (req, res) => {
  await prisma.workoutExercise.deleteMany({
    where: { workoutId: req.params.id }
  });
  
  await prisma.workout.delete({
    where: { id: req.params.id }
  });
  
  res.status(204).send();
});

// Add/edit single exercise in workout
workoutsRouter.post('/:id/exercises', async (req, res) => {
  const { exerciseId, order, sets, reps, weight, rest, notes } = req.body;
  
  const workoutExercise = await prisma.workoutExercise.create({
    data: {
      workoutId: req.params.id,
      exerciseId,
      order: order || 0,
      sets: sets || 3,
      reps: reps || '10',
      weight,
      rest: rest || 90,
      notes
    },
    include: { exercise: true }
  });
  
  res.status(201).json(workoutExercise);
});

// Update single exercise in workout
workoutsRouter.put('/:id/exercises/:exerciseId', async (req, res) => {
  const { sets, reps, weight, rest, notes, order } = req.body;
  
  const workoutExercise = await prisma.workoutExercise.update({
    where: { 
      id: req.params.exerciseId 
    },
    data: {
      sets,
      reps,
      weight,
      rest,
      notes,
      order
    },
    include: { exercise: true }
  });
  
  res.json(workoutExercise);
});

// Remove exercise from workout
workoutsRouter.delete('/:id/exercises/:exerciseId', async (req, res) => {
  await prisma.workoutExercise.delete({
    where: { id: req.params.exerciseId }
  });
  
  res.status(204).send();
});
