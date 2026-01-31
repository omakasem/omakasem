'use server'

import { getCurriculaCollection, getSessionsCollection, getTasksCollection } from '@/lib/mongodb'
import { plannerClient } from '@/lib/planner-client'
import type { EnrichedCoursePlan, EnrichedTask } from '@/types/planner'
import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'

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

function transformAcceptanceCriteria(criteria: string[]): { description: string; weight: number }[] {
  if (!criteria || criteria.length === 0) {
    return [{ description: '과제를 완료하세요', weight: 1.0 }]
  }
  const weight = 1.0 / criteria.length
  return criteria.map((description) => ({ description, weight }))
}

function countTasksInPlan(plan: EnrichedCoursePlan): number {
  return plan.epics.reduce(
    (sum, epic) => sum + epic.stories.reduce((storySum, story) => storySum + (story.tasks?.length || 0), 0),
    0
  )
}

interface TaskDocumentInput {
  curriculum_id: ObjectId
  epic_index: number
  story_index: number
  epic_title: string
  story_title: string
  title: string
  description: string
  acceptance_criteria: { description: string; weight: number }[]
  estimated_minutes: number | null
  status: 'pending'
  grade_result: null
  created_at: Date
  updated_at: Date
}

function extractTasksFromPlan(plan: EnrichedCoursePlan, curriculumId: ObjectId): TaskDocumentInput[] {
  const tasks: TaskDocumentInput[] = []
  const now = new Date()

  plan.epics.forEach((epic, epicIndex) => {
    epic.stories.forEach((story, storyIndex) => {
      if (!story.tasks) return

      story.tasks.forEach((task: EnrichedTask) => {
        tasks.push({
          curriculum_id: curriculumId,
          epic_index: epicIndex,
          story_index: storyIndex,
          epic_title: epic.title,
          story_title: story.title,
          title: task.title,
          description: story.description || '',
          acceptance_criteria: transformAcceptanceCriteria(task.acceptance_criteria),
          estimated_minutes: task.estimated_minutes ?? null,
          status: 'pending',
          grade_result: null,
          created_at: now,
          updated_at: now,
        })
      })
    })
  })

  return tasks
}

export async function saveCurriculumFromPlan(
  sessionId: string,
  plan: EnrichedCoursePlan
): Promise<SaveCurriculumResult> {
  console.log('[saveCurriculumFromPlan] called with sessionId:', sessionId)
  console.log('[saveCurriculumFromPlan] plan keys:', Object.keys(plan))

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

    const totalTasks = countTasksInPlan(plan)
    console.log('[saveCurriculumFromPlan] totalTasks:', totalTasks)

    const totalHours = session.input.totalWeeks * session.input.weeklyHours

    const curricula = await getCurriculaCollection()
    const curriculumOid = new ObjectId()

    const curriculumDoc = {
      _id: curriculumOid,
      session_id: sessionId,
      course_title: plan.course_title,
      one_liner: plan.one_liner,
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

    console.log('[saveCurriculumFromPlan] inserting curriculum doc')
    await curricula.insertOne(curriculumDoc)
    const curriculumId = curriculumOid.toString()
    console.log('[saveCurriculumFromPlan] Curriculum inserted:', curriculumId)

    const taskDocs = extractTasksFromPlan(plan, curriculumOid)
    if (taskDocs.length > 0) {
      const tasksCollection = await getTasksCollection()
      const insertResult = await tasksCollection.insertMany(taskDocs)
      console.log('[saveCurriculumFromPlan] Tasks inserted:', insertResult.insertedCount)
    } else {
      console.log('[saveCurriculumFromPlan] No tasks to insert')
    }

    if (session.plannerSessionId) {
      try {
        const draftPlan = {
          title: plan.course_title,
          oneLiner: plan.one_liner,
          epics: plan.epics.map((epic) => ({
            epicId: '',
            weekNumber: epic.order || 0,
            title: epic.title,
            description: epic.description,
            stories: epic.stories.map((story) => ({
              storyId: '',
              title: story.title,
              description: story.description,
              taskCount: story.tasks?.length || 0,
            })),
          })),
        }
        await plannerClient.savePlan(session.plannerSessionId, draftPlan, session.input.githubUrl)
        console.log('[saveCurriculumFromPlan] Planner API save success')
      } catch (apiError) {
        console.error('[saveCurriculumFromPlan] Planner API save failed (continuing):', apiError)
      }
    }

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
