import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { getDb } from './mongodb'
import type {
  ActivityData,
  ActivityDocument,
  CurriculumDetail,
  CurriculumDocument,
  CurriculumListItem,
  TaskDocument,
} from './types'

/**
 * Helper to build a flexible ID query that works with both ObjectId and string IDs
 */
function buildIdQuery(id: string): { _id: ObjectId } | { _id: string } {
  try {
    // If it's a valid ObjectId format, query as ObjectId
    if (ObjectId.isValid(id) && new ObjectId(id).toString() === id) {
      return { _id: new ObjectId(id) }
    }
  } catch {
    // Not a valid ObjectId
  }
  // Otherwise query as string
  return { _id: id as unknown as ObjectId }
}

export async function getCurricula(): Promise<CurriculumListItem[]> {
  const { userId } = await auth()

  if (!userId) {
    return []
  }

  try {
    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    // Query: user's curricula OR curricula without user assignment (legacy data)
    const curricula = await collection
      .find({
        $or: [
          { clerk_user_id: userId },
          { clerk_user_id: { $exists: false } },
          { clerk_user_id: null },
        ],
      })
      .sort({ updated_at: -1 })
      .toArray()

    return curricula
      .filter((doc) => doc.course_title) // Filter out empty titles
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

export async function getCurriculumById(id: string): Promise<CurriculumDetail | null> {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  try {
    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    // Try to find by either ObjectId or string ID
    const idQuery = buildIdQuery(id)
    const doc = await collection.findOne({
      ...idQuery,
      $or: [
        { clerk_user_id: userId },
        { clerk_user_id: { $exists: false } },
        { clerk_user_id: null },
      ],
    })

    if (!doc) {
      return null
    }

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

export async function getCurriculumTasks(curriculumId: string): Promise<TaskDocument[]> {
  const { userId } = await auth()

  if (!userId) {
    return []
  }

  try {
    const db = await getDb()
    const collection = db.collection<TaskDocument>('tasks')

    // Query with both ObjectId and string curriculum_id
    let tasks: TaskDocument[] = []

    // Try ObjectId first
    try {
      if (ObjectId.isValid(curriculumId)) {
        tasks = await collection
          .find({ curriculum_id: new ObjectId(curriculumId) as unknown as ObjectId })
          .sort({ epic_index: 1, story_index: 1 })
          .toArray()
      }
    } catch {
      // Not a valid ObjectId, ignore
    }

    // If no results, try string
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

export async function getActivityData(days: number = 154): Promise<ActivityData[]> {
  const { userId } = await auth()

  if (!userId) {
    return generateEmptyActivityData(days)
  }

  try {
    const db = await getDb()
    const collection = db.collection<ActivityDocument>('activities')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const activities = await collection
      .find({
        $or: [
          { clerk_user_id: userId },
          { clerk_user_id: { $exists: false } },
        ],
        date: { $gte: startDateStr },
      })
      .sort({ date: 1 })
      .toArray()

    const activityMap = new Map<string, number>()
    for (const activity of activities) {
      const existing = activityMap.get(activity.date) || 0
      activityMap.set(activity.date, existing + activity.count)
    }

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
