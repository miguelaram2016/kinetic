import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { generateWorkout, processFeedback, chatWithCoach, type UserProfile, type DailyCheckIn } from '../services/ai.js';

export const aiRouter = Router();

// Generate a workout for user
aiRouter.post('/generate-workout', async (req, res) => {
  try {
    const { userId, checkIn } = req.body;
    
    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) {
      return res.status(400).json({ error: 'User profile not found. Complete onboarding first.' });
    }
    
    // Get user's equipment
    const userEquipment = await prisma.userEquipment.findMany({
      where: { userId }
    });
    
    const equipment = userEquipment.map(e => e.equipmentType);
    
    // Build user profile for AI
    const userProfile: UserProfile = {
      goals: profile.goals as string[] || [],
      experienceLevel: profile.experienceLevel || 'intermediate',
      equipment,
      daysPerWeek: profile.daysPerWeek || 3,
      splitPreference: profile.splitPreference || 'full_body',
      injuries: profile.injuries as string[] || []
    };
    
    // Generate workout
    const workout = await generateWorkout(userProfile, checkIn);
    
    // Map exercise names to IDs from our database
    const exercises = await prisma.exercise.findMany({
      where: {
        name: {
          in: workout.exercises.map(e => e.exerciseName)
        }
      }
    });
    
    // Create a map for matching
    const exerciseMap = new Map(exercises.map(e => [e.name.toLowerCase(), e.id]));
    
    // Match exercises
    const workoutExercises = workout.exercises.map((e, idx) => {
      const exerciseId = exerciseMap.get(e.exerciseName.toLowerCase());
      return {
        exerciseId: exerciseId || exercises[0]?.id, // fallback to first
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
        notes: e.notes,
        order: idx
      };
    }).filter(e => e.exerciseId);
    
    // Save the generated workout
    const savedWorkout = await prisma.workout.create({
      data: {
        userId,
        name: workout.name,
        type: workout.type,
        status: 'planned',
        date: new Date(),
        source: 'ai',
        exercises: {
          create: workoutExercises
        }
      },
      include: {
        exercises: {
          include: { exercise: true }
        }
      }
    });
    
    res.json(savedWorkout);
  } catch (error) {
    console.error('Generate workout error:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

// Process workout feedback
aiRouter.post('/feedback', async (req, res) => {
  try {
    const { workoutId, difficulty, energy, completed, notes } = req.body;
    
    const result = await processFeedback(workoutId, { difficulty, energy, completed, notes });
    
    // Save feedback to database
    await prisma.workout.update({
      where: { id: workoutId },
      data: {
        status: completed ? 'completed' : 'incomplete',
        notes: notes
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

// Chat with AI coach
aiRouter.post('/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // Get user context
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    const recentWorkouts = await prisma.workout.findMany({
      where: { userId },
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        exercises: {
          include: { exercise: true }
        }
      }
    });
    
    const context = {
      profile: profile ? {
        goals: profile.goals as string[],
        experienceLevel: profile.experienceLevel,
        equipment: [],
        daysPerWeek: profile.daysPerWeek,
        splitPreference: profile.splitPreference,
        injuries: profile.injuries as string[]
      } : undefined,
      recentWorkouts
    };
    
    const response = await chatWithCoach(message, context);
    
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to chat with coach' });
  }
});

// Get recommendation based on check-in
aiRouter.post('/checkin-recommendation', async (req, res) => {
  try {
    const { energy, sleep, stress, nutrition, soreness } = req.body;
    
    // Simple logic - could be AI-powered later
    let recommendation: 'full_workout' | 'light_workout' | 'rest_day' | 'active_recovery';
    let reason: string;
    
    if (energy <= 2 || stress >= 4) {
      recommendation = 'rest_day';
      reason = 'Your energy is low or stress is high. Rest is productive too.';
    } else if (soreness >= 4) {
      recommendation = 'active_recovery';
      reason = 'High soreness - let your muscles recover with light movement.';
    } else if (energy >= 4 && soreness <= 2) {
      recommendation = 'full_workout';
      reason = 'You\'re feeling great! Time to crush it.';
    } else {
      recommendation = 'light_workout';
      reason = 'A moderate workout should feel right today.';
    }
    
    res.json({ recommendation, reason });
  } catch (error) {
    console.error('Check-in recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});
