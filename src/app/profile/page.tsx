'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkouts, useWeight, useFood, usePrograms } from '@/lib/store';
import ProgressPhotos from '@/components/ProgressPhotos';

export default function ProfilePage() {
  const router = useRouter();
  const { workouts } = useWorkouts();
  const { entries: weightEntries, addEntry: addWeightEntry } = useWeight();
  const { entries: foodEntries } = useFood();
  const { programs } = usePrograms();
  
  const [user, setUser] = useState<{name: string; email: string; createdAt?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kinetic_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    setLoading(false);
  }, []);

  const stats = useMemo(() => {
    const completedWorkouts = workouts.filter(w => w.completed);
    const totalWorkouts = completedWorkouts.length;
    const totalMinutes = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalVolume = completedWorkouts.reduce((sum, w) => {
      return sum + w.exercises.reduce((exSum, ex) => {
        return exSum + ex.sets.reduce((setSum, set) => {
          return setSum + (set.completed ? set.weight * set.reps : 0);
        }, 0);
      }, 0);
    }, 0);
    
    const currentWeight = weightEntries.length > 0 
      ? weightEntries[weightEntries.length - 1].weight 
      : null;
    
    const startWeight = weightEntries.length > 0 
      ? weightEntries[0].weight 
      : null;
    
    const weightChange = startWeight && currentWeight ? currentWeight - startWeight : null;
    
    const totalCalories = foodEntries.reduce((sum, e) => sum + e.calories, 0);
    
    // Calculate member days
    const memberDays = user?.createdAt 
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1;
    
    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    const sortedWorkouts = [...completedWorkouts].sort((a, b) => 
      new Date(b.completedAt || b.scheduledDate).getTime() - new Date(a.completedAt || a.scheduledDate).getTime()
    );
    
    if (sortedWorkouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      const workoutDates = new Set(sortedWorkouts.map(w => {
        const d = new Date(w.completedAt || w.scheduledDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }));
      
      // Check if worked out today or yesterday to start streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (workoutDates.has(today.getTime())) {
        streak = 1;
        checkDate = yesterday;
      } else if (workoutDates.has(yesterday.getTime())) {
        streak = 1;
        checkDate = yesterday;
      }
      
      // Count backwards
      while (workoutDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    return {
      totalWorkouts,
      totalMinutes,
      totalVolume,
      currentWeight,
      weightChange,
      totalCalories,
      memberDays,
      streak,
      programs: programs.length,
    };
  }, [workouts, weightEntries, foodEntries, programs, user]);

  const handleSignOut = () => {
    localStorage.removeItem('kinetic_user');
    router.push('/auth/signin');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    
    setDeleting(true);
    
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password: deletePassword }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to delete account');
        setDeleting(false);
        return;
      }
      
      localStorage.removeItem('kinetic_user');
      alert('Account deleted successfully');
      router.push('/');
    } catch (err) {
      alert('Failed to delete account');
      setDeleting(false);
    }
  };

  const handleAddWeight = () => {
    if (!newWeight) return;
    
    addWeightEntry(parseFloat(newWeight), new Date().toISOString().split('T')[0]);
    
    setNewWeight('');
    setShowWeightModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Not signed in</p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="text-primary hover:text-primary-400 font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  const formatVolume = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-1">Your fitness journey at a glance</p>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-gradient-to-br from-primary/20 via-purple-500/10 to-secondary/20 rounded-2xl border border-primary/20 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                🏆 {stats.streak} day streak
              </span>
              <span className="px-3 py-1 bg-dark-700 text-gray-300 text-sm font-medium rounded-full">
                📅 {stats.memberDays} days member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-3xl font-bold text-white">{stats.totalWorkouts}</div>
          <div className="text-gray-400 text-sm mt-1">Workouts</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-3xl font-bold text-white">{formatVolume(stats.totalVolume)}</div>
          <div className="text-gray-400 text-sm mt-1">Volume (lbs)</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-3xl font-bold text-white">{stats.programs}</div>
          <div className="text-gray-400 text-sm mt-1">Programs</div>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-center">
          <div className="text-3xl font-bold text-white">{stats.totalCalories.toLocaleString()}</div>
          <div className="text-gray-400 text-sm mt-1">Calories</div>
        </div>
      </div>

      {/* Weight & Body Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weight Card */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">💪 Current Weight</h3>
            <button 
              onClick={() => setShowWeightModal(true)}
              className="text-primary hover:text-primary-400 text-sm font-medium"
            >
              + Log
            </button>
          </div>
          
          {stats.currentWeight ? (
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-white">{stats.currentWeight}</div>
              <div className="text-gray-400">lbs</div>
              {stats.weightChange !== null && (
                <div className={`mt-2 text-sm font-medium ${stats.weightChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.weightChange > 0 ? '↑' : '↓'} {Math.abs(stats.weightChange).toFixed(1)} lbs from start
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No weight logged yet</p>
              <button 
                onClick={() => setShowWeightModal(true)}
                className="mt-2 text-primary hover:text-primary-400 text-sm font-medium"
              >
                Log your first weight
              </button>
            </div>
          )}
          
          {weightEntries.length > 1 && (
            <div className="mt-4 pt-4 border-t border-dark-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">First: {weightEntries[0].weight} lbs</span>
                <span className="text-gray-400">Latest: {weightEntries[weightEntries.length - 1].weight} lbs</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Photos */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📸 Progress Photos</h3>
          <ProgressPhotos onPhotosAdded={(photos) => {
            // Save to localStorage
            const key = `kinetic_photos_${user?.email || 'guest'}`;
            localStorage.setItem(key, JSON.stringify(photos));
          }} />
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/weight')}
              className="w-full flex items-center justify-between p-3 bg-dark-700/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <span className="text-white">📊 View Weight History</span>
              <span className="text-gray-400">→</span>
            </button>
            <button 
              onClick={() => router.push('/history')}
              className="w-full flex items-center justify-between p-3 bg-dark-700/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <span className="text-white">🏋️ View Workout History</span>
              <span className="text-gray-400">→</span>
            </button>
            <button 
              onClick={() => router.push('/programs')}
              className="w-full flex items-center justify-between p-3 bg-dark-700/50 hover:bg-dark-700 rounded-xl transition-colors"
            >
              <span className="text-white">📋 Browse Programs</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🔐 Account</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-gray-400">Email</span>
            <span className="text-white">{user.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-gray-400">Member Since</span>
            <span className="text-white">{stats.memberDays} days ago</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Data Storage</span>
            <span className="text-green-400">✓ MongoDB Atlas</span>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="mt-6 w-full bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Sign Out
        </button>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-3 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 rounded-xl transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Log Weight</h3>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter weight (lbs)"
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-center text-2xl focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWeight}
                className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl border border-red-500/30 p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Account</h3>
            <p className="text-gray-400 text-sm mb-4">
              This will permanently delete your account and all your data. This action cannot be undone.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password to confirm"
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
