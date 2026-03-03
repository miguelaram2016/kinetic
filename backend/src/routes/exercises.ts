import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const exercisesRouter = Router();

// Get all exercises
exercisesRouter.get('/', async (_req, res) => {
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(exercises);
});

// Get single exercise
exercisesRouter.get('/:id', async (req, res) => {
  const exercise = await prisma.exercise.findUnique({
    where: { id: req.params.id }
  });
  
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  
  res.json(exercise);
});
