import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getSessionsCollection, getCurriculaCollection } from '@/lib/mongodb';
import type { CurriculumDocument } from '@/types/planner';

const SaveCurriculumSchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = SaveCurriculumSchema.parse(body);

    // Get session with draft
    const sessions = await getSessionsCollection();
    const session = await sessions.findOne({ sessionId, userId });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'approved') {
      return NextResponse.json({ error: 'Session not approved' }, { status: 400 });
    }

    if (!session.draft) {
      return NextResponse.json({ error: 'No draft available' }, { status: 400 });
    }

    // Calculate total task count
    const taskCount = session.draft.epics.reduce(
      (sum: number, epic: { stories: { taskCount: number }[] }) =>
        sum + epic.stories.reduce((s: number, story: { taskCount: number }) => s + story.taskCount, 0),
      0
    );

    // Save to curricula collection
    const curricula = await getCurriculaCollection();
    const curriculumId = `cur_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const doc: CurriculumDocument = {
      curriculumId,
      userId,
      title: session.draft.title,
      oneLiner: session.draft.oneLiner,
      epics: session.draft.epics,
      taskCount,
      status: 'active',
      createdAt: new Date(),
    };

    await curricula.insertOne(doc);

    return NextResponse.json({
      curriculumId,
      title: session.draft.title,
      taskCount
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Failed to save curriculum:', error);
    return NextResponse.json({ error: 'Failed to save curriculum' }, { status: 500 });
  }
}
