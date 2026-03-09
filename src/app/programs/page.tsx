'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePrograms, useWorkouts } from '@/lib/store';
import { TrainingProgram } from '@/lib/types';

const PROGRAM_TEMPLATES = [
  {
    name: 'Push Pull Legs',
    phases: [
      { name: 'Week 1', workouts: ['push-1', 'pull-1', 'legs-1'] },
      { name: 'Week 2', workouts: ['push-2', 'pull-2', 'legs-2'] },
      { name: 'Week 3', workouts: ['push-3', 'pull-3', 'legs-3'] },
      { name: 'Week 4', workouts: ['push-4', 'pull-4', 'legs-4'] },
    ],
  },
  {
    name: 'Upper Lower',
    phases: [
      { name: 'Week 1', workouts: ['upper-1', 'lower-1', 'upper-1', 'lower-1'] },
      { name: 'Week 2', workouts: ['upper-2', 'lower-2', 'upper-2', 'lower-2'] },
      { name: 'Week 3', workouts: ['upper-3', 'lower-3', 'upper-3', 'lower-3'] },
      { name: 'Week 4', workouts: ['upper-4', 'lower-4', 'upper-4', 'lower-4'] },
    ],
  },
  {
    name: 'Full Body',
    phases: [
      { name: 'Week 1', workouts: ['full-1', 'full-1', 'full-1'] },
      { name: 'Week 2', workouts: ['full-2', 'full-2', 'full-2'] },
      { name: 'Week 3', workouts: ['full-3', 'full-3', 'full-3'] },
      { name: 'Week 4', workouts: ['full-4', 'full-4', 'full-4'] },
    ],
  },
];

export default function ProgramsPage() {
  const { programs, loading, addProgram, updateProgram, deleteProgram } = usePrograms();
  const { workouts } = useWorkouts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const handleCreateProgram = (template: typeof PROGRAM_TEMPLATES[0]) => {
    addProgram({
      name: template.name,
      phases: template.phases,
      currentPhase: 0,
      isActive: programs.length === 0, // First program is active by default
    });
    setShowCreateModal(false);
  };

  // Get the active program (the one with isActive: true, or first if none)
  const activeProgram = programs.find(p => p.isActive) || (programs.length > 0 ? programs[0] : null);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Training Programs</h1>
          <p className="text-gray-400 mt-1">Follow structured training programs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors min-h-[44px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Program
        </button>
      </div>

      {activeProgram ? (
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-primary text-sm font-medium mb-1">Active Program</p>
              <h2 className="text-2xl font-bold text-white">{activeProgram.name}</h2>
              <p className="text-gray-400 mt-1">
                Started {new Date(activeProgram.startedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => {
                deleteProgram(activeProgram.id);
                setSelectedProgram(null);
              }}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Program Progress</span>
              <span className="text-white text-sm font-medium">
                Phase {activeProgram.currentPhase + 1} of {activeProgram.phases.length}
              </span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((activeProgram.currentPhase + 1) / activeProgram.phases.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeProgram.phases.map((phase, index) => (
              <button
                key={phase.name}
                onClick={() => setSelectedProgram(index === activeProgram.currentPhase ? activeProgram : null)}
                className={`p-4 rounded-xl text-left transition-colors ${
                  index === activeProgram.currentPhase
                    ? 'bg-primary text-white'
                    : index < activeProgram.currentPhase
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                <p className="font-medium">{phase.name}</p>
                <p className="text-sm opacity-70">{phase.workouts.length} workouts</p>
              </button>
            ))}
          </div>

          {selectedProgram && selectedProgram.id === activeProgram.id && (
            <div className="mt-6 p-4 bg-dark-800/50 rounded-xl">
              <h3 className="text-white font-medium mb-3">
                {activeProgram.phases[activeProgram.currentPhase].name} Workouts
              </h3>
              <div className="space-y-2">
                {activeProgram.phases[activeProgram.currentPhase].workouts.map((workoutId, i) => {
                  const matchingWorkout = workouts.find(w => 
                    w.name.toLowerCase().includes(workoutId.split('-')[0])
                  );
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg"
                    >
                      <span className="text-gray-300">Workout {i + 1}</span>
                      {matchingWorkout ? (
                        <Link
                          href={`/workout/${matchingWorkout.id}`}
                          className="text-primary hover:text-primary-400 text-sm font-medium"
                        >
                          Start →
                        </Link>
                      ) : (
                        <Link
                          href="/calendar"
                          className="text-gray-500 hover:text-gray-400 text-sm"
                        >
                          Schedule →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
              {activeProgram.currentPhase < activeProgram.phases.length - 1 && (
                <button
                  onClick={() => updateProgram(activeProgram.id, { currentPhase: activeProgram.currentPhase + 1 })}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Complete Phase →
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-12 text-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Active Program</h3>
          <p className="text-gray-500 mb-6">Start a training program to structure your workouts</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Choose a Program
          </button>
        </div>
      )}

      {programs.length > 1 && (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Programs</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.filter(p => !p.isActive).map((program) => (
              <div
                key={program.id}
                className="p-4 bg-dark-700/50 rounded-xl"
              >
                <h4 className="text-white font-medium">{program.name}</h4>
                <p className="text-gray-500 text-sm mt-1">
                  {program.phases.length} weeks
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      // Deactivate all programs, then activate this one
                      programs.forEach(p => updateProgram(p.id, { isActive: false }));
                      updateProgram(program.id, { isActive: true, currentPhase: 0 });
                    }}
                    className="flex-1 text-primary hover:text-primary-400 text-sm font-medium"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => deleteProgram(program.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Program</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Choose a training program template to get started
            </p>

            <div className="space-y-3">
              {PROGRAM_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => handleCreateProgram(template)}
                  className="w-full p-4 bg-dark-700 hover:bg-dark-600 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <p className="text-gray-500 text-sm">
                        {template.phases.length} weeks • {template.phases[0].workouts.length} workouts/week
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
