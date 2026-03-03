import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const checkInsRouter = Router();

// Get check-ins for a user
checkInsRouter.get('/user/:userId', async (req, res) => {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId: req.params.userId },
    orderBy: { date: 'desc' }
  });
  res.json(checkIns);
});

// Create check-in
checkInsRouter.post('/', async (req, res) => {
  const { userId, date, energy, sleep, stress, nutrition, soreness, notes } = req.body;
  
  const checkIn = await prisma.checkIn.create({
    data: {
      userId,
      date: new Date(date || Date.now()),
      energy,
      sleep,
      stress,
      nutrition,
      soreness,
      notes
    }
  });
  
  res.status(201).json(checkIn);
});
