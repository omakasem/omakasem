import { NextResponse } from 'next/server'
import { plannerClient } from '@/lib/planner-client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const { planId } = await params

  try {
    const plan = await plannerClient.getPlan(planId)
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Failed to fetch plan:', error)
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
  }
}
