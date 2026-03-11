'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !name || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('kinetic_user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isSignUp 
              ? 'Start your fitness journey with Kinetic' 
              : 'Continue your fitness journey'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              !isSignUp 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isSignUp 
                ? 'bg-primary text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={4}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading 
                ? 'Please wait...' 
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-700">
            <p className="text-gray-500 text-sm text-center">
              🔒 Your password is securely stored and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
