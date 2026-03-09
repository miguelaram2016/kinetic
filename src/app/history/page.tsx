'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useWorkouts } from '@/lib/store';
import { Workout } from '@/lib/types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function HistoryPage() {
  const { workouts, loading } = useWorkouts();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const completedWorkouts = useMemo(() => {
    const filtered = workouts.filter(w => w.completed);
    
    if (dateFilter === 'all') return filtered;
    
    const now = new Date();
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    const cutoff = new Date(now.getTime() - (daysMap[dateFilter] * 24 * 60 * 60 * 1000));
    
    return filtered.filter(w => w.completedAt && new Date(w.completedAt) >= cutoff);
  }, [workouts, dateFilter]);

  const stats = useMemo(() => {
    const totalWorkouts = completedWorkouts.length;
    const totalMinutes = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalVolume = completedWorkouts.reduce((sum, w) => {
      return sum + w.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => {
          return setSum + (set.completed ? set.weight * set.reps : 0);
        }, 0);
      }, 0);
    }, 0);
    
    return { totalWorkouts, totalMinutes, totalVolume };
  }, [completedWorkouts]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Workout History</h1>
        <p className="text-gray-400 mt-1">Review your past workouts and track progress</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Workouts</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Time</p>
          <p className="text-3xl font-bold text-white mt-1">{formatDuration(stats.totalMinutes)}</p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Total Volume</p>
          <p className="text-3xl font-bold text-white mt-1">{formatVolume(stats.totalVolume)} lbs</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', '7days', '30days', '90days'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              dateFilter === filter
                ? 'bg-primary text-white'
                : 'bg-dark-800 text-gray-400 hover:text-white border border-dark-700'
            }`}
          >
            {filter === 'all' ? 'All Time' : 
             filter === '7days' ? 'Last 7 Days' :
             filter === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Workout List */}
      <div className="space-y-4">
        {completedWorkouts.length > 0 ? (
          completedWorkouts.map((workout) => {
            const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            const completedSets = workout.exercises.reduce((sum, ex) => 
              sum + ex.sets.filter(s => s.completed).length, 0);
            
            return (
              <button
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="w-full text-left bg-dark-800 rounded-2xl border border-dark-700 p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {workout.completedAt ? formatDate(workout.completedAt) : 'Unknown date'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{workout.duration ? formatDuration(workout.duration) : '--'}</p>
                    <p className="text-gray-500 text-sm">{workout.exercises.length} exercises</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="text-gray-400">{completedSets}/{totalSets} sets</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                    {workout.exercises.reduce((sum, ex) => 
                      sum + ex.sets.filter(s => s.completed).reduce((s, set) => s + set.reps, 0), 0)} total reps
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Workouts Yet</h3>
            <p className="text-gray-500 mb-6">Complete your first workout to see it here</p>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Schedule Workout
            </Link>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedWorkout.name}</h2>
                  <p className="text-gray-400 mt-1">
                    {selectedWorkout.completedAt ? formatDate(selectedWorkout.completedAt) : ''}
                    {selectedWorkout.duration && ` • ${formatDuration(selectedWorkout.duration)}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedWorkout.exercises.map((exercise, exIndex) => (
                <div key={exercise.id} className="bg-dark-700/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">{exercise.name}</h3>
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          set.completed ? 'bg-green-500/10' : 'bg-dark-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${set.completed ? 'text-green-400' : 'text-gray-500'}`}>
                            Set {setIndex + 1}
                          </span>
                          {set.completed && (
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="text-gray-300">
                          {set.weight} lbs × {set.reps} reps
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
