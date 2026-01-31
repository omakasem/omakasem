import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const PLANNER_URL = process.env.OMAKASEM_PLANNER_URL || 'https://planner.omakasem.com'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Log the URL being used for debugging
console.log('PLANNER_URL:', PLANNER_URL)

interface Task {
  task_id: string
  curriculum_id: string
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
  created_at: string
  updated_at: string
}

interface Curriculum {
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
}

interface CurriculumResponse extends Curriculum {
  progress: number
  weekly_summary: string
}

function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  const passedTasks = tasks.filter((t) => t.status === 'passed').length
  const partialTasks = tasks.filter((t) => t.status === 'partial').length

  // passed = 100%, partial = 50%
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

  const avgScore =
    recentTasks.reduce((sum, t) => sum + (t.grade_result?.percentage || 0), 0) / recentTasks.length

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

async function generateAIWeeklySummary(curriculum: Curriculum, tasks: Task[]): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    return generateFallbackSummary(tasks)
  }

  const recentTasks = getRecentTasks(tasks)
  if (recentTasks.length === 0) {
    return '이번 주에 완료된 과제가 없습니다. 새로운 과제에 도전해보세요!'
  }

  const isOAuthToken = ANTHROPIC_API_KEY.startsWith('sk-ant-oat')

  const taskSummaries = recentTasks.map((t) => ({
    title: t.title,
    status: t.status,
    score: t.grade_result?.percentage || 0,
    grade: t.grade_result?.grade || 'N/A',
  }))

  const prompt = `당신은 개발자 교육 플랫폼의 AI 멘토입니다. 학생의 이번 주 학습 진행 상황을 바탕으로 따뜻하고 격려하는 피드백을 작성해주세요.

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
    if (isOAuthToken) {
      const response = await fetch('https://api.anthropic.com/v1/messages?beta=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          Authorization: `Bearer ${ANTHROPIC_API_KEY}`,
          'anthropic-beta': 'oauth-2025-04-20',
          'anthropic-product': 'claude-code',
          'user-agent': 'claude-cli/2.1.2 (external, cli)',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 256,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        console.error('Anthropic OAuth API error:', response.status)
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
      messages: [{ role: 'user', content: prompt }],
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const response = await fetch(`${PLANNER_URL}/v1/curricula/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({ error: 'Curriculum not found' }, { status: 404 })
      }
      if (response.status === 503) {
        return Response.json({ error: 'Planner service unavailable' }, { status: 503 })
      }
      return Response.json({ error: 'Failed to fetch curriculum' }, { status: response.status })
    }

    const curriculum: Curriculum = await response.json()
    const weeklySummary = await generateAIWeeklySummary(curriculum, curriculum.tasks)

    const result: CurriculumResponse = {
      ...curriculum,
      progress: calculateProgress(curriculum.tasks),
      weekly_summary: weeklySummary,
    }

    return Response.json(result)
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
