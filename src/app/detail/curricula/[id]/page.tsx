import { Badge } from '@/components/badge'
import { Heading, Subheading } from '@/components/heading'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

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

async function getCurriculum(id: string): Promise<CurriculumResponse | null> {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'

  try {
    const response = await fetch(`${protocol}://${host}/api/curricula/${id}`, {
      next: { revalidate: 60, tags: [`curriculum-${id}`] },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const curriculum = await getCurriculum(id)

  return {
    title: curriculum?.course_title || 'Curriculum Not Found',
    description: curriculum?.one_liner,
  }
}

function getStatusColor(status: Task['status']): 'lime' | 'yellow' | 'red' | 'zinc' {
  switch (status) {
    case 'passed':
      return 'lime'
    case 'partial':
      return 'yellow'
    case 'failed':
      return 'red'
    default:
      return 'zinc'
  }
}

function getStatusLabel(status: Task['status']): string {
  switch (status) {
    case 'passed':
      return '통과'
    case 'partial':
      return '부분 통과'
    case 'failed':
      return '실패'
    default:
      return '대기'
  }
}

export default async function CurriculumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const curriculum = await getCurriculum(id)

  if (!curriculum) {
    return notFound()
  }

  const tasksByEpic = curriculum.tasks.reduce(
    (acc, task) => {
      const key = task.epic_index
      if (!acc[key]) {
        acc[key] = {
          title: task.epic_title,
          tasks: [],
        }
      }
      acc[key].tasks.push(task)
      return acc
    },
    {} as Record<number, { title: string; tasks: Task[] }>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heading>{curriculum.course_title}</Heading>
            <Badge color={curriculum.progress >= 70 ? 'lime' : curriculum.progress >= 30 ? 'yellow' : 'zinc'}>
              {curriculum.progress}%
            </Badge>
          </div>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{curriculum.one_liner}</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">총 학습 시간</div>
            <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">
              {curriculum.total_hours}시간
            </div>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">전체 과제</div>
            <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">{curriculum.total_tasks}개</div>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">완료 과제</div>
            <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">
              {curriculum.completed_tasks}개
            </div>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">상태</div>
            <div className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">{curriculum.status}</div>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
          <Subheading>이번 주 학습 요약</Subheading>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{curriculum.weekly_summary}</p>
        </div>

        <div className="space-y-8">
          {Object.entries(tasksByEpic).map(([epicIndex, epic]) => (
            <div key={epicIndex}>
              <Subheading className="mb-4">
                Epic {Number(epicIndex) + 1}: {epic.title}
              </Subheading>
              <div className="space-y-3">
                {epic.tasks.map((task) => (
                  <div key={task.task_id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-900 dark:text-white">{task.title}</span>
                          <Badge color={getStatusColor(task.status)}>{getStatusLabel(task.status)}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
                        <div className="mt-2 text-xs text-zinc-500">
                          Story: {task.story_title}
                          {task.estimated_minutes && ` · ${task.estimated_minutes}분`}
                        </div>
                      </div>
                      {task.grade_result && (
                        <div className="ml-4 text-right">
                          <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {task.grade_result.percentage}%
                          </div>
                          <div className="text-sm text-zinc-500">{task.grade_result.grade}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <details className="mt-12">
          <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            Raw API Response (Debug)
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
            {JSON.stringify(curriculum, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
