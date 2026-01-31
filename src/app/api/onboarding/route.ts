import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

const PLANNER_URL = process.env.OMAKASEM_PLANNER_URL || 'https://planner.omakasem.com'

const onboardingSchema = z.object({
  title: z.string().min(1, '주제 제목을 입력해주세요'),
  description: z.string().min(1, '주제 설명을 입력해주세요'),
  totalWeeks: z.string().min(1, '총 주차를 입력해주세요'),
  weeklyHours: z.string().min(1, '주당 투자 가능 시간을 입력해주세요'),
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = onboardingSchema.parse(body)

    // Parse weeks and hours from strings (e.g., "15주" -> 15, "32시간" -> 32)
    const weeksMatch = validatedData.totalWeeks.match(/\d+/)
    const hoursMatch = validatedData.weeklyHours.match(/\d+/)

    const totalWeeks = weeksMatch ? parseInt(weeksMatch[0], 10) : 12
    const weeklyHours = hoursMatch ? parseInt(hoursMatch[0], 10) : 10

    const sessionResponse = await fetch(`${PLANNER_URL}/v1/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: validatedData.title,
        description: validatedData.description,
        total_weeks: totalWeeks,
        hours_per_week: weeklyHours,
      }),
    })

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text()
      console.error('Planner session creation failed:', errorText)
      return Response.json({ error: '커리큘럼 생성에 실패했습니다' }, { status: 500 })
    }

    const sessionData = await sessionResponse.json()
    const sessionId = sessionData.session_id

    const approveResponse = await fetch(`${PLANNER_URL}/v1/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })

    if (!approveResponse.ok) {
      const errorText = await approveResponse.text()
      console.error('Draft approval failed:', errorText)
      return Response.json({ error: '커리큘럼 승인에 실패했습니다' }, { status: 500 })
    }

    const saveResponse = await fetch(`${PLANNER_URL}/v1/curricula`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text()
      console.error('Curriculum save failed:', errorText)
      return Response.json({ error: '커리큘럼 저장에 실패했습니다' }, { status: 500 })
    }

    const curriculumData = await saveResponse.json()

    return Response.json({
      success: true,
      curriculumId: curriculumData.curriculum_id,
      message: '커리큘럼이 생성되었습니다',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }

    console.error('Error creating curriculum:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
