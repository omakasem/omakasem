import { getDb } from '@/lib/mongodb'
import Anthropic from '@anthropic-ai/sdk'
import { ObjectId } from 'mongodb'
import { NextRequest } from 'next/server'

export const revalidate = 60

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const OAUTH_BETA_FEATURES = 'oauth-2025-04-20,interleaved-thinking-2025-05-14'
const OAUTH_USER_AGENT = 'claude-cli/2.1.2 (external, cli)'

function isOAuthToken(token: string): boolean {
  return token.startsWith('sk-ant-oat')
}

interface Task {
  _id: string | ObjectId
  task_id?: string
  curriculum_id: string | ObjectId
  epic_index: number
  story_index: number
  epic_title: string
  story_title: string
  title: string
  description: string
  acceptance_criteria: { description: string; weight: number }[]
  estimated_minutes: number | null
  status: 'pending' | 'partial' | 'passed' | 'failed'
  grade_result: {
    grade_job_id: string
    score: number
    percentage: number
    grade: string
    criteria_results: unknown[]
    repo_url: string
    graded_at: string
  } | null
  created_at: string | Date
  updated_at: string | Date
}

interface CurriculumDocument {
  _id: string | ObjectId
  session_id: string
  course_title: string
  one_liner: string
  student_id: string | null
  clerk_user_id?: string | null
  status: string
  total_hours: number
  total_tasks: number
  completed_tasks: number
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
  created_at: string | Date
  updated_at: string | Date
}

interface CurriculumResponse {
  curriculum_id: string
  session_id: string
  course_title: string
  one_liner: string
  student_id: string | null
  status: string
  total_hours: number
  total_tasks: number
  completed_tasks: number
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
  created_at: string
  updated_at: string
  tasks: Task[]
  progress: number
  weekly_summary: string
}

function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  const passedTasks = tasks.filter((t) => t.status === 'passed').length
  const partialTasks = tasks.filter((t) => t.status === 'partial').length

  const score = passedTasks * 100 + partialTasks * 50
  const maxScore = tasks.length * 100

  return Math.round((score / maxScore) * 100)
}

function getRecentTasks(tasks: Task[]): Task[] {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return tasks.filter((t) => {
    if (!t.grade_result?.graded_at) return false
    const gradedAt = new Date(t.grade_result.graded_at)
    return gradedAt >= oneWeekAgo
  })
}

function generateFallbackSummary(tasks: Task[]): string {
  const recentTasks = getRecentTasks(tasks)

  if (recentTasks.length === 0) {
    return '이번 주에 완료된 과제가 없습니다. 새로운 과제에 도전해보세요!'
  }

  const passedCount = recentTasks.filter((t) => t.status === 'passed').length
  const partialCount = recentTasks.filter((t) => t.status === 'partial').length
  const failedCount = recentTasks.filter((t) => t.status === 'failed').length

  const avgScore = recentTasks.reduce((sum, t) => sum + (t.grade_result?.percentage || 0), 0) / recentTasks.length

  const parts: string[] = []
  parts.push(`이번 주 ${recentTasks.length}개의 과제를 제출했습니다.`)

  if (passedCount > 0) parts.push(`${passedCount}개 통과`)
  if (partialCount > 0) parts.push(`${partialCount}개 부분 통과`)
  if (failedCount > 0) parts.push(`${failedCount}개 재도전 필요`)

  parts.push(`평균 점수: ${Math.round(avgScore)}점`)

  if (avgScore >= 90) {
    parts.push('우수한 성과를 보이고 있습니다!')
  } else if (avgScore >= 75) {
    parts.push('좋은 진행을 보이고 있습니다.')
  } else if (avgScore >= 60) {
    parts.push('꾸준히 노력하고 있습니다.')
  } else {
    parts.push('복습이 필요한 부분을 점검해보세요.')
  }

  return parts.join(' ')
}

