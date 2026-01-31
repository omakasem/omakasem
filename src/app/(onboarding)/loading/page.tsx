'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProgressSteps } from '@/components/progress-steps'
import { StreamingContent } from '@/components/streaming-content'
import { DraftPreview } from '@/components/draft-preview'
import { Flag, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { CoursePlan, CourseInput } from '@/types/planner'
import { submitReview } from './actions'

type PageState = 'loading' | 'streaming' | 'ready' | 'submitting' | 'error'

export default function LoadingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('sessionId')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [input, setInput] = useState<CourseInput | null>(null)
  const [draft, setDraft] = useState<CoursePlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch session input on mount
  useEffect(() => {
    if (!sessionId) return

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/planner/sessions/${sessionId}`)
        if (!response.ok) throw new Error('Failed to fetch session')

        const data = await response.json()
        if (data.input) {
          setInput(data.input)
          setPageState('streaming')
        } else {
          throw new Error('No input found')
        }
      } catch {
        setError('세션을 불러오는데 실패했습니다')
        setPageState('error')
      }
    }

    fetchSession()
  }, [sessionId])

  const handleComplete = useCallback((completedDraft: unknown) => {
    setDraft(completedDraft as CoursePlan)
    setPageState('ready')
  }, [])

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setPageState('error')
  }, [])

  const handleApprove = async () => {
    if (!sessionId) return

    setPageState('submitting')
    const result = await submitReview(sessionId, 'approve')

    if (result.error) {
      setError(result.error)
      setPageState('error')
    } else if (result.success) {
      router.push('/')
    }
  }

  const handleReject = async () => {
    if (!sessionId) return

    setPageState('submitting')
    const result = await submitReview(sessionId, 'reject')

    if (result.error) {
      setError(result.error)
      setPageState('error')
    } else {
      router.push('/onboarding')
    }
  }

  if (!sessionId) {
    return (
      <div className="space-y-8">
        <ProgressSteps currentStep={2} />
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          세션 ID가 없습니다. 온보딩을 다시 시작해주세요.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={pageState === 'ready' ? 3 : 2} />

      <Flag className="h-8 w-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />

      {pageState === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">세션 로딩 중...</p>
        </div>
      )}

      {pageState === 'streaming' && input && (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">빌더 여정 설계 중...</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              빌드할 주제를 기반으로 당신에게 맞는 빌드 루트를 설계합니다.
            </p>
          </div>
          <StreamingContent
            sessionId={sessionId}
            input={input}
            onComplete={handleComplete}
            onError={handleError}
          />
        </>
      )}

      {pageState === 'ready' && draft && (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">빌더 여정 설계 완료!</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              아래 내용을 확인하고 승인하시면 학습을 시작할 수 있습니다.
            </p>
          </div>

          <DraftPreview draft={draft} />

          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-300 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-neutral-600 dark:text-zinc-300 dark:hover:bg-neutral-800"
            >
              <XCircle className="h-4 w-4" />
              다시 설계
            </button>
            <button
              onClick={handleApprove}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <CheckCircle className="h-4 w-4" />
              승인하고 시작
            </button>
          </div>
        </>
      )}

      {pageState === 'submitting' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">처리 중...</p>
        </div>
      )}

      {pageState === 'error' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-neutral-600 dark:text-zinc-300 dark:hover:bg-neutral-800"
          >
            온보딩으로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}
