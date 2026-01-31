import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { getDb } from './mongodb'
import type {
  ActivityData,
  ActivityDocument,
  CurriculumDetail,
  CurriculumDocument,
  CurriculumListItem,
  TaskDocument,
} from './types'

export const CACHE_TAGS = {
  curricula: 'curricula',
  curriculum: (id: string) => `curriculum-${id}`,
  activities: 'activities',
} as const

const REVALIDATE_TIME = 60

function buildIdQuery(id: string): { _id: ObjectId } | { _id: string } {
  try {
    if (ObjectId.isValid(id) && new ObjectId(id).toString() === id) {
      return { _id: new ObjectId(id) }
    }
  } catch {
    // Not a valid ObjectId
  }
  return { _id: id as unknown as ObjectId }
}

async function getCurriculaInternal(userId: string): Promise<CurriculumListItem[]> {
  try {
    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    const curricula = await collection
      .find(
        {
          $or: [{ clerk_user_id: userId }, { clerk_user_id: { $exists: false } }, { clerk_user_id: null }],
        },
        {
          projection: {
            _id: 1,
            course_title: 1,
            icon: 1,
            total_tasks: 1,
            completed_tasks: 1,
            status: 1,
          },
        }
      )
      .sort({ updated_at: -1 })
      .toArray()

    return curricula
      .filter((doc) => doc.course_title)
      .map((doc) => ({
        id: doc._id.toString(),
        title: doc.course_title,
        icon: doc.icon,
        progress: doc.total_tasks > 0 ? Math.round((doc.completed_tasks / doc.total_tasks) * 100) : 0,
        status: doc.status,
      }))
  } catch (error) {
    console.error('Error fetching curricula:', error)
    return []
  }
}

const getCurriculaCached = (userId: string) =>
  unstable_cache(() => getCurriculaInternal(userId), [`curricula-${userId}`], {
    revalidate: REVALIDATE_TIME,
    tags: [CACHE_TAGS.curricula],
  })()

export const getCurricula = cache(async (): Promise<CurriculumListItem[]> => {
  const { userId } = await auth()
  if (!userId) return []
  return getCurriculaCached(userId)
})

async function getCurriculumByIdInternal(id: string, userId: string): Promise<CurriculumDetail | null> {
  try {
    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    const idQuery = buildIdQuery(id)
    const doc = await collection.findOne({
      ...idQuery,
      $or: [{ clerk_user_id: userId }, { clerk_user_id: { $exists: false } }, { clerk_user_id: null }],
    })

    if (!doc) return null

    return {
      id: doc._id.toString(),
      title: doc.course_title,
      one_liner: doc.one_liner,
      icon: doc.icon,
      progress: doc.total_tasks > 0 ? Math.round((doc.completed_tasks / doc.total_tasks) * 100) : 0,
      status: doc.status,
      total_hours: doc.total_hours,
      total_tasks: doc.total_tasks,
      completed_tasks: doc.completed_tasks,
      structure: doc.structure,
    }
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return null
  }
}

const getCurriculumByIdCached = (id: string, userId: string) =>
  unstable_cache(() => getCurriculumByIdInternal(id, userId), [`curriculum-${id}-${userId}`], {
    revalidate: REVALIDATE_TIME,
    tags: [CACHE_TAGS.curriculum(id)],
  })()

export const getCurriculumById = cache(async (id: string): Promise<CurriculumDetail | null> => {
  const { userId } = await auth()
  if (!userId) return null
  return getCurriculumByIdCached(id, userId)
})

