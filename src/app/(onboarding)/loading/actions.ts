'use server'

import { getCurriculaCollection, getSessionsCollection } from '@/lib/mongodb'
import { plannerClient } from '@/lib/planner-client'
import type { CoursePlan } from '@/types/planner'
import { auth } from '@clerk/nextjs/server'

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

export async function saveCurriculumFromPlan(sessionId: string, plan: CoursePlan): Promise<SaveCurriculumResult> {
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

    const totalTasks = plan.epics.reduce(
      (sum, epic) => sum + epic.stories.reduce((s, story) => s + (story.taskCount || 0), 0),
      0
    )
    console.log('[saveCurriculumFromPlan] totalTasks:', totalTasks)

    const totalHours = session.input.totalWeeks * session.input.weeklyHours

    const curricula = await getCurriculaCollection()

    const doc = {
      session_id: sessionId,
      course_title: plan.title,
      one_liner: plan.oneLiner,
      student_id: null,
      clerk_user_id: userId,
      status: 'active' as const,
      total_hours: totalHours,
      total_tasks: totalTasks,
      completed_tasks: 0,
      structure: {
        epics: plan.epics.map((epic) => ({
          title: epic.title,
          description: epic.description,
          stories: epic.stories.map((story) => ({
            title: story.title,
            description: story.description,
          })),
        })),
      },
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.log('[saveCurriculumFromPlan] inserting doc')
    const result = await curricula.insertOne(doc)
    const curriculumId = result.insertedId.toString()
    console.log('[saveCurriculumFromPlan] MongoDB inserted successfully')

    // Save to Planner API (non-blocking - don't fail if this fails)
    if (session.plannerSessionId) {
      try {
        await plannerClient.savePlan(session.plannerSessionId, plan, session.input.githubUrl)
        console.log('[saveCurriculumFromPlan] Planner API save success')
      } catch (apiError) {
        console.error('[saveCurriculumFromPlan] Planner API save failed (continuing):', apiError)
        // Don't throw - continue with flow
      }
    }

    // Update session status
    await sessions.updateOne({ sessionId }, { $set: { status: 'approved', updatedAt: new Date() } })
    console.log('[saveCurriculumFromPlan] session updated')

    return { success: true, curriculumId, planId: session.plannerSessionId }
  } catch (error) {
    console.error('[saveCurriculumFromPlan] Failed to save curriculum:', error)
    return { error: '커리큘럼 저장에 실패했습니다' }
  }
}

// Reject action - just updates local MongoDB status
export async function submitReview(sessionId: string, action: 'reject'): Promise<ReviewResult> {
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
    await sessions.updateOne({ sessionId }, { $set: { status: 'rejected', updatedAt: new Date() } })
    return { success: true }
  } catch (error) {
    console.error('Failed to submit review:', error)
    return { error: '처리에 실패했습니다. 다시 시도해주세요.' }
  }
}
