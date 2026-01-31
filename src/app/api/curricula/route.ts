import { getDb } from '@/lib/mongodb'
import type { CurriculumDocument, CurriculumListItem } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    const curricula = await collection.find({ clerk_user_id: userId }).sort({ updated_at: -1 }).toArray()

    const response: CurriculumListItem[] = curricula.map((doc) => ({
      id: doc._id.toString(),
      title: doc.course_title,
      icon: doc.icon,
      progress: doc.total_tasks > 0 ? Math.round((doc.completed_tasks / doc.total_tasks) * 100) : 0,
      status: doc.status,
    }))

    return Response.json(response)
  } catch (error) {
    console.error('Error fetching curricula:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
