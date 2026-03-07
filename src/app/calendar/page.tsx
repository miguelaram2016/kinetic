'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkouts } from '@/lib/store';
import { Exercise, generateId } from '@/lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const WORKOUT_TEMPLATES = [
  {
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: [{ reps: 8, weight: 135, completed: false }, { reps: 8, weight: 135, completed: false }, { reps: 8, weight: 135, completed: false }] },
      { name: 'Overhead Press', sets: [{ reps: 10, weight: 95, completed: false }, { reps: 10, weight: 95, completed: false }, { reps: 10, weight: 95, completed: false }] },
      { name: 'Incline Dumbbell Press', sets: [{ reps: 12, weight: 40, completed: false }, { reps: 12, weight: 40, completed: false }, { reps: 12, weight: 40, completed: false }] },
      { name: 'Tricep Pushdown', sets: [{ reps: 15, weight: 40, completed: false }, { reps: 15, weight: 40, completed: false }, { reps: 15, weight: 40, completed: false }] },
    ],
  },
  {
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: [{ reps: 5, weight: 225, completed: false }, { reps: 5, weight: 225, completed: false }, { reps: 5, weight: 225, completed: false }] },
      { name: 'Barbell Row', sets: [{ reps: 10, weight: 135, completed: false }, { reps: 10, weight: 135, completed: false }, { reps: 10, weight: 135, completed: false }] },
      { name: 'Lat Pulldown', sets: [{ reps: 12, weight: 120, completed: false }, { reps: 12, weight: 120, completed: false }, { reps: 12, weight: 120, completed: false }] },
      { name: 'Face Pull', sets: [{ reps: 15, weight: 30, completed: false }, { reps: 15, weight: 30, completed: false }, { reps: 15, weight: 30, completed: false }] },
    ],
  },
  {
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', sets: [{ reps: 8, weight: 185, completed: false }, { reps: 8, weight: 185, completed: false }, { reps: 8, weight: 185, completed: false }] },
      { name: 'Romanian Deadlift', sets: [{ reps: 10, weight: 135, completed: false }, { reps: 10, weight: 135, completed: false }, { reps: 10, weight: 135, completed: false }] },
      { name: 'Leg Press', sets: [{ reps: 12, weight: 270, completed: false }, { reps: 12, weight: 270, completed: false }, { reps: 12, weight: 270, completed: false }] },
      { name: 'Calf Raise', sets: [{ reps: 15, weight: 100, completed: false }, { reps: 15, weight: 100, completed: false }, { reps: 15, weight: 100, completed: false }] },
    ],
  },
  {
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', sets: [{ reps: 8, weight: 135, completed: false }, { reps: 8, weight: 135, completed: false }, { reps: 8, weight: 135, completed: false }] },
      { name: 'Barbell Row', sets: [{ reps: 10, weight: 135, completed: false }, { reps: 10, weight: 135, completed: false }, { reps: 10, weight: 135, completed: false }] },
      { name: 'Overhead Press', sets: [{ reps: 10, weight: 95, completed: false }, { reps: 10, weight: 95, completed: false }, { reps: 10, weight: 95, completed: false }] },
      { name: 'Pull-ups', sets: [{ reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }, { reps: 8, weight: 0, completed: false }] },
    ],
  },
  {
    name: 'Lower Body',
    exercises: [
      { name: 'Squat', sets: [{ reps: 8, weight: 185, completed: false }, { reps: 8, weight: 185, completed: false }, { reps: 8, weight: 185, completed: false }] },
      { name: 'Leg Extension', sets: [{ reps: 12, weight: 100, completed: false }, { reps: 12, weight: 100, completed: false }, { reps: 12, weight: 100, completed: false }] },
      { name: 'Leg Curl', sets: [{ reps: 12, weight: 80, completed: false }, { reps: 12, weight: 80, completed: false }, { reps: 12, weight: 80, completed: false }] },
      { name: 'Calf Raise', sets: [{ reps: 15, weight: 100, completed: false }, { reps: 15, weight: 100, completed: false }, { reps: 15, weight: 100, completed: false }] },
    ],
  },
];

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function CalendarPage() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getWorkoutsForDate = (day: number) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    return workouts.filter(w => w.scheduledDate.startsWith(dateKey));
  };

  const handleAddWorkout = (template: typeof WORKOUT_TEMPLATES[0], date: string) => {
    const exercises: Exercise[] = template.exercises.map((ex) => ({
      id: generateId(),
      name: ex.name,
      sets: ex.sets.map(s => ({
        id: generateId(),
        reps: s.reps,
        weight: s.weight,
        completed: false,
      })),
    }));

    addWorkout({
      name: template.name,
      scheduledDate: date,
      exercises,
      completed: false,
    });
    setShowAddModal(false);
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-dark-800/30" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(new Date(year, month, day));
      const dayWorkouts = getWorkoutsForDate(day);
      const isToday = formatDateKey(new Date()) === dateKey;
      const isSelected = selectedDate === dateKey;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateKey)}
          className={`h-24 p-2 border border-dark-700 cursor-pointer transition-colors ${
            isToday ? 'bg-primary/10' : 'bg-dark-800 hover:bg-dark-700'
          } ${isSelected ? 'ring-2 ring-primary' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-gray-400'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayWorkouts.slice(0, 2).map(workout => (
              <div
                key={workout.id}
                className={`text-xs px-2 py-1 rounded truncate ${
                  workout.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {workout.name}
              </div>
            ))}
            {dayWorkouts.length > 2 && (
              <div className="text-xs text-gray-500">+{dayWorkouts.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateWorkouts = selectedDate
    ? workouts.filter(w => w.scheduledDate.startsWith(selectedDate))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 mt-1">Schedule and manage your workouts</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-white">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">{renderCalendarDays()}</div>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-primary hover:bg-primary-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>

          {selectedDate ? (
            selectedDateWorkouts.length > 0 ? (
              <div className="space-y-3">
                {selectedDateWorkouts.map(workout => (
                  <div
                    key={workout.id}
                    className="p-4 bg-dark-700/50 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{workout.name}</h4>
                        <p className="text-gray-500 text-sm">
                          {workout.exercises.length} exercises
                        </p>
                      </div>
                      {workout.completed ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Done
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          Scheduled
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {!workout.completed && (
                        <Link
                          href={`/workout/${workout.id}`}
                          className="flex-1 bg-primary hover:bg-primary-600 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Start
                        </Link>
                      )}
                      <button
                        onClick={() => deleteWorkout(workout.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No workouts scheduled</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-primary hover:text-primary-400 font-medium"
                >
                  + Add Workout
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Click on a date to view workouts</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Workout</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Select a workout template for{' '}
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>

            <div className="space-y-3">
              {WORKOUT_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => selectedDate && handleAddWorkout(template, selectedDate)}
                  className="w-full p-4 bg-dark-700 hover:bg-dark-600 rounded-xl text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <p className="text-gray-500 text-sm">
                        {template.exercises.length} exercises
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
