import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { plannerClient } from '@/lib/planner-client';
import { getSessionsCollection } from '@/lib/mongodb';

const RespondSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify user owns this session
    const sessions = await getSessionsCollection();
    const localSession = await sessions.findOne({ sessionId, userId });
    if (!localSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify plannerSessionId exists
    if (!localSession.plannerSessionId) {
      return NextResponse.json(
        { error: 'Planner session not linked. Please regenerate the draft.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = RespondSchema.parse(body);

    // Send response to Planner API using plannerSessionId
    const response = await plannerClient.respond(localSession.plannerSessionId, action);

    // Update local status
    await sessions.updateOne(
      { sessionId },
      {
        $set: {
          status: response.status,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Failed to respond:', error);
    return NextResponse.json({ error: 'Failed to respond' }, { status: 500 });
  }
}
