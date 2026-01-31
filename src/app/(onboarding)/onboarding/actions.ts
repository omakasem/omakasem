'use server'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getSessionsCollection } from '@/lib/mongodb'
import type { SessionDocument } from '@/types/planner'

const CourseInputSchema = z.object({
  title: z.string().min(1, '주제 제목을 입력해주세요').max(100),
  description: z.string().min(1, '주제 설명을 입력해주세요').max(500),
  totalWeeks: z.coerce.number().int().min(1).max(52),
  weeklyHours: z.coerce.number().int().min(1).max(40),
})

export type CreateSessionState = {
  error?: string
  fieldErrors?: {
    title?: string[]
    description?: string[]
    totalWeeks?: string[]
    weeklyHours?: string[]
  }
}

export async function createSession(
  prevState: CreateSessionState,
  formData: FormData
): Promise<CreateSessionState> {
  const { userId } = await auth()
  if (!userId) {
    return { error: '로그인이 필요합니다' }
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    totalWeeks: formData.get('totalWeeks'),
    weeklyHours: formData.get('weeklyHours'),
  }

  const result = CourseInputSchema.safeParse(rawData)

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as CreateSessionState['fieldErrors'],
    }
  }

  let sessionId: string

  try {
    // Generate local session ID
    sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Save input to MongoDB (Planner API will be called from loading page)
    const sessions = await getSessionsCollection()
    const doc: SessionDocument = {
      sessionId,
      userId,
      status: 'generating',
      input: result.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await sessions.insertOne(doc)
  } catch (error) {
    console.error('[Action] Failed to create session:', error)
    return { error: '세션 생성에 실패했습니다' }
  }

  redirect(`/loading?sessionId=${sessionId}`)
}
