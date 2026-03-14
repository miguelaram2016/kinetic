'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWorkouts } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function VolumeLogPage() {
  const { workouts } = useWorkouts();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const volumeData = useMemo(() => {
    const completed = workouts.filter(w => w.completed && w.completedAt);
    
    // Group by date
    const byDate: Record<string, { volume: number; workouts: number; date: string }> = {};
    
    completed.forEach(w => {
      const date = w.completedAt?.split('T')[0] || w.scheduledDate;
      if (!byDate[date]) {
        byDate[date] = { volume: 0, workouts: 0, date };
      }
      const volume = w.exercises.reduce((acc, ex) => {
        return acc + ex.sets.reduce((setAcc, set) => {
          return setAcc + (set.completed ? set.weight * set.reps : 0);
        }, 0);
      }, 0);
      byDate[date].volume += volume;
      byDate[date].workouts += 1;
    });

    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [workouts]);

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return volumeData;
    
    const now = new Date();
    const days = timeRange === 'week' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return volumeData.filter(d => new Date(d.date) >= cutoff);
  }, [volumeData, timeRange]);

  const stats = useMemo(() => {
    const totalVolume = volumeData.reduce((sum, d) => sum + d.volume, 0);
    const totalWorkouts = volumeData.length;
    const avgVolume = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;
    
    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    const sorted = [...volumeData].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sorted.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkStr = checkDate.toISOString().split('T')[0];
      
      if (sorted.find(d => d.date === checkStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Best day
    const best = volumeData.reduce((best, d) => d.volume > best.volume ? d : best, { volume: 0, date: '', workouts: 0 });

    return { totalVolume, totalWorkouts, avgVolume, streak, best };
  }, [volumeData]);

  const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">💪 Volume Log</h1>
        <p className="text-gray-400 mt-1">Track your strength progress over time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-2xl md:text-3xl font-bold text-primary">{formatVolume(stats.totalVolume)}</div>
          <div className="text-gray-400 text-sm mt-1">Total lbs</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-2xl md:text-3xl font-bold text-white">{stats.totalWorkouts}</div>
          <div className="text-gray-400 text-sm mt-1">Workouts</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-400">🔥 {stats.streak}</div>
          <div className="text-gray-400 text-sm mt-1">Day Streak</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-400">{formatVolume(stats.best.volume)}</div>
          <div className="text-gray-400 text-sm mt-1">Best Day</div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary text-white'
                : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Chart */}
      {filteredData.length > 0 ? (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Volume Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(v) => formatVolume(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                formatter={(value: any) => [formatVolume(Number(value || 0)) + ' lbs', 'Volume']}
              />
              <Bar dataKey="volume" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-12 text-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Volume Data Yet</h3>
          <p className="text-gray-500 mb-4">Complete some workouts to see your progress!</p>
        </div>
      )}

      {/* Recent Activity */}
      {volumeData.length > 0 && (
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[...filteredData].reverse().slice(0, 10).map((day) => (
              <div key={day.date} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div>
                  <p className="text-white font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-gray-500 text-sm">{day.workouts} workout{day.workouts !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold">{formatVolume(day.volume)} lbs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
