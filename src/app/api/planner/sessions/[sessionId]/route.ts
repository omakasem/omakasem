import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSessionsCollection } from '@/lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    const sessions = await getSessionsCollection()
    const session = await sessions.findOne({ sessionId, userId })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      status: session.status,
      input: session.input,
      draft: session.draft,
    })
  } catch (error) {
    console.error('Failed to get session:', error)
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
  }
}
