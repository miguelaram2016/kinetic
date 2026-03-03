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

// Create workout
workoutsRouter.post('/', async (req, res) => {
  const { userId, date, type, status, exercises } = req.body;
  
  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(date),
      type: type || 'strength',
      status: status || 'planned',
      exercises: exercises ? {
        create: exercises.map((e: any, idx: number) => ({
          exerciseId: e.exerciseId,
          order: idx,
          sets: e.sets || 3,
          reps: e.reps || 10,
          weight: e.weight
        }))
      } : undefined
    },
    include: {
      exercises: { include: { exercise: true } }
    }
  });
  
  res.status(201).json(workout);
});
