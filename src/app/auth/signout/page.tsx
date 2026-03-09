'use client';

import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-700 p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Sign Out</h1>
        <p className="text-gray-400 mb-6">Are you sure you want to sign out?</p>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
