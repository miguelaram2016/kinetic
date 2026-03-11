import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    
    // Simple admin key check
    if (adminKey !== 'kinetic-admin-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    const userId = searchParams.get('id');
    
    // Simple admin key check
    if (adminKey !== 'kinetic-admin-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await dbConnect();
    
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
