import { NextRequest } from 'next/server'

const REVIEWER_URL = process.env.OMAKASEM_REVIEWER_URL || 'https://reviewer.omakasem.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${REVIEWER_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return Response.json({ error: error || 'Failed to create review' }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error creating review:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
