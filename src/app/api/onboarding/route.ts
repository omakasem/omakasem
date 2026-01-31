import { getDb } from '@/lib/mongodb'
import type { CurriculumDocument } from '@/lib/types'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

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
    const totalHours = totalWeeks * weeklyHours

    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    const now = new Date()
    const sessionId = `onboarding_${userId}_${Date.now()}`

    const curriculum: Omit<CurriculumDocument, '_id'> = {
      session_id: sessionId,
      course_title: validatedData.title,
      one_liner: validatedData.description,
      student_id: null,
      clerk_user_id: userId,
      status: 'generating',
      total_hours: totalHours,
      total_tasks: 0,
      completed_tasks: 0,
      structure: {
        epics: [],
      },
      created_at: now,
      updated_at: now,
    }

    const result = await collection.insertOne(curriculum as CurriculumDocument)

    return Response.json({
      success: true,
      curriculumId: result.insertedId.toString(),
      message: '커리큘럼 생성이 시작되었습니다',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating curriculum:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
