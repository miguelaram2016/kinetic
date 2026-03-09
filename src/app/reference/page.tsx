'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import exercisesData from '@/data/exercises.json';
import programsData from '@/data/programs.json';
import workoutsData from '@/data/workouts.json';
import { usePrograms } from '@/lib/store';

type Tab = 'exercises' | 'programs' | 'workouts';

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: string;
  instructions: string[];
  tips: string[];
  videoUrl?: string;
  movementPattern: string[];
  caloriesPerMinute?: number;
}

interface Program {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  phases: {
    name: string;
    durationWeeks: number;
    workouts: string[];
    notes?: string;
  }[];
  currentPhase?: number;
  startedAt?: string;
  active?: boolean;
}

interface WorkoutTemplate {
  id: string;
  userId?: string;
  name: string;
  type: string;
  date?: string;
  status?: string;
  source?: string;
  exercises: {
    id: string;
    exerciseId: string;
    order: number;
    sets: number;
    reps: string;
    weight: number | null;
    rest: number;
    notes: string;
  }[];
  completedAt?: string | null;
  duration?: number | null;
}

// Get unique values for filters
const allMuscleGroups = Array.from(
  new Set(exercisesData.exercises.flatMap((e: { muscleGroups: string[] }) => e.muscleGroups))
).sort();

const allEquipment = Array.from(
  new Set(exercisesData.exercises.flatMap((e: { equipment: string[] }) => e.equipment))
).sort();

const difficulties = ['beginner', 'intermediate', 'advanced'];

