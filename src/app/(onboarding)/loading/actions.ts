'use server'

import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { getSessionsCollection, getCurriculaCollection } from '@/lib/mongodb'
import type { CurriculumDocument } from '@/types/planner'

export type ReviewResult = {
  success?: boolean
  error?: string
}

export async function submitReview(
  sessionId: string,
  action: 'approve' | 'reject'
): Promise<ReviewResult> {
  const { userId } = await auth()
  if (!userId) {
    return { error: '로그인이 필요합니다' }
  }

  try {
    const sessions = await getSessionsCollection()
    const session = await sessions.findOne({ sessionId, userId })

    if (!session) {
      return { error: '세션을 찾을 수 없습니다' }
    }

    if (action === 'reject') {
      // Update session status to rejected
      await sessions.updateOne(
        { sessionId },
        { $set: { status: 'rejected', updatedAt: new Date() } }
      )
      return { success: true }
    }

    // Handle approve
    if (!session.draft) {
      return { error: '드래프트가 없습니다' }
    }

    // Send approve to Planner API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const cookieStore = await cookies()
    const respondResponse = await fetch(`${baseUrl}/api/planner/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ action: 'approve' }),
    })

    if (!respondResponse.ok) {
      return { error: '승인 처리에 실패했습니다' }
    }

    // Calculate total task count
    const taskCount = session.draft.epics.reduce(
      (sum: number, epic: { stories: { taskCount: number }[] }) =>
        sum + epic.stories.reduce((s: number, story: { taskCount: number }) => s + story.taskCount, 0),
      0
    )

    // Save curriculum to MongoDB
    const curricula = await getCurriculaCollection()
    const curriculumId = `cur_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const doc: CurriculumDocument = {
      curriculumId,
      userId,
      title: session.draft.title,
      oneLiner: session.draft.oneLiner,
      epics: session.draft.epics,
      taskCount,
      status: 'active',
      createdAt: new Date(),
    }

    await curricula.insertOne(doc)

    // Update session status
    await sessions.updateOne(
      { sessionId },
      { $set: { status: 'approved', updatedAt: new Date() } }
    )

    return { success: true }
  } catch (error) {
    console.error('Failed to submit review:', error)
    return { error: '처리에 실패했습니다. 다시 시도해주세요.' }
  }
}
