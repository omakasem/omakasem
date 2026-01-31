import { getDb } from '@/lib/mongodb'
import type { CurriculumDocument } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'
import { ObjectId } from 'mongodb'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return Response.json({ error: 'Invalid curriculum ID' }, { status: 400 })
    }

    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    const curriculum = await collection.findOne({
      _id: objectId,
      clerk_user_id: userId,
    })

    if (!curriculum) {
      return Response.json({ error: 'Curriculum not found' }, { status: 404 })
    }

    return Response.json({
      id: curriculum._id.toString(),
      status: curriculum.status,
      title: curriculum.course_title,
    })
  } catch (error) {
    console.error('Error fetching curriculum status:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
