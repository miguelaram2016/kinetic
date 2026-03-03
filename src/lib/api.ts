const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Types
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: 'planned' | 'completed' | 'incomplete';
  date: string;
  source: 'user' | 'ai';
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: string;
  weight?: number;
  rest?: number;
  notes?: string;
  exercise?: Exercise;
}

export interface UserProfile {
  id: string;
  userId: string;
  goals: string[];
  experienceLevel: string;
  daysPerWeek: number;
  splitPreference: string;
  injuries: string[];
}

export interface DailyCheckIn {
  energy: number;
  sleep: number;
  stress: number;
  nutrition: 'on_point' | 'mid' | 'struggling';
  soreness: number;
  notes?: string;
}

// API Functions
export const api = {
  // Health
  health: () => fetchAPI<{ status: string }>('/health'),

  // Exercises
  exercises: {
    list: () => fetchAPI<Exercise[]>('/exercises'),
    get: (id: string) => fetchAPI<Exercise>(`/exercises/${id}`),
  },

  // Workouts
  workouts: {
    list: (userId: string) => fetchAPI<Workout[]>(`/workouts/user/${userId}`),
    get: (id: string) => fetchAPI<Workout>(`/workouts/${id}`),
    create: (data: {
      userId: string;
      name: string;
      type: string;
      date?: string;
      exercises?: Partial<WorkoutExercise>[];
      source?: 'user' | 'ai';
    }) => fetchAPI<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Workout>) => fetchAPI<Workout>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchAPI<void>(`/workouts/${id}`, {
      method: 'DELETE',
    }),
    addExercise: (workoutId: string, exercise: Partial<WorkoutExercise>) =>
      fetchAPI<WorkoutExercise>(`/workouts/${workoutId}/exercises`, {
        method: 'POST',
        body: JSON.stringify(exercise),
      }),
    updateExercise: (workoutId: string, exerciseId: string, data: Partial<WorkoutExercise>) =>
      fetchAPI<WorkoutExercise>(`/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    removeExercise: (workoutId: string, exerciseId: string) =>
      fetchAPI<void>(`/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'DELETE',
      }),
  },

  // AI
  ai: {
    generateWorkout: (userId: string, checkIn?: DailyCheckIn) =>
      fetchAPI<Workout>('/ai/generate-workout', {
        method: 'POST',
        body: JSON.stringify({ userId, checkIn }),
      }),
    feedback: (workoutId: string, feedback: {
      difficulty: number;
      energy: number;
      completed: boolean;
      notes?: string;
    }) => fetchAPI<{ adjustments: string; reasoning: string }>('/ai/feedback', {
      method: 'POST',
      body: JSON.stringify({ workoutId, ...feedback }),
    }),
    chat: (userId: string, message: string) =>
      fetchAPI<{ response: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ userId, message }),
      }),
    checkInRecommendation: (checkIn: DailyCheckIn) =>
      fetchAPI<{ recommendation: string; reason: string }>('/ai/checkin-recommendation', {
        method: 'POST',
        body: JSON.stringify(checkIn),
      }),
  },

  // Check-ins
  checkIns: {
    create: (userId: string, data: DailyCheckIn) =>
      fetchAPI<any>('/check-ins', {
        method: 'POST',
        body: JSON.stringify({ userId, ...data }),
      }),
    list: (userId: string) =>
      fetchAPI<any[]>(`/check-ins/user/${userId}`),
  },

  // User Profile
  profile: {
    get: (userId: string) => fetchAPI<UserProfile>(`/profile/${userId}`),
    update: (userId: string, data: Partial<UserProfile>) =>
      fetchAPI<UserProfile>(`/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