async function generateAIWeeklySummary(curriculum: CurriculumDocument, tasks: Task[]): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    console.log('No ANTHROPIC_API_KEY configured')
    return generateFallbackSummary(tasks)
  }

  const recentTasks = getRecentTasks(tasks)
  if (recentTasks.length === 0) {
    return '이번 주에 완료된 과제가 없습니다. 새로운 과제에 도전해보세요!'
  }

  const useOAuth = isOAuthToken(ANTHROPIC_API_KEY)

  const taskSummaries = recentTasks.map((t) => ({
    title: t.title,
    status: t.status,
    score: t.grade_result?.percentage || 0,
    grade: t.grade_result?.grade || 'N/A',
  }))

  const userPrompt = `당신은 개발자 교육 플랫폼의 AI 멘토입니다. 학생의 이번 주 학습 진행 상황을 바탕으로 따뜻하고 격려하는 피드백을 작성해주세요.

코스: ${curriculum.course_title}
코스 설명: ${curriculum.one_liner}

이번 주 완료한 과제:
${taskSummaries.map((t) => `- ${t.title}: ${t.status} (${t.score}점, ${t.grade})`).join('\n')}

다음 조건을 지켜주세요:
1. 한국어로 작성
2. 2-3문장으로 간결하게
3. 구체적인 과제명을 언급하여 개인화된 피드백 제공
4. 잘한 점을 칭찬하고, 개선이 필요한 부분은 부드럽게 제안
5. 다음 학습에 대한 동기부여 포함`

  try {
    if (useOAuth) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': ANTHROPIC_VERSION,
        Authorization: `Bearer ${ANTHROPIC_API_KEY}`,
        'anthropic-beta': OAUTH_BETA_FEATURES,
        'anthropic-product': 'claude-code',
        'user-agent': OAUTH_USER_AGENT,
      }

      const systemBlocks = [
        {
          type: 'text',
          text: "You are Claude Code, Anthropic's official CLI for Claude.",
          cache_control: { type: 'ephemeral' },
        },
      ]

      const response = await fetch(`${ANTHROPIC_API_URL}?beta=true`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 256,
          system: systemBlocks,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Anthropic OAuth API error:', response.status, errorText)
        return generateFallbackSummary(tasks)
      }

      const data = await response.json()
      const content = data.content?.[0]
      if (content?.type === 'text') {
        return content.text
      }
      return generateFallbackSummary(tasks)
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text
    }
    return generateFallbackSummary(tasks)
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return generateFallbackSummary(tasks)
  }
}

function buildIdQuery(id: string): { _id: ObjectId } | { _id: string } {
  try {
    if (ObjectId.isValid(id) && new ObjectId(id).toString() === id) {
      return { _id: new ObjectId(id) }
    }
  } catch {}
  return { _id: id as unknown as ObjectId }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const db = await getDb()
    const idQuery = buildIdQuery(id)

    const results = await db
      .collection<CurriculumDocument>('curricula')
      .aggregate<CurriculumDocument & { tasks: Task[] }>([
        { $match: idQuery },
        {
          $lookup: {
            from: 'tasks',
            let: { currId: '$_id', currIdStr: { $toString: '$_id' } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [{ $eq: ['$curriculum_id', '$$currId'] }, { $eq: ['$curriculum_id', '$$currIdStr'] }],
                  },
                },
              },
              { $sort: { epic_index: 1, story_index: 1 } },
            ],
            as: 'tasks',
          },
        },
      ])
      .toArray()

    const curriculumDoc = results[0]

    if (!curriculumDoc) {
      return Response.json({ error: 'Curriculum not found' }, { status: 404 })
    }

    const tasks: Task[] = curriculumDoc.tasks || []

    const weeklySummary = await generateAIWeeklySummary(curriculumDoc, tasks)

    const result: CurriculumResponse = {
      curriculum_id: curriculumDoc._id.toString(),
      session_id: curriculumDoc.session_id,
      course_title: curriculumDoc.course_title,
      one_liner: curriculumDoc.one_liner,
      student_id: curriculumDoc.student_id,
      status: curriculumDoc.status,
      total_hours: curriculumDoc.total_hours,
      total_tasks: curriculumDoc.total_tasks,
      completed_tasks: curriculumDoc.completed_tasks,
      structure: curriculumDoc.structure,
      created_at:
        curriculumDoc.created_at instanceof Date ? curriculumDoc.created_at.toISOString() : curriculumDoc.created_at,
      updated_at:
        curriculumDoc.updated_at instanceof Date ? curriculumDoc.updated_at.toISOString() : curriculumDoc.updated_at,
      tasks: tasks.map((t) => ({
        ...t,
        _id: t._id.toString(),
        task_id: t._id.toString(),
        curriculum_id: t.curriculum_id.toString(),
        created_at: t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at,
        updated_at: t.updated_at instanceof Date ? t.updated_at.toISOString() : t.updated_at,
      })),
      progress: calculateProgress(tasks),
      weekly_summary: weeklySummary,
    }

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
