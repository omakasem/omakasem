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