async function getCurriculumTasksInternal(curriculumId: string): Promise<TaskDocument[]> {
  try {
    const db = await getDb()
    const collection = db.collection<TaskDocument>('tasks')

    let tasks: TaskDocument[] = []

    try {
      if (ObjectId.isValid(curriculumId)) {
        tasks = await collection
          .find({ curriculum_id: new ObjectId(curriculumId) as unknown as ObjectId })
          .sort({ epic_index: 1, story_index: 1 })
          .toArray()
      }
    } catch {
      // Not a valid ObjectId
    }

    if (tasks.length === 0) {
      tasks = await collection
        .find({ curriculum_id: curriculumId as unknown as ObjectId })
        .sort({ epic_index: 1, story_index: 1 })
        .toArray()
    }

    return tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

const getCurriculumTasksCached = (curriculumId: string, userId: string) =>
  unstable_cache(() => getCurriculumTasksInternal(curriculumId), [`tasks-${curriculumId}-${userId}`], {
    revalidate: REVALIDATE_TIME,
    tags: [CACHE_TAGS.curriculum(curriculumId)],
  })()

export const getCurriculumTasks = cache(async (curriculumId: string): Promise<TaskDocument[]> => {
  const { userId } = await auth()
  if (!userId) return []
  return getCurriculumTasksCached(curriculumId, userId)
})

function generateEmptyActivityData(days: number): ActivityData[] {
  const response: ActivityData[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    response.push({
      date: date.toISOString().split('T')[0],
      count: 0,
    })
  }
  return response
}

async function getActivityDataInternal(days: number, userId: string): Promise<ActivityData[]> {
  try {
    const db = await getDb()
    const collection = db.collection<ActivityDocument>('activities')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const aggregatedActivities = await collection
      .aggregate<{ _id: string; count: number }>([
        {
          $match: {
            $or: [{ clerk_user_id: userId }, { clerk_user_id: { $exists: false } }],
            date: { $gte: startDateStr },
          },
        },
        {
          $group: {
            _id: '$date',
            count: { $sum: '$count' },
          },
        },
      ])
      .toArray()

    const activityMap = new Map(aggregatedActivities.map((a) => [a._id, a.count]))

    const response: ActivityData[] = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      response.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
      })
    }

    return response
  } catch (error) {
    console.error('Error fetching activities:', error)
    return generateEmptyActivityData(days)
  }
}

const getActivityDataCached = (days: number, userId: string) =>
  unstable_cache(() => getActivityDataInternal(days, userId), [`activities-${days}-${userId}`], {
    revalidate: REVALIDATE_TIME,
    tags: [CACHE_TAGS.activities],
  })()

export const getActivityData = cache(async (days: number = 154): Promise<ActivityData[]> => {
  const { userId } = await auth()
  if (!userId) return generateEmptyActivityData(days)
  return getActivityDataCached(days, userId)
})

export interface SerializedTask {
  task_id: string
  curriculum_id: string
  epic_index: number
  story_index: number
  epic_title: string
  story_title: string
  title: string
  description: string
  status: 'pending' | 'partial' | 'passed' | 'failed'
  grade_result: {
    grade: string
    percentage: number
    graded_at: string
  } | null
}

export interface CurriculumWithTasks {
  curriculum_id: string
  course_title: string
  one_liner: string
  status: string
  total_hours: number
  total_tasks: number
  completed_tasks: number
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
  tasks: SerializedTask[]
  progress: number
  weekly_summary: string
}

function calculateProgressFromTasks(tasks: TaskDocument[]): number {
  if (tasks.length === 0) return 0

  const passedTasks = tasks.filter((t) => t.status === 'passed').length
  const partialTasks = tasks.filter((t) => t.status === 'partial').length

  const score = passedTasks * 100 + partialTasks * 50
  const maxScore = tasks.length * 100

  return Math.round((score / maxScore) * 100)
}

function getRecentTasks(tasks: TaskDocument[]): TaskDocument[] {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return tasks.filter((t) => {
    if (!t.grade_result?.graded_at) return false
    const gradedAt = new Date(t.grade_result.graded_at)
    return gradedAt >= oneWeekAgo
  })
}

