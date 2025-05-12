// app/(admin)/api/blocks/route.ts
import { db } from '@/lib/db.server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blocks = await db.blocks.getLatest();
    return NextResponse.json(blocks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}
