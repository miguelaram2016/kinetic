import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' };

// Only reports availability; never includes database hostnames or credentials.
export async function GET() {
  try {
    const connection = await dbConnect();
    const db = connection.connection.db;
    if (!db) throw new Error('Database is not initialized');
    await db.admin().ping();

    return NextResponse.json(
      { status: 'ok', database: 'connected' },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { status: 'degraded', database: 'unavailable' },
      { status: 503, headers },
    );
  }
}
