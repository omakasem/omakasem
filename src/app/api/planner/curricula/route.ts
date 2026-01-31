import { getCurriculaCollection, getSessionsCollection } from '@/lib/mongodb'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SaveCurriculumSchema = z.object({
  sessionId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = SaveCurriculumSchema.parse(body)

    const sessions = await getSessionsCollection()
    const session = await sessions.findOne({ sessionId, userId })
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'approved') {
      return NextResponse.json({ error: 'Session not approved' }, { status: 400 })
    }

    if (!session.draft) {
      return NextResponse.json({ error: 'No draft available' }, { status: 400 })
    }

    const totalTasks = session.draft.epics.reduce(
      (sum: number, epic: { stories: { taskCount: number }[] }) =>
        sum + epic.stories.reduce((s: number, story: { taskCount: number }) => s + story.taskCount, 0),
      0
    )

    const totalHours =
      session.input?.totalWeeks && session.input?.weeklyHours ? session.input.totalWeeks * session.input.weeklyHours : 0

    const curricula = await getCurriculaCollection()

    const doc = {
      session_id: sessionId,
      course_title: session.draft.title,
      one_liner: session.draft.oneLiner,
      student_id: null,
      clerk_user_id: userId,
      status: 'active' as const,
      total_hours: totalHours,
      total_tasks: totalTasks,
      completed_tasks: 0,
      structure: {
        epics: session.draft.epics.map(
          (epic: { title: string; description: string; stories: { title: string; description: string }[] }) => ({
            title: epic.title,
            description: epic.description,
            stories: epic.stories.map((story: { title: string; description: string }) => ({
              title: story.title,
              description: story.description,
            })),
          })
        ),
      },
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await curricula.insertOne(doc)
    const curriculumId = result.insertedId.toString()

    return NextResponse.json({
      curriculumId,
      title: session.draft.title,
      totalTasks,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Failed to save curriculum:', error)
    return NextResponse.json({ error: 'Failed to save curriculum' }, { status: 500 })
  }
}
