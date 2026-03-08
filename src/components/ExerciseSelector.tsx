'use client';

import { useState, useMemo } from 'react';
import { Exercise, MuscleGroup, Equipment } from '@/lib/exercise-types';
import { fuzzySearchExercises, getAllExercises } from '@/lib/exercise-utils';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 
  'hamstrings', 'glutes', 'calves', 'core', 'abs', 'obliques'
];

const EQUIPMENT_LIST: Equipment[] = [
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell'
];

export default function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | ''>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | ''>('');
  const [activeTab, setActiveTab] = useState<'all' | 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core'>('all');

  const exercises = useMemo(() => {
    let results = getAllExercises();
    
    if (searchQuery) {
      results = fuzzySearchExercises(searchQuery)
        .map(r => r.exercise);
    }
    
    if (selectedMuscle) {
      results = results.filter(e => 
        e.muscleGroups.includes(selectedMuscle) || 
        e.secondaryMuscles.includes(selectedMuscle)
      );
    }
    
    if (selectedEquipment) {
      results = results.filter(e => e.equipment.includes(selectedEquipment));
    }

    // Tab filtering
    if (activeTab !== 'all') {
      const tabMuscles: Record<string, MuscleGroup[]> = {
        chest: ['chest'],
        back: ['back', 'lats'],
        shoulders: ['shoulders'],
        legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        arms: ['biceps', 'triceps', 'forearms'],
        core: ['core', 'abs', 'obliques']
      };
      const targetMuscles = tabMuscles[activeTab] || [];
      results = results.filter(e => 
        targetMuscles.some(m => e.muscleGroups.includes(m) || e.secondaryMuscles.includes(m))
      );
    }
    
    return results;
  }, [searchQuery, selectedMuscle, selectedEquipment, activeTab]);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Select Exercise</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            autoFocus
          />
          
          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value as MuscleGroup | '')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="">All Muscles</option>
              {MUSCLE_GROUPS.map(m => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value as Equipment | '')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="">All Equipment</option>
              {EQUIPMENT_LIST.map(e => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMuscle('');
                setSelectedEquipment('');
                setActiveTab('all');
              }}
              className="text-xs text-gray-400 hover:text-white px-2"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-gray-800">
          {(['all', 'chest', 'back', 'shoulders', 'legs', 'arms', 'core'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto max-h-96 p-2">
          {exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No exercises found. Try different filters.
            </div>
          ) : (
            <div className="grid gap-2">
              {exercises.slice(0, 50).map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelect(exercise)}
                  className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-left group"
                >
                  <div>
                    <div className="text-white font-medium group-hover:text-primary transition-colors">
                      {exercise.name}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-primary">
                        {exercise.muscleGroups.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      exercise.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                      exercise.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
          Showing {Math.min(exercises.length, 50)} of {exercises.length} exercises
        </div>
      </div>
    </div>
  );
}
