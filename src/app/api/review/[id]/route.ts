import { NextRequest } from 'next/server'

const REVIEWER_URL = process.env.OMAKASEM_REVIEWER_URL || 'https://reviewer.omakasem.com'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const response = await fetch(`${REVIEWER_URL}/api/review/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: 'Review not found' }, { status: 404 })
      }
      return Response.json({ error: 'Failed to fetch review' }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching review:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
