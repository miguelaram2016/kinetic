import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'x' + Math.abs(hash).toString(16);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    await dbConnect();
    
    // Find user and verify password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.password !== simpleHash(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Delete the user
    await User.findByIdAndDelete(user._id);
    
    return NextResponse.json({ success: true, message: 'Account deleted' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
