'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkouts, useStats, useWeight, useFood, usePrograms } from '@/lib/store';
import { Workout } from '@/lib/types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
}

function getUpcomingWorkout(workouts: Workout[]): Workout | null {
  const now = new Date();
  const upcoming = workouts
    .filter(w => !w.completed && new Date(w.scheduledDate) >= now)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  return upcoming[0] || null;
}

function getRecentWorkouts(workouts: Workout[]): Workout[] {
  return workouts
    .filter(w => w.completed)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);
}

export default function DashboardPage() {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const stats = useStats(workouts);
  const { entries: weightEntries } = useWeight();
  const { entries: foodEntries } = useFood();
  const { programs } = usePrograms();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || workoutsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const upcomingWorkout = getUpcomingWorkout(workouts);
  const recentWorkouts = getRecentWorkouts(workouts);
  
  // Get today's food totals
  const today = new Date().toISOString().split('T')[0];
  const todayFood = foodEntries.filter(e => e.date === today);
  const todayCalories = todayFood.reduce((sum, e) => sum + e.calories, 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Let&apos;s crush today&apos;s workout.</p>
      </div>

      {/* Quick Actions - Show when no recent activity */}
      {recentWorkouts.length === 0 && (
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-white mb-4">🚀 Quick Start</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/calendar"
              className="flex items-center gap-3 p-4 bg-dark-800/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Schedule</p>
                <p className="text-gray-400 text-sm">Plan a workout</p>
              </div>
            </Link>
            <Link
              href="/reference"
              className="flex items-center gap-3 p-4 bg-dark-800/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Exercises</p>
                <p className="text-gray-400 text-sm">Browse library</p>
              </div>
            </Link>
            <Link
              href="/programs"
              className="flex items-center gap-3 p-4 bg-dark-800/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Programs</p>
                <p className="text-gray-400 text-sm">Start a plan</p>
              </div>
            </Link>
            <Link
              href="/weight"
              className="flex items-center gap-3 p-4 bg-dark-800/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Track Weight</p>
                <p className="text-gray-400 text-sm">Log progress</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">This Week</p>
              <p className="text-2xl font-bold text-white">{stats.workoutsThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Streak</p>
              <p className="text-2xl font-bold text-white">{stats.streak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">{formatVolume(stats.totalVolume)} lbs</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Workouts</p>
              <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upcoming Workout Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Upcoming Workout</h2>
              <p className="text-gray-400 text-sm mt-1">
                {upcomingWorkout ? formatDate(upcomingWorkout.scheduledDate) : 'No workouts scheduled'}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {upcomingWorkout ? (
            <>
              <h3 className="text-xl font-bold text-white mb-2">{upcomingWorkout.name}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {upcomingWorkout.exercises.length} exercises
              </p>
              <Link
                href={`/workout/${upcomingWorkout.id}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Workout
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-400 mb-4">Schedule a workout to get started!</p>
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Schedule Workout
              </Link>
            </>
          )}
        </div>

        {/* Today&apos;s Summary */}
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Summary</h2>
          
          <div className="space-y-4">
            {/* Weight */}
            <div className="flex items-center justify-between py-3 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span className="text-gray-300">Weight</span>
              </div>
              <span className="text-white font-semibold">
                {weightEntries.length > 0 
                  ? `${weightEntries[weightEntries.length - 1].weight} lbs` 
                  : 'Not logged'}
              </span>
            </div>

            {/* Calories */}
            <div className="flex items-center justify-between py-3 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-gray-300">Calories</span>
              </div>
              <span className="text-white font-semibold">
                {todayCalories > 0 ? `${todayCalories} kcal` : 'Not logged'}
              </span>
            </div>

            {/* Program Progress */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="text-gray-300">Program</span>
              </div>
              <span className="text-white font-semibold">
                {(() => {
                  const activeProgram = programs.find(p => p.isActive) || (programs.length > 0 ? programs[0] : null);
                  return activeProgram ? activeProgram.name : 'No active program';
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link href="/history" className="text-primary hover:text-primary-400 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{workout.name}</p>
                    <p className="text-gray-500 text-sm">
                      {workout.completedAt ? formatDate(workout.completedAt) : ''}
                      {workout.duration && ` • ${workout.duration} min`}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">
                  {workout.exercises.length} exercises
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">No workouts completed yet</p>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-400 font-medium"
            >
              Schedule your first workout
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/calendar"
          className="bg-dark-800 hover:bg-dark-700 p-4 rounded-xl border border-dark-700 transition-colors text-center"
        >
          <svg className="w-6 h-6 text-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-white font-medium">Calendar</span>
        </Link>
        <Link
          href="/weight"
          className="bg-dark-800 hover:bg-dark-700 p-4 rounded-xl border border-dark-700 transition-colors text-center"
        >
          <svg className="w-6 h-6 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span className="text-white font-medium">Log Weight</span>
        </Link>
        <Link
          href="/food"
          className="bg-dark-800 hover:bg-dark-700 p-4 rounded-xl border border-dark-700 transition-colors text-center"
        >
          <svg className="w-6 h-6 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-white font-medium">Log Food</span>
        </Link>
        <Link
          href="/programs"
          className="bg-dark-800 hover:bg-dark-700 p-4 rounded-xl border border-dark-700 transition-colors text-center"
        >
          <svg className="w-6 h-6 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span className="text-white font-medium">Programs</span>
        </Link>
      </div>
    </div>
  );
}
