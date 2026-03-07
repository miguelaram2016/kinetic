'use client';

import { useState, useEffect, useCallback } from 'react';
import { Workout, WeightEntry, FoodEntry, TrainingProgram, UserStats, generateId } from '../types';

const STORAGE_KEYS = {
  workouts: 'kinetic_workouts',
  weight: 'kinetic_weight',
  food: 'kinetic_food',
  programs: 'kinetic_programs',
  stats: 'kinetic_stats',
};

// Generic storage helper
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Workouts Store
export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWorkouts(getFromStorage(STORAGE_KEYS.workouts, []));
    setLoading(false);
  }, []);

  const addWorkout = useCallback((workout: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = { ...workout, id: generateId() };
    setWorkouts(prev => {
      const updated = [...prev, newWorkout];
      setToStorage(STORAGE_KEYS.workouts, updated);
      return updated;
    });
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setWorkouts(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, ...updates } : w);
      setToStorage(STORAGE_KEYS.workouts, updated);
      return updated;
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      setToStorage(STORAGE_KEYS.workouts, updated);
      return updated;
    });
  }, []);

  const completeWorkout = useCallback((id: string, duration: number) => {
    setWorkouts(prev => {
      const updated = prev.map(w => 
        w.id === id 
          ? { ...w, completed: true, completedAt: new Date().toISOString(), duration }
          : w
      );
      setToStorage(STORAGE_KEYS.workouts, updated);
      return updated;
    });
  }, []);

  return { workouts, loading, addWorkout, updateWorkout, deleteWorkout, completeWorkout };
}

// Weight Store
export function useWeight() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(getFromStorage(STORAGE_KEYS.weight, []));
    setLoading(false);
  }, []);

  const addEntry = useCallback((weight: number, date: string) => {
    const newEntry: WeightEntry = { id: generateId(), date, weight };
    setEntries(prev => {
      // Remove existing entry for same date if exists
      const filtered = prev.filter(e => e.date !== date);
      const updated = [...filtered, newEntry].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setToStorage(STORAGE_KEYS.weight, updated);
      return updated;
    });
    return newEntry;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      setToStorage(STORAGE_KEYS.weight, updated);
      return updated;
    });
  }, []);

  return { entries, loading, addEntry, deleteEntry };
}

// Food Store
export function useFood() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(getFromStorage(STORAGE_KEYS.food, []));
    setLoading(false);
  }, []);

  const addEntry = useCallback((entry: Omit<FoodEntry, 'id'>) => {
    const newEntry: FoodEntry = { ...entry, id: generateId() };
    setEntries(prev => {
      const updated = [...prev, newEntry];
      setToStorage(STORAGE_KEYS.food, updated);
      return updated;
    });
    return newEntry;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      setToStorage(STORAGE_KEYS.food, updated);
      return updated;
    });
  }, []);

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  return { entries, loading, addEntry, deleteEntry, getEntriesForDate };
}

// Programs Store
export function usePrograms() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPrograms(getFromStorage(STORAGE_KEYS.programs, []));
    setLoading(false);
  }, []);

  const addProgram = useCallback((program: Omit<TrainingProgram, 'id' | 'startedAt'>) => {
    const newProgram: TrainingProgram = { 
      ...program, 
      id: generateId(), 
      startedAt: new Date().toISOString() 
    };
    setPrograms(prev => {
      const updated = [...prev, newProgram];
      setToStorage(STORAGE_KEYS.programs, updated);
      return updated;
    });
    return newProgram;
  }, []);

  const updateProgram = useCallback((id: string, updates: Partial<TrainingProgram>) => {
    setPrograms(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      setToStorage(STORAGE_KEYS.programs, updated);
      return updated;
    });
  }, []);

  const deleteProgram = useCallback((id: string) => {
    setPrograms(prev => {
      const updated = prev.filter(p => p.id !== id);
      setToStorage(STORAGE_KEYS.programs, updated);
      return updated;
    });
  }, []);

  return { programs, loading, addProgram, updateProgram, deleteProgram };
}

// Stats Calculator
export function useStats(workouts: Workout[]) {
  const [stats, setStats] = useState<UserStats>({
    workoutsThisWeek: 0,
    streak: 0,
    totalVolume: 0,
    totalWorkouts: 0,
  });

  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = workouts.filter(
      w => w.completed && new Date(w.completedAt!) >= startOfWeek
    );

    // Calculate streak
    let streak = 0;
    const sortedCompleted = [...workouts]
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    
    if (sortedCompleted.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = today;
      
      // Check if worked out today or yesterday to start streak
      const lastWorkout = new Date(sortedCompleted[0].completedAt!);
      lastWorkout.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        streak = 1;
        checkDate = new Date(lastWorkout);
        checkDate.setDate(checkDate.getDate() - 1);
        
        for (let i = 1; i < sortedCompleted.length; i++) {
          const workoutDate = new Date(sortedCompleted[i].completedAt!);
          workoutDate.setHours(0, 0, 0, 0);
          
          const diff = Math.floor((checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diff <= 1) {
            streak++;
            if (diff === 1) {
              checkDate = new Date(workoutDate);
              checkDate.setDate(checkDate.getDate() - 1);
            }
          } else {
            break;
          }
        }
      }
    }

    // Calculate total volume
    let totalVolume = 0;
    workouts.forEach(workout => {
      if (workout.completed && workout.exercises) {
        workout.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.completed) {
              totalVolume += set.weight * set.reps;
            }
          });
        });
      }
    });

    setStats({
      workoutsThisWeek: thisWeekWorkouts.length,
      streak,
      totalVolume,
      totalWorkouts: workouts.filter(w => w.completed).length,
    });
  }, [workouts]);

  return stats;
}
