'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account</p>
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {session.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{session.user?.name}</h2>
            <p className="text-gray-400">{session.user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="py-3 border-b border-dark-700">
            <p className="text-gray-400 text-sm">Account Type</p>
            <p className="text-white font-medium">Guest User</p>
          </div>
          <div className="py-3 border-b border-dark-700">
            <p className="text-gray-400 text-sm">Data Storage</p>
            <p className="text-white font-medium">Local (Browser)</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="mt-6 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">About Kinetic</h3>
        <p className="text-gray-400 text-sm">
          Kinetic is your AI-powered fitness companion. Track workouts, monitor progress, 
          and achieve your fitness goals with personalized training programs.
        </p>
        <div className="mt-4 pt-4 border-t border-dark-700">
          <p className="text-gray-500 text-xs">Version 0.1.0</p>
        </div>
      </div>
    </div>
  );
}
