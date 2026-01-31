'use client'

import { DraftPreview } from '@/components/draft-preview'
import { EnrichmentStreaming } from '@/components/enrichment-streaming'
import { ProgressSteps } from '@/components/progress-steps'
import { StreamingContent } from '@/components/streaming-content'
import type { CourseInput, CoursePlan, EnrichedCoursePlan } from '@/types/planner'
import { AlertCircle, CheckCircle, Flag, Loader2, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { getSessionInfo, saveCurriculumFromPlan, submitReview } from './actions'

type PageState = 'loading' | 'streaming' | 'ready' | 'submitting' | 'enriching' | 'enrichment_complete' | 'error'

function LoadingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('sessionId')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [input, setInput] = useState<CourseInput | null>(null)
  const [draft, setDraft] = useState<CoursePlan | null>(null)
  const [enrichedPlan, setEnrichedPlan] = useState<EnrichedCoursePlan | null>(null)
  const [plannerSessionId, setPlannerSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

    const sessionInfo = await getSessionInfo(sessionId)
    if (sessionInfo.error || !sessionInfo.plannerSessionId) {
      setError(sessionInfo.error || 'Planner 세션 정보를 가져오는데 실패했습니다')
      setPageState('error')
      return
    }

    setPlannerSessionId(sessionInfo.plannerSessionId)
    setPageState('enriching')
  }

  const handleEnrichmentComplete = useCallback((plan: unknown) => {
    console.log('[handleEnrichmentComplete] received plan:', plan)
    setEnrichedPlan(plan as EnrichedCoursePlan)
    setPageState('enrichment_complete')
  }, [])

  const handleConfirmAndSave = async () => {
    console.log('[handleConfirmAndSave] called', { sessionId, enrichedPlan, plannerSessionId })
    if (!sessionId || !enrichedPlan || !plannerSessionId) {
      console.error('[handleConfirmAndSave] missing sessionId, enrichedPlan, or plannerSessionId')
      return
    }

    setPageState('submitting')

    // POST directly to remote Planner API from client
    try {
      const bodyData = {
        id: plannerSessionId,
        course_title: draft?.title || '',
        one_liner: draft?.oneLiner || '',
        github_url: '',
        epics: enrichedPlan.epics,
        sources: [],
      }
      console.log('[handleConfirmAndSave] POST body size:', JSON.stringify(bodyData).length, 'bytes')
      console.log('[handleConfirmAndSave] POSTing to Planner API...')
      const plannerResponse = await fetch('https://planner.omakasem.com/v1/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })

      if (!plannerResponse.ok) {
        const errorText = await plannerResponse.text()
        throw new Error(`Planner API failed: ${plannerResponse.status} - ${errorText}`)
      }

      const plannerData = await plannerResponse.json()
      const planId = plannerData.id
      console.log('[handleConfirmAndSave] Planner API success, planId:', planId)

      // Save to MongoDB via server action
      console.log('[handleConfirmAndSave] calling saveCurriculumFromPlan for MongoDB...')
      const result = await saveCurriculumFromPlan(sessionId, enrichedPlan)
      console.log('[handleConfirmAndSave] MongoDB result:', result)

      if (result.error) {
        setError(result.error)
        setPageState('error')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('[handleConfirmAndSave] error:', err)
      setError('플랜 저장에 실패했습니다')
      setPageState('error')
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
      <ProgressSteps
        currentStep={
          pageState === 'enrichment_complete' ? 5 : pageState === 'enriching' ? 4 : pageState === 'ready' ? 3 : 2
        }
      />

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
          <StreamingContent sessionId={sessionId} input={input} onComplete={handleComplete} onError={handleError} />
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
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-zinc-200 dark:border-neutral-700" />
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-zinc-900 dark:border-t-white" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-zinc-900 dark:text-white">커리큘럼 업로드 중...</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {pageState === 'enriching' && plannerSessionId && (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">상세 커리큘럼 생성 중...</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              승인된 빌더 여정을 기반으로 상세 학습 과제를 생성합니다.
            </p>
          </div>
          <EnrichmentStreaming
            plannerSessionId={plannerSessionId}
            onComplete={handleEnrichmentComplete}
            onError={handleError}
          />
        </>
      )}

      {pageState === 'enrichment_complete' && enrichedPlan && (
        <>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">상세 계획 생성 완료!</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {enrichedPlan.epics.length}개의 Epic과 {enrichedPlan.epics.reduce((sum, e) => sum + e.stories.length, 0)}
              개의 Story가 생성되었습니다.
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">{enrichedPlan.course_title}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{enrichedPlan.one_liner}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmAndSave}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <CheckCircle className="h-4 w-4" />
            확인
          </button>
        </>
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

function LoadingFallback() {
  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={2} />
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-500">로딩 중...</p>
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoadingContent />
    </Suspense>
  )
}
