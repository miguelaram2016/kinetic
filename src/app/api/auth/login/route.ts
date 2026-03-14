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
    const { email, name, password } = await request.json();
    
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Email, name, and password required' }, { status: 400 });
    }

    await dbConnect();
    
    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // User exists - verify or set password
      if (!user.password) {
        // No password set - set it now
        user.password = simpleHash(password);
        user.name = name; // Update name too
        await user.save();
      } else if (user.password !== simpleHash(password)) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    } else {
      // Create new user with password
      user = await User.create({
        email: email.toLowerCase(),
        name,
        password: simpleHash(password),
      });
    }

    // Return user info
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
