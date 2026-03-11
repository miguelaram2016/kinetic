'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?key=${adminKey}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to fetch users');
        return;
      }
      
      setUsers(data.users);
      setAuthenticated(true);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchUsers();
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) {
      return;
    }

    setDeleting(userId);
    
    try {
      const res = await fetch(`/api/admin/users?key=${adminKey}&id=${userId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        alert('Failed to delete user');
        setDeleting(null);
        return;
      }
      
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
    
    setDeleting(null);
  };

  if (!authenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage Kinetic users</p>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8 max-w-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter admin key"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Verifying...' : 'Access Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage Kinetic users ({users.length} total)</p>
        </div>
        <button
          onClick={() => { setAuthenticated(false); setAdminKey(''); }}
          className="text-gray-400 hover:text-white text-sm"
        >
          Sign Out
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">User</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Email</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Joined</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-dark-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id, user.name)}
                      disabled={deleting === user._id}
                      className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === user._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
