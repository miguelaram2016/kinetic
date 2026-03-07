'use client';

import { useState, useEffect } from 'react';
import { useFood } from '@/lib/store';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FoodPage() {
  const { entries, loading, addEntry, deleteEntry, getEntriesForDate } = useFood();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

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

  const todayEntries = getEntriesForDate(selectedDate);
  const totals = todayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fats: acc.fats + e.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;
    
    addEntry({
      date: selectedDate,
      name: foodName,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fats: parseInt(fats) || 0,
    });
    
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setShowForm(false);
  };

  const uniqueDates = Array.from(new Set(entries.map(e => e.date))).sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Food Log</h1>
          <p className="text-gray-400 mt-1">Track your daily nutrition intake</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Food
        </button>
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Calories</p>
          <p className="text-2xl font-bold text-white mt-1">{totals.calories}</p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Protein</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{totals.protein}g</p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Carbs</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{totals.carbs}g</p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Fats</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{totals.fats}g</p>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
        
        {todayEntries.length > 0 ? (
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl"
              >
                <div>
                  <p className="text-white font-medium">{entry.name}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-400">
                    <span>{entry.calories} cal</span>
                    <span className="text-blue-400">{entry.protein}g P</span>
                    <span className="text-yellow-400">{entry.carbs}g C</span>
                    <span className="text-red-400">{entry.fats}g F</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No food logged for this day
          </div>
        )}
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Days</h2>
        {uniqueDates.length > 0 ? (
          <div className="space-y-2">
            {uniqueDates.slice(0, 7).map((date) => {
              const dayEntries = getEntriesForDate(date);
              const dayTotals = dayEntries.reduce(
                (acc, e) => ({
                  calories: acc.calories + e.calories,
                  protein: acc.protein + e.protein,
                  carbs: acc.carbs + e.carbs,
                  fats: acc.fats + e.fats,
                }),
                { calories: 0, protein: 0, carbs: 0, fats: 0 }
              );
              
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                    selectedDate === date
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-dark-700/50 hover:bg-dark-700'
                  }`}
                >
                  <span className="text-white font-medium">{formatDate(date)}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">{dayTotals.calories} cal</span>
                    <span className="text-blue-400">{dayTotals.protein}g P</span>
                    <span className="text-yellow-400">{dayTotals.carbs}g C</span>
                    <span className="text-red-400">{dayTotals.fats}g F</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No food logged yet
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Food</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Food Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Chicken Breast"
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="0"
                    className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Add Food
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