function generateWeeklySummary(tasks: TaskDocument[]): string {
  const recentTasks = getRecentTasks(tasks)

  if (recentTasks.length === 0) {
    return '이번 주에 완료된 과제가 없습니다. 새로운 과제에 도전해보세요!'
  }

  const passedCount = recentTasks.filter((t) => t.status === 'passed').length
  const partialCount = recentTasks.filter((t) => t.status === 'partial').length
  const failedCount = recentTasks.filter((t) => t.status === 'failed').length

  const avgScore = recentTasks.reduce((sum, t) => sum + (t.grade_result?.percentage || 0), 0) / recentTasks.length

  const parts: string[] = []
  parts.push(`이번 주 ${recentTasks.length}개의 과제를 제출했습니다.`)

  if (passedCount > 0) parts.push(`${passedCount}개 통과`)
  if (partialCount > 0) parts.push(`${partialCount}개 부분 통과`)
  if (failedCount > 0) parts.push(`${failedCount}개 재도전 필요`)

  parts.push(`평균 점수: ${Math.round(avgScore)}점`)

  if (avgScore >= 90) {
    parts.push('우수한 성과를 보이고 있습니다!')
  } else if (avgScore >= 75) {
    parts.push('좋은 진행을 보이고 있습니다.')
  } else if (avgScore >= 60) {
    parts.push('꾸준히 노력하고 있습니다.')
  } else {
    parts.push('복습이 필요한 부분을 점검해보세요.')
  }

  return parts.join(' ')
}

function serializeTask(task: TaskDocument): SerializedTask {
  return {
    task_id: task._id.toString(),
    curriculum_id: task.curriculum_id.toString(),
    epic_index: task.epic_index,
    story_index: task.story_index,
    epic_title: task.epic_title,
    story_title: task.story_title,
    title: task.title,
    description: task.description,
    status: task.status,
    grade_result: task.grade_result
      ? {
          grade: task.grade_result.grade,
          percentage: task.grade_result.percentage,
          graded_at: task.grade_result.graded_at,
        }
      : null,
  }
}

async function getCurriculumWithTasksInternal(id: string, userId: string): Promise<CurriculumWithTasks | null> {
  try {
    const db = await getDb()
    const idQuery = buildIdQuery(id)

    const results = await db
      .collection<CurriculumDocument>('curricula')
      .aggregate<CurriculumDocument & { tasks: TaskDocument[] }>([
        {
          $match: {
            ...idQuery,
            $or: [{ clerk_user_id: userId }, { clerk_user_id: { $exists: false } }, { clerk_user_id: null }],
          },
        },
        {
          $lookup: {
            from: 'tasks',
            let: { currId: '$_id', currIdStr: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [{ $eq: ['$curriculum_id', '$$currId'] }, { $eq: ['$curriculum_id', '$$currIdStr'] }],
                  },
                },
              },
              { $sort: { epic_index: 1, story_index: 1 } },
            ],
            as: 'tasks',
          },
        },
      ])
      .toArray()

    const curriculumDoc = results[0]
    if (!curriculumDoc) return null

    const tasks = curriculumDoc.tasks || []
    const progress = calculateProgressFromTasks(tasks)
    const weeklySummary = generateWeeklySummary(tasks)

    return {
      curriculum_id: curriculumDoc._id.toString(),
      course_title: curriculumDoc.course_title,
      one_liner: curriculumDoc.one_liner,
      status: curriculumDoc.status,
      total_hours: curriculumDoc.total_hours,
      total_tasks: curriculumDoc.total_tasks,
      completed_tasks: curriculumDoc.completed_tasks,
      structure: curriculumDoc.structure,
      tasks: tasks.map(serializeTask),
      progress,
      weekly_summary: weeklySummary,
    }
  } catch (error) {
    console.error('Error fetching curriculum with tasks:', error)
    return null
  }
}

const getCurriculumWithTasksCached = (id: string, userId: string) =>
  unstable_cache(() => getCurriculumWithTasksInternal(id, userId), [`curriculum-with-tasks-${id}-${userId}`], {
    revalidate: REVALIDATE_TIME,
    tags: [CACHE_TAGS.curriculum(id)],
  })()

export const getCurriculumWithTasks = cache(async (id: string): Promise<CurriculumWithTasks | null> => {
  const { userId } = await auth()
  if (!userId) return null
  return getCurriculumWithTasksCached(id, userId)
})
