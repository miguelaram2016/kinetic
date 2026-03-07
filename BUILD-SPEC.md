# Kinetic Fitness App - Build Spec

## Project Overview
Full-featured training app dashboard similar to Strong, Hevy, Fitbod.
- **Persistence:** localStorage (no backend)
- **Stack:** Next.js 14, TypeScript, Tailwind CSS

## Core Features

### 1. Dashboard (`/`)
- Upcoming workout card (next scheduled)
- Quick stats: workouts this week, streak, total volume
- "Start Workout" button
- Recent activity feed (last 5 workouts)

### 2. Calendar (`/calendar`)
- Monthly view with workout indicators
- Click date to see workout details
- Schedule/reschedule workouts

### 3. Weight Tracking (`/weight`)
- Log body weight with date picker
- Chart showing progress over time
- History list view

### 4. Food Log (`/food`)
- Quick food entry (name, calories, protein, carbs, fats)
- Daily totals summary
- History view by date

### 5. Training Programs (`/programs`)
- Phase-based programs (Week 1-4, etc.)
- Each phase has multiple workouts
- Progress tracking through phases
- Mark workouts complete

### 6. Workout Execution (`/workout/[id]`)
- Exercise list with sets × reps
- Weight input per set
- Rest timer (configurable)
- Mark sets complete
- Save workout when done

## Data Models

```typescript
interface Workout {
  id: string;
  name: string;
  scheduledDate: string; // ISO date
  exercises: Exercise[];
  completed: boolean;
  completedAt?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  reps: number;
  weight: number;
  completed: boolean;
}

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface TrainingProgram {
  id: string;
  name: string;
  phases: ProgramPhase[];
  currentPhase: number;
}

interface ProgramPhase {
  name: string; // "Week 1"
  workouts: string[]; // workout IDs
}
```

## Routes Structure

```
/                    → Dashboard
/calendar            → Calendar view
/weight              → Weight tracking
/food                → Food log
/programs            → Training programs
/workout/[id]        → Workout execution
```

## Components to Build
- Sidebar navigation
- Stats cards
- Workout card
- Calendar grid
- Weight chart
- Food entry form
- Exercise set row
- Rest timer modal
- Program phase selector
