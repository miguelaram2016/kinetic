import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { exercisesRouter } from './routes/exercises.js';
import { workoutsRouter } from './routes/workouts.js';
import { checkInsRouter } from './routes/checkIns.js';
import { aiRouter } from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/check-ins', checkInsRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`🚀 Kinetic API running on http://localhost:${PORT}`);
});
