import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const PLANNER_URL = process.env.OMAKASEM_PLANNER_URL || 'https://planner.omakasem.com'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch(`${PLANNER_URL}/v1/curricula/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: 'Curriculum not found' }, { status: 404 })
      }
      return Response.json({ error: 'Failed to fetch curriculum status' }, { status: response.status })
    }

    const curriculum = await response.json()

    return Response.json({
      id: curriculum.curriculum_id,
      status: curriculum.status === 'approved' ? 'active' : curriculum.status,
      title: curriculum.course_title,
    })
  } catch (error) {
    console.error('Error fetching curriculum status:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
