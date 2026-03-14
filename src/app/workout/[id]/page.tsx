'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkouts } from '@/lib/store';
import { Workout } from '@/lib/types';
import ExerciseDetail from '@/components/ExerciseDetail';
import VideoRecorder from '@/components/VideoRecorder';
import exercisesData from '@/data/exercises.json';

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
  const [expandedExercise, setExpandedExercise] = useState<{id: string, level: 'brief' | 'full'} | null>(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [hiddenSets, setHiddenSets] = useState<Record<string, boolean>>({});
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
    if (!startTimeRef.current || workout?.completed || isPaused) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [workout?.completed, isPaused]);

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

  const getTotalVolume = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((setAcc, set) => {
        return setAcc + (set.completed ? set.weight * set.reps : 0);
      }, 0);
    }, 0);
  };

  const getTotalReps = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((setAcc, set) => {
        return setAcc + (set.completed ? set.reps : 0);
      }, 0);
    }, 0);
  };

  const handleAddSet = (exerciseIndex: number) => {
    if (!workout) return;
    const newSets = [...workout.exercises];
    newSets[exerciseIndex].sets.push({
      id: `set-${Date.now()}`,
      weight: 0,
      reps: 0,
      completed: false,
    });
    setWorkout({ ...workout, exercises: newSets });
    updateWorkout(workout.id, { exercises: newSets });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;
    if (workout.exercises[exerciseIndex].sets.length <= 1) return;
    const newSets = [...workout.exercises];
    newSets[exerciseIndex].sets.splice(setIndex, 1);
    setWorkout({ ...workout, exercises: newSets });
    updateWorkout(workout.id, { exercises: newSets });
  };

  const handleAddExercise = (exerciseName: string) => {
    if (!workout) return;
    const newExercise = {
      id: `ex-${Date.now()}`,
      name: exerciseName,
      sets: [
        { id: `set-${Date.now()}-1`, weight: 0, reps: 0, completed: false },
        { id: `set-${Date.now()}-2`, weight: 0, reps: 0, completed: false },
        { id: `set-${Date.now()}-3`, weight: 0, reps: 0, completed: false },
      ],
    };
    const newExercises = [...workout.exercises, newExercise];
    setWorkout({ ...workout, exercises: newExercises });
    updateWorkout(workout.id, { exercises: newExercises });
    setShowAddExercise(false);
    setExerciseSearch('');
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
        <div className="text-left sm:text-right space-y-1">
          <div className="flex items-center gap-2 sm:justify-end">
            <p className="text-gray-400 text-sm">Duration</p>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 rounded text-gray-400 hover:text-white"
            >
              {isPaused ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
          </div>
          <p className="text-lg md:text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
          {getTotalVolume() > 0 && (
            <p className="text-sm text-gray-400">{getTotalVolume().toLocaleString()} lbs • {getTotalReps()} reps</p>
          )}
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
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(() => {
                      const ex = exercisesData.exercises.find((e: any) => e.name === exercise.name);
                      return ex ? ex.equipment.slice(0, 3).map((eq: string) => (
                        <span key={eq} className="text-xs px-2 py-0.5 bg-dark-600 text-gray-400 rounded">{eq}</span>
                      )) : null;
                    })()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!expandedExercise || expandedExercise.id !== exercise.id) {
                      setExpandedExercise({ id: exercise.id, level: 'brief' });
                    } else if (expandedExercise.level === 'brief') {
                      setExpandedExercise({ id: exercise.id, level: 'full' });
                    } else {
                      setExpandedExercise(null);
                    }
                  }}
                  className="text-primary hover:text-primary-400 text-sm flex items-center gap-1"
                >
                  {expandedExercise?.id === exercise.id ? (expandedExercise.level === 'full' ? '▼ Less' : '▲ More') : '▲ Expand'}
                </button>
              </div>
            </div>

            {/* Exercise Details - Brief (level: 'brief') */}
            {expandedExercise?.id === exercise.id && expandedExercise.level === 'brief' && (
              <div className="p-4 border-b border-dark-700 bg-dark-800/50">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(() => {
                    const ex = exercisesData.exercises.find((e: any) => e.name === exercise.name);
                    return ex ? (
                      <>
                        {ex.muscleGroups.slice(0, 2).map((m: string) => (
                          <span key={m} className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">{m}</span>
                        ))}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ex.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                          ex.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>{ex.difficulty}</span>
                      </>
                    ) : null;
                  })()}
                </div>
                <p className="text-gray-400 text-xs">{exercise.sets.length} sets × {exercise.sets[0]?.reps || 0} reps</p>
              </div>
            )}

            {/* Exercise Details - Full (level: 'full') */}
            {expandedExercise?.id === exercise.id && expandedExercise.level === 'full' && (
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
                    {/* Sets hidden - only show when not hidden */}
                    {!hiddenSets[exercise.id] && (
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
                    )}
                    
                    {/* Desktop layout */}
                    {!hiddenSets[exercise.id] && (
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
                    )}

                    {/* Mobile inputs */}
                    {!hiddenSets[exercise.id] && (
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
                    )}
                  </div>
                ))}
                
                {/* Set Management */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-dark-700">
                  <button
                    onClick={() => handleAddSet(exerciseIndex)}
                    className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    + Add Set
                  </button>
                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => handleRemoveSet(exerciseIndex, exercise.sets.length - 1)}
                      className="px-4 py-2 bg-dark-700 hover:bg-red-900/30 text-gray-400 hover:text-red-400 text-sm font-medium rounded-lg transition-colors"
                    >
                      - Remove
                    </button>
                  )}
                  <button
                    onClick={() => setHiddenSets(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                    className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-gray-400 text-sm rounded-lg transition-colors"
                  >
                    {hiddenSets[exercise.id] ? 'Show' : 'Hide'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Exercise Button */}
        <button
          onClick={() => setShowAddExercise(true)}
          className="w-full py-4 border-2 border-dashed border-dark-600 hover:border-primary rounded-xl text-gray-400 hover:text-primary font-medium transition-colors"
        >
          + Add Another Exercise
        </button>
      </div>

      {/* Video Recording Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={() => setShowVideoRecorder(true)}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
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

      {/* Video Recorder Modal */}
      {showVideoRecorder && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-4 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Record Your Set</h3>
              <button
                onClick={() => setShowVideoRecorder(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <VideoRecorder 
              onVideoRecorded={(blob) => {
                // Save video to localStorage
                const reader = new FileReader();
                reader.onloadend = () => {
                  const videos = JSON.parse(localStorage.getItem('kinetic_videos') || '[]');
                  videos.push({
                    data: reader.result,
                    workoutId: workout?.id,
                    exercise: workout?.exercises[0]?.name || 'Custom Exercise',
                    date: new Date().toISOString()
                  });
                  localStorage.setItem('kinetic_videos', JSON.stringify(videos));
                };
                reader.readAsDataURL(blob);
                setShowVideoRecorder(false);
                alert('Video saved! You can review it in your workout history.');
              }} 
            />
          </div>
        </div>
      )}

      {showAddExercise && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-4 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Exercise</h3>
              <button
                onClick={() => { setShowAddExercise(false); setExerciseSearch(''); }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex-1 overflow-y-auto space-y-2">
              {exercisesData.exercises
                .filter((e: any) => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
                .slice(0, 20)
                .map((exercise: any) => (
                  <button
                    key={exercise.name}
                    onClick={() => handleAddExercise(exercise.name)}
                    className="w-full p-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-left transition-colors"
                  >
                    <p className="text-white font-medium">{exercise.name}</p>
                    <p className="text-gray-500 text-sm">{exercise.equipment.slice(0, 2).join(', ')}</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