export default function ReferencePage() {
  const router = useRouter();
  const { programs: userPrograms, addProgram, updateProgram } = usePrograms();
  const [activeTab, setActiveTab] = useState<Tab>('exercises');
  const [mounted, setMounted] = useState(false);
  
  // Exercise filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    // Load favorites from localStorage
    const saved = localStorage.getItem('kinetic_exercise_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (exerciseId: string) => {
    const newFavorites = favorites.includes(exerciseId)
      ? favorites.filter(id => id !== exerciseId)
      : [...favorites, exerciseId];
    setFavorites(newFavorites);
    localStorage.setItem('kinetic_exercise_favorites', JSON.stringify(newFavorites));
  };

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercisesData.exercises.filter((exercise: Exercise) => {
      const matchesSearch = !searchQuery || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscleGroup = !selectedMuscleGroup || 
        exercise.muscleGroups.includes(selectedMuscleGroup);
      const matchesEquipment = !selectedEquipment || 
        exercise.equipment.includes(selectedEquipment);
      const matchesDifficulty = !selectedDifficulty || 
        exercise.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesDifficulty;
    });
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty]);

  // Get exercise by ID
  const getExerciseById = (id: string): Exercise | undefined => {
    return exercisesData.exercises.find((e: Exercise) => e.id === id);
  };

  // Get workout name from workout template
  const getWorkoutById = (id: string): WorkoutTemplate | undefined => {
    return workoutsData.workouts.find((w: WorkoutTemplate) => w.id === id);
  };

  const programTemplates = programsData.programs as Program[];
  const workoutTemplates = workoutsData.workouts as WorkoutTemplate[];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reference</h1>
        <p className="text-gray-400 mt-1">Browse exercises, programs, and workouts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['exercises', 'programs', 'workouts'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Exercises Tab */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-primary"
              >
                <option value="">All Muscle Groups</option>
                {allMuscleGroups.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg.charAt(0).toUpperCase() + mg.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-primary"
              >
                <option value="">All Equipment</option>
                {allEquipment.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq.charAt(0).toUpperCase() + eq.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-primary"
              >
                <option value="">All Difficulties</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>

              {(selectedMuscleGroup || selectedEquipment || selectedDifficulty || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMuscleGroup('');
                    setSelectedEquipment('');
                    setSelectedDifficulty('');
                  }}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-xl hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-400 text-sm">
            Showing {filteredExercises.length} of {exercisesData.exercises.length} exercises
          </p>

          {/* Exercise List */}
          {selectedExercise ? (
            // Exercise Detail View
            <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
              <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to list
                </button>
                <button
                  onClick={() => toggleFavorite(selectedExercise.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.includes(selectedExercise.id)
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill={favorites.includes(selectedExercise.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedExercise.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedExercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      selectedExercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedExercise.difficulty}
                    </span>
                    {selectedExercise.equipment.map((eq) => (
                      <span key={eq} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Muscle Groups */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Primary Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.muscleGroups.map((mg) => (
                      <span key={mg} className="px-3 py-1 bg-dark-700 text-gray-300 rounded-lg text-sm">
                        {mg}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Secondary Muscles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((mg) => (
                        <span key={mg} className="px-3 py-1 bg-dark-700 text-gray-400 rounded-lg text-sm">
                          {mg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Instructions</h3>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                          {idx + 1}
                        </span>
                        <span className="text-gray-300">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {selectedExercise.tips.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tips</h3>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Video Link */}
                {selectedExercise.videoUrl && (
                  <a
                    href={selectedExercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Watch Video Tutorial
                  </a>
                )}
              </div>
            </div>
          ) : (
            // Exercise List View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise: Exercise) => (
                <div
                  key={exercise.id}
                  className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold">{exercise.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(exercise.id);
                      }}
                      className={`p-1 ${
                        favorites.includes(exercise.id)
                          ? 'text-red-500'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={favorites.includes(exercise.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscleGroups.slice(0, 2).map((mg) => (
                      <span key={mg} className="text-xs px-2 py-0.5 bg-primary/20 text-primary-300 rounded">
                        {mg}
                      </span>
                    ))}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No exercises match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMuscleGroup('');
                  setSelectedEquipment('');
                  setSelectedDifficulty('');
                }}
                className="mt-4 text-primary hover:text-primary-400"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {programTemplates.length > 0 ? (
            programTemplates.map((program) => (
              <div
                key={program.id}
                className="bg-dark-800 rounded-xl border border-dark-700 p-4 md:p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{program.name}</h3>
                    {program.description && (
                      <p className="text-gray-400 mt-1">{program.description}</p>
                    )}
                  </div>
                  {program.active && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      Active
                    </span>
                  )}
                </div>

                {/* Phases */}
                <div className="space-y-4">
                  {program.phases.map((phase, idx) => (
                    <div key={idx} className="bg-dark-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{phase.name}</h4>
                        <span className="text-gray-400 text-sm">{phase.durationWeeks} weeks</span>
                      </div>
                      {phase.notes && (
                        <p className="text-gray-500 text-sm mb-2">{phase.notes}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {phase.workouts.map((woId) => {
                          const workout = getWorkoutById(woId);
                          return workout ? (
                            <span key={woId} className="text-xs px-2 py-1 bg-dark-600 text-gray-300 rounded">
                              {workout.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => {
                      // If user has no programs, create this one and activate
                      if (userPrograms.length === 0) {
                        addProgram({
                          name: program.name,
                          phases: program.phases.map(p => ({ name: p.name, workouts: p.workouts })),
                          currentPhase: 0,
                          isActive: true,
                        });
                      } else {
                        // Otherwise navigate to programs page
                        router.push('/programs');
                      }
                    }}
                    className="flex-1 bg-primary hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    {userPrograms.length === 0 ? 'Start This Program' : 'Go to Programs'}
                  </button>
                  <button 
                    onClick={() => alert('Program details coming soon!')}
                    className="px-4 py-3 bg-dark-700 text-gray-300 rounded-xl hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4">No programs available</p>
              <button 
                onClick={() => router.push('/programs')}
                className="text-primary hover:text-primary-400 font-medium"
              >
                Create Your First Program
              </button>
            </div>
          )}
        </div>
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && (
        <div className="space-y-4">
          {workoutTemplates.length > 0 ? (
            workoutTemplates.map((workout) => (
              <div
                key={workout.id}
                className="bg-dark-800 rounded-xl border border-dark-700 p-4 md:p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{workout.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-sm text-gray-400 capitalize">{workout.type}</span>
                      {workout.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          workout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          workout.status === 'planned' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workout.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {workout.duration && (
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{workout.duration}</span>
                      <span className="text-gray-400 text-sm ml-1">min</span>
                    </div>
                  )}
                </div>

                {/* Exercises in Workout */}
                <div className="space-y-2 mb-4">
                  {workout.exercises.map((ex) => {
                    const exercise = getExerciseById(ex.exerciseId);
                    return (
                      <div key={ex.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm">{ex.order}.</span>
                          <span className="text-white">
                            {exercise?.name || 'Unknown Exercise'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 text-sm">{ex.sets} x {ex.reps}</span>
                          {ex.weight && (
                            <span className="text-gray-500 text-sm ml-2">@ {ex.weight} lbs</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => router.push('/calendar')}
                    className="flex-1 bg-primary hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  >
                    Add to Calendar
                  </button>
                  <button 
                    onClick={() => alert('Workout details coming soon!')}
                    className="px-4 py-3 bg-dark-700 text-gray-300 rounded-xl hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4">No workouts found</p>
              <button 
                onClick={() => router.push('/calendar')}
                className="text-primary hover:text-primary-400 font-medium"
              >
                Create a Workout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
