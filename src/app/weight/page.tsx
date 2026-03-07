'use client';

import { useState, useEffect } from 'react';
import { useWeight } from '@/lib/store';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WeightPage() {
  const { entries, loading, addEntry, deleteEntry } = useWeight();
  const [newWeight, setNewWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !selectedDate) return;
    addEntry(parseFloat(newWeight), selectedDate);
    setNewWeight('');
  };

  const latestWeight = entries.length > 0 ? entries[entries.length - 1] : null;
  const startingWeight = entries.length > 0 ? entries[0] : null;
  const weightChange = startingWeight && latestWeight ? latestWeight.weight - startingWeight.weight : 0;

  const maxWeight = Math.max(...entries.map(e => e.weight), 1);
  const minWeight = Math.min(...entries.map(e => e.weight), 1);
  const range = maxWeight - minWeight || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Weight Tracking</h1>
        <p className="text-gray-400 mt-1">Log and track your body weight over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Current Weight</p>
          <p className="text-3xl font-bold text-white mt-1">
            {latestWeight ? `${latestWeight.weight} lbs` : '--'}
          </p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Change</p>
          <p className={`text-3xl font-bold mt-1 ${weightChange > 0 ? 'text-red-400' : weightChange < 0 ? 'text-green-400' : 'text-white'}`}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
          </p>
        </div>
        <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
          <p className="text-gray-400 text-sm">Entries</p>
          <p className="text-3xl font-bold text-white mt-1">{entries.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Log Weight</h2>
          <form onSubmit={handleAddWeight} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Enter weight"
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Log Weight
            </button>
          </form>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Progress Chart</h2>
          {entries.length > 0 ? (
            <div className="h-48 flex items-end gap-1">
              {entries.slice(-30).map((entry) => {
                const height = ((entry.weight - minWeight) / range) * 100;
                return (
                  <div
                    key={entry.id}
                    className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-colors group relative"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-700 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {entry.weight} lbs
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No data yet
            </div>
          )}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{entries.length > 0 ? formatDate(entries[0].date) : ''}</span>
            <span>{entries.length > 0 ? formatDate(entries[entries.length - 1].date) : ''}</span>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">History</h2>
        {entries.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...entries].reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl"
              >
                <div>
                  <p className="text-white font-medium">{entry.weight} lbs</p>
                  <p className="text-gray-500 text-sm">{formatDate(entry.date)}</p>
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
            No weight entries yet. Start logging!
          </div>
        )}
      </div>
    </div>
  );
}
