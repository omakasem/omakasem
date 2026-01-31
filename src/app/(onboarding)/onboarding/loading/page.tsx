'use client'

import { ProgressSteps } from '@/components/progress-steps'
import { Flag } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function LoadingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const curriculumId = searchParams.get('id')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!curriculumId) {
      router.push('/onboarding')
      return
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/curricula/${curriculumId}/status`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '상태 확인에 실패했습니다')
        }

        if (data.status === 'active' || data.status === 'completed') {
          router.push(`/dashboard?curriculum=${curriculumId}`)
        } else if (data.status === 'generating') {
          setTimeout(pollStatus, 2000)
        } else {
          setError('커리큘럼 생성에 실패했습니다. 다시 시도해주세요.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      }
    }

    pollStatus()
  }, [curriculumId, router])

  if (error) {
    return (
      <div className="space-y-8">
        <ProgressSteps currentStep={2} />
        <Flag className="h-8 w-8 text-red-500" strokeWidth={1.5} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">오류가 발생했습니다</h1>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          다시 시도하기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={2} />

      <Flag className="h-8 w-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">빌더 여정 설계 중...</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          빌드할 주제를 기반으로 당신에게 맞는 빌드 루트를 설계합니다.
        </p>
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={2} />
      <Flag className="h-8 w-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">빌더 여정 설계 중...</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          빌드할 주제를 기반으로 당신에게 맞는 빌드 루트를 설계합니다.
        </p>
      </div>
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
      </div>
    </div>
  )
}

export default function OnboardingLoadingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoadingContent />
    </Suspense>
  )
}
