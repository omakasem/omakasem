'use server'

import { auth } from '@clerk/nextjs/server'
import { getSessionsCollection, getCurriculaCollection } from '@/lib/mongodb'
import { plannerClient } from '@/lib/planner-client'
import type { CurriculumDocument, CoursePlan } from '@/types/planner'

export type ReviewResult = {
  success?: boolean
  error?: string
}

export type SessionInfoResult = {
  plannerSessionId?: string
  error?: string
}

export async function getSessionInfo(sessionId: string): Promise<SessionInfoResult> {
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

    if (!session.plannerSessionId) {
      return { error: 'Planner 세션이 연결되지 않았습니다' }
    }

    return { plannerSessionId: session.plannerSessionId }
  } catch (error) {
    console.error('Failed to get session info:', error)
    return { error: '세션 정보를 가져오는데 실패했습니다' }
  }
}

export type SaveCurriculumResult = {
  success?: boolean
  curriculumId?: string
  planId?: string
  error?: string
}

export async function saveCurriculumFromPlan(
  sessionId: string,
  plan: CoursePlan
): Promise<SaveCurriculumResult> {
  console.log('[saveCurriculumFromPlan] called with sessionId:', sessionId)
  console.log('[saveCurriculumFromPlan] plan:', JSON.stringify(plan, null, 2))

  const { userId } = await auth()
  if (!userId) {
    console.error('[saveCurriculumFromPlan] no userId')
    return { error: '로그인이 필요합니다' }
  }
  console.log('[saveCurriculumFromPlan] userId:', userId)

  try {
    const sessions = await getSessionsCollection()
    const session = await sessions.findOne({ sessionId, userId })
    console.log('[saveCurriculumFromPlan] session found:', !!session)

    if (!session) {
      return { error: '세션을 찾을 수 없습니다' }
    }

    // Calculate total task count from plan
    const taskCount = plan.epics.reduce(
      (sum, epic) =>
        sum + epic.stories.reduce((s, story) => s + (story.taskCount || 0), 0),
      0
    )
    console.log('[saveCurriculumFromPlan] taskCount:', taskCount)

    // Save curriculum to MongoDB
    const curricula = await getCurriculaCollection()
    const curriculumId = `cur_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const doc: CurriculumDocument = {
      curriculumId,
      userId,
      title: plan.title,
      oneLiner: plan.oneLiner,
      epics: plan.epics,
      taskCount,
      status: 'active',
      githubUrl: session.input.githubUrl,
      createdAt: new Date(),
    }

    console.log('[saveCurriculumFromPlan] inserting doc with curriculumId:', curriculumId)
    await curricula.insertOne(doc)
    console.log('[saveCurriculumFromPlan] MongoDB inserted successfully')

    // Save to Planner API (non-blocking - don't fail if this fails)
    if (session.plannerSessionId) {
      try {
        await plannerClient.savePlan(
          session.plannerSessionId,
          plan,
          session.input.githubUrl
        )
        console.log('[saveCurriculumFromPlan] Planner API save success')
      } catch (apiError) {
        console.error('[saveCurriculumFromPlan] Planner API save failed (continuing):', apiError)
        // Don't throw - continue with flow
      }
    }

    // Update session status
    await sessions.updateOne(
      { sessionId },
      { $set: { status: 'approved', updatedAt: new Date() } }
    )
    console.log('[saveCurriculumFromPlan] session updated')

    return { success: true, curriculumId, planId: session.plannerSessionId }
  } catch (error) {
    console.error('[saveCurriculumFromPlan] Failed to save curriculum:', error)
    return { error: '커리큘럼 저장에 실패했습니다' }
  }
}

// Reject action - just updates local MongoDB status
export async function submitReview(
  sessionId: string,
  action: 'reject'
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

    // Update session status to rejected
    await sessions.updateOne(
      { sessionId },
      { $set: { status: 'rejected', updatedAt: new Date() } }
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to submit review:', error)
    return { error: '처리에 실패했습니다. 다시 시도해주세요.' }
  }
}
