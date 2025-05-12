// src/app/api/latest-block/route.ts
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await MongoClient.connect(process.env.MONGO_URI!);
  const db = client.db('chaynops');
  
  const block = await db.collection('blocks')
    .findOne({}, { sort: { number: -1 } });
  
  await client.close();

  return NextResponse.json(block);
}
