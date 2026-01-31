'use client'

import { ProgressSteps } from '@/components/progress-steps'
import { ArrowRight, Flag, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OnboardingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalWeeks: '',
    weeklyHours: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '커리큘럼 생성에 실패했습니다')
      }

      router.push(`/onboarding/loading?id=${data.curriculumId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={1} />

      <Flag className="h-8 w-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">나만의 빌더 여정 시작하기</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          빌드할 주제를 기반으로 당신에게 맞는 빌드 여정을 설계합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            주제 제목
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="주제 제목을 입력해주세요"
            className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            주제 한 줄 설명
          </label>
          <input
            id="description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="주제에 대한 설명을 한 줄 이내로 간단히 입력해주세요"
            className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="totalWeeks" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              총 주차
            </label>
            <input
              id="totalWeeks"
              type="text"
              value={formData.totalWeeks}
              onChange={(e) => setFormData({ ...formData, totalWeeks: e.target.value })}
              placeholder="예: 15주"
              className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="weeklyHours" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              한 주당 투자 가능 시간
            </label>
            <input
              id="weeklyHours"
              type="text"
              value={formData.weeklyHours}
              onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
              placeholder="예: 32시간"
              className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              여정 설계 중...
            </>
          ) : (
            <>
              여정 설계
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
