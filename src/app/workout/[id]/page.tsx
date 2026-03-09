'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkouts } from '@/lib/store';
import { Workout } from '@/lib/types';
import ExerciseDetail from '@/components/ExerciseDetail';

const getWorkoutTimerKey = (workoutId: string) => `kinetic_workout_start_${workoutId}`;

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const { workouts, updateWorkout, completeWorkout } = useWorkouts();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load persisted start time from localStorage
  const loadPersistedStartTime = useCallback((workoutId: string) => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(getWorkoutTimerKey(workoutId));
    return saved ? parseInt(saved, 10) : null;
  }, []);

  // Persist start time to localStorage
  const persistStartTime = useCallback((workoutId: string, startTime: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getWorkoutTimerKey(workoutId), startTime.toString());
  }, []);

  // Clear persisted start time
  const clearPersistedStartTime = useCallback((workoutId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getWorkoutTimerKey(workoutId));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !params.id) return;
    
    const found = workouts.find(w => w.id === params.id);
    if (found) {
      setWorkout(found);
      
      // Check for persisted start time first
      const savedStartTime = loadPersistedStartTime(found.id);
      
      if (!found.completed) {
        if (savedStartTime) {
          // Resume existing timer
          startTimeRef.current = savedStartTime;
        } else if (!startTimeRef.current) {
          // Start new timer
          const now = Date.now();
          startTimeRef.current = now;
          persistStartTime(found.id, now);
        }
      }
    }
  }, [mounted, params.id, workouts, loadPersistedStartTime, persistStartTime]);

  useEffect(() => {
    if (!startTimeRef.current || workout?.completed) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workout?.completed]);

  useEffect(() => {
    if (showRestTimer && restRemaining > 0) {
      const interval = setInterval(() => {
        setRestRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowRestTimer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showRestTimer, restRemaining]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-4">Workout not found</h2>
        <Link href="/calendar" className="text-primary hover:text-primary-400">
          Go back to calendar
        </Link>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;
    
    const newExercises = [...workout.exercises];
    const newSets = [...newExercises[exerciseIndex].sets];
    const wasCompleted = newSets[setIndex].completed;
    newSets[setIndex] = { ...newSets[setIndex], completed: !wasCompleted };
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets: newSets };
    
    setWorkout({ ...workout, exercises: newExercises });
    updateWorkout(workout.id, { exercises: newExercises });
    
    // Start rest timer when completing a set (not when uncompleting)
    if (!wasCompleted) {
      setRestRemaining(restTime);
      setShowRestTimer(true);
    }
  };

  const handleWeightChange = (exerciseIndex: number, setIndex: number, weight: number) => {
    if (!workout) return;
    
    const newExercises = [...workout.exercises];
    const newSets = [...newExercises[exerciseIndex].sets];
    newSets[setIndex] = { ...newSets[setIndex], weight };
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets: newSets };
    
    setWorkout({ ...workout, exercises: newExercises });
    updateWorkout(workout.id, { exercises: newExercises });
  };

  const handleRepsChange = (exerciseIndex: number, setIndex: number, reps: number) => {
    if (!workout) return;
    
    const newExercises = [...workout.exercises];
    const newSets = [...newExercises[exerciseIndex].sets];
    newSets[setIndex] = { ...newSets[setIndex], reps };
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets: newSets };
    
    setWorkout({ ...workout, exercises: newExercises });
    updateWorkout(workout.id, { exercises: newExercises });
  };

  const handleFinishWorkout = () => {
    if (!workout) return;
    
    const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 60000) : elapsedTime / 60;
    clearPersistedStartTime(workout.id);
    completeWorkout(workout.id, duration);
    startTimeRef.current = null;
    router.push('/');
  };

  const getCompletedSets = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((acc, ex) => 
      acc + ex.sets.filter(s => s.completed).length, 0
    );
  };

  const getTotalSets = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  };

  const progress = getTotalSets() > 0 ? (getCompletedSets() / getTotalSets()) * 100 : 0;

  if (workout.completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Workout Complete!</h2>
        <p className="text-gray-400 mb-6">{workout.name}</p>
        
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-2xl font-bold text-white">{workout.duration || 0} min</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Exercises</p>
              <p className="text-2xl font-bold text-white">{workout.exercises.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sets</p>
              <p className="text-2xl font-bold text-white">{getCompletedSets()}</p>
            </div>
          </div>
        </div>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div>
          <Link href="/calendar" className="text-gray-500 hover:text-gray-400 text-sm mb-1 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Calendar
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-white">{workout.name}</h1>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-gray-400 text-sm">Duration</p>
          <p className="text-lg md:text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Progress</span>
          <span className="text-white text-sm font-medium">
            {getCompletedSets()} / {getTotalSets()} sets
          </span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
            <div className="p-4 bg-dark-700/50 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exercise.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {exercise.sets.filter(s => s.completed).length} / {exercise.sets.length} sets completed
                  </p>
                </div>
                <button
                  onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                  className="text-primary hover:text-primary-400 text-sm flex items-center gap-1"
                >
                  {expandedExercise === exercise.id ? 'Hide' : 'Show'} details
                </button>
              </div>
            </div>

            {/* Exercise Details */}
            {expandedExercise === exercise.id && (
              <div className="p-4 border-b border-dark-700 bg-dark-800/50">
                <ExerciseDetail exerciseName={exercise.name} compact />
              </div>
            )}
            
            <div className="p-4">
              <div className="hidden md:grid md:grid-cols-5 gap-2 text-sm text-gray-500 mb-2">
                <div className="text-center">SET</div>
                <div className="text-center">PREVIOUS</div>
                <div className="text-center">WEIGHT</div>
                <div className="text-center">REPS</div>
                <div className="text-center">✓</div>
              </div>
              
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`${set.completed ? 'bg-green-500/10' : 'bg-dark-700/30'} rounded-xl p-3 transition-colors`}
                  >
                    {/* Mobile layout */}
                    <div className="flex items-center justify-between mb-2 md:hidden">
                      <span className={`text-sm font-medium ${set.completed ? 'text-green-400' : 'text-gray-400'}`}>
                        Set {setIndex + 1}
                      </span>
                      <button
                        onClick={() => handleSetComplete(exerciseIndex, setIndex)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          set.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-dark-700 text-gray-500 hover:bg-dark-600'
                        }`}
                      >
                        {set.completed ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs">{setIndex + 1}</span>
                        )}
                      </button>
                    </div>
                    
                    {/* Desktop layout */}
                    <div className="hidden md:grid md:grid-cols-5 gap-2 items-center">
                      <div className="text-center">
                        <span className={`text-sm font-medium ${set.completed ? 'text-green-400' : 'text-gray-400'}`}>
                          {setIndex + 1}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500 text-sm">--</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleWeightChange(exerciseIndex, setIndex, parseFloat(e.target.value) || 0)}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-2 py-2 text-center text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleRepsChange(exerciseIndex, setIndex, parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-2 py-2 text-center text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleSetComplete(exerciseIndex, setIndex)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            set.completed
                              ? 'bg-green-500 text-white'
                              : 'bg-dark-700 text-gray-500 hover:bg-dark-600'
                          }`}
                        >
                          {set.completed ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm">{setIndex + 1}</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile inputs */}
                    <div className="grid grid-cols-2 gap-2 md:hidden">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Weight</label>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleWeightChange(exerciseIndex, setIndex, parseFloat(e.target.value) || 0)}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-center text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Reps</label>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleRepsChange(exerciseIndex, setIndex, parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-center text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 sticky bottom-4">
        <button
          onClick={handleFinishWorkout}
          disabled={getCompletedSets() === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            getCompletedSets() > 0
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-dark-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Finish Workout
        </button>
      </div>

      {showRestTimer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8 text-center w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Rest Timer</h3>
            <p className="text-6xl font-bold text-primary mb-6">{formatTime(restRemaining)}</p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setRestTime(30)}
                className={`w-full py-2 rounded-lg transition-colors ${
                  restTime === 30 ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'
                }`}
              >
                30s
              </button>
              <button
                onClick={() => setRestTime(60)}
                className={`w-full py-2 rounded-lg transition-colors ${
                  restTime === 60 ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'
                }`}
              >
                60s
              </button>
              <button
                onClick={() => setRestTime(90)}
                className={`w-full py-2 rounded-lg transition-colors ${
                  restTime === 90 ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'
                }`}
              >
                90s
              </button>
              <button
                onClick={() => setRestTime(120)}
                className={`w-full py-2 rounded-lg transition-colors ${
                  restTime === 120 ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400'
                }`}
              >
                120s
              </button>
            </div>
            
            <button
              onClick={() => setShowRestTimer(false)}
              className="w-full bg-dark-700 hover:bg-dark-600 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
