import { getDb } from '@/lib/mongodb'
import type { ActivityData, ActivityDocument } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '154', 10)

  try {
    const db = await getDb()
    const collection = db.collection<ActivityDocument>('activities')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const activities = await collection
      .find({
        clerk_user_id: userId,
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

    return Response.json(response)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
