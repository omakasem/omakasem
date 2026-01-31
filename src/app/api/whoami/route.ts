import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({
    clerk_user_id: userId,
    username: user?.username,
    email: user?.emailAddresses?.[0]?.emailAddress,
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
  })
}
