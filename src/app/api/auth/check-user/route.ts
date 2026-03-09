import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
