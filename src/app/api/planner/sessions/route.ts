import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { plannerClient } from '@/lib/planner-client';
import { getSessionsCollection } from '@/lib/mongodb';
import type { SessionDocument } from '@/types/planner';

const CourseInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  totalWeeks: z.number().int().min(1).max(52),
  weeklyHours: z.number().int().min(1).max(40),
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting session creation...');

    const { userId } = await auth();
    console.log('[API] Auth result:', userId ? 'authenticated' : 'not authenticated');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[API] Request body:', body);
    const input = CourseInputSchema.parse(body);
    console.log('[API] Validated input:', input);

    // Create session in Planner API
    console.log('[API] Calling Planner API...');
    const { sessionId } = await plannerClient.createSession(input);
    console.log('[API] Planner API returned sessionId:', sessionId);

    // Store session in MongoDB
    console.log('[API] Connecting to MongoDB...');
    const sessions = await getSessionsCollection();
    console.log('[API] Got sessions collection');
    const doc: SessionDocument = {
      sessionId,
      userId,
      status: 'generating',
      input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await sessions.insertOne(doc);
    console.log('[API] Inserted session to MongoDB');

    return NextResponse.json({ sessionId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[API] Zod validation error:', error.issues);
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('[API] Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
