'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import type { PlanResponse } from '@/types/planner'

export default function CompletePage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId')
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!planId) {
      setError('Plan ID가 없습니다')
      setLoading(false)
      return
    }

    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}`)
        if (!response.ok) throw new Error('Failed to fetch plan')
        const data = await response.json()
        setPlan(data)
      } catch {
        setError('플랜을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [planId])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-500">플랜 로딩 중...</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="space-y-4 py-8">
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error || '플랜을 찾을 수 없습니다'}
        </div>
      </div>
    )
  }

  // Calculate total task count
  const totalTasks = plan.epics.reduce(
    (sum, epic) =>
      sum + epic.stories.reduce((s, story) => s + story.tasks.length, 0),
    0
  )

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-green-500" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          커리큘럼 생성 완료!
        </h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
            {plan.course_title}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {plan.one_liner}
          </p>
          <div className="mt-4 flex gap-4 text-sm text-zinc-500">
            <span>총 {totalTasks}개 과제</span>
            <span>{plan.epics.length}개 Epic</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Epics ({plan.epics.length}개)
          </h3>
          {plan.epics.map((epic, epicIdx) => (
            <div
              key={epicIdx}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <h4 className="font-medium text-zinc-900 dark:text-white">
                Epic {epic.order}: {epic.title}
              </h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {epic.description}
              </p>
              <div className="mt-3 space-y-2">
                {epic.stories.map((story, storyIdx) => (
                  <div
                    key={storyIdx}
                    className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {story.title}
                    </p>
                    <p className="text-sm text-zinc-500">{story.description}</p>
                    {story.tasks && story.tasks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {story.tasks.map((task, taskIdx) => (
                          <div
                            key={taskIdx}
                            className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            • {task.title}
                            {task.estimated_minutes > 0 && (
                              <span className="ml-2 text-zinc-400">
                                ({task.estimated_minutes}분)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-2 font-medium text-zinc-900 dark:text-white">Raw JSON</h3>
          <pre className="max-h-96 overflow-auto rounded bg-zinc-900 p-4 text-xs text-green-400">
            {JSON.stringify(plan, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
