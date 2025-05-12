// app/api/_init/route.ts
import { db } from '@/lib/db.server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await db.connect();
    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Connection failed' },
      { status: 500 }
    );
  }
}
