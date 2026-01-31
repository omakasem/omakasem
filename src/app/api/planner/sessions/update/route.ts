import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSessionsCollection } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, plannerSessionId, draft, status } = await request.json()

    const sessions = await getSessionsCollection()
    await sessions.updateOne(
      { sessionId, userId },
      {
        $set: {
          plannerSessionId,
          draft,
          status,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
