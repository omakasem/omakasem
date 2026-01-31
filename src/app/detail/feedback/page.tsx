'use client'

import type { Suggestion } from '@/components/feedback'
import { FeedbackLayout } from '@/components/feedback'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

type PageState = 'loading' | 'no-repo' | 'reviewing' | 'ready' | 'error'

interface CurriculumData {
  course_title: string
  git_repo?: string
}

interface ReviewResult {
  status: 'pending' | 'cloning' | 'running' | 'completed' | 'failed'
  suggestions?: Suggestion[]
  error?: string
}

function FeedbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const curriculumId = searchParams.get('curriculumId')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const pollReview = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/review/${id}`)
      if (!response.ok) throw new Error('Failed to fetch review status')

      const data: ReviewResult = await response.json()

      switch (data.status) {
        case 'pending':
          setStatusMessage('리뷰 대기 중...')
          return false
        case 'cloning':
          setStatusMessage('저장소 클론 중...')
          return false
        case 'running':
          setStatusMessage('코드 분석 중...')
          return false
        case 'completed':
          setSuggestions(data.suggestions || [])
          setPageState('ready')
          return true
        case 'failed':
          setError(data.error || '리뷰 실패')
          setPageState('error')
          return true
      }
      return false
    } catch {
      setError('리뷰 상태 확인 실패')
      setPageState('error')
      return true
    }
  }, [])

  useEffect(() => {
    if (!curriculumId) {
      setError('curriculumId가 필요합니다')
      setPageState('error')
      return
    }

    fetch(`/api/curricula/${curriculumId}`)
      .then((res) => res.json())
      .then(async (data) => {
        const currData: CurriculumData = {
          course_title: data.course_title,
          git_repo: data.git_repo,
        }
        setCurriculum(currData)

        if (!currData.git_repo) {
          setPageState('no-repo')
          return
        }

        setPageState('reviewing')
        setStatusMessage('리뷰 시작 중...')

        const reviewResponse = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo_url: currData.git_repo, branch: 'main' }),
        })

        if (!reviewResponse.ok) {
          const errData = await reviewResponse.json()
          throw new Error(errData.error || 'Failed to create review')
        }

        const reviewData = await reviewResponse.json()
        setReviewId(reviewData.review_id || reviewData.id)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '로딩 실패')
        setPageState('error')
      })
  }, [curriculumId])

  useEffect(() => {
    if (pageState !== 'reviewing' || !reviewId) return

    const interval = setInterval(async () => {
      const isDone = await pollReview(reviewId)
      if (isDone) clearInterval(interval)
    }, 2000)

    pollReview(reviewId)
    return () => clearInterval(interval)
  }, [pageState, reviewId, pollReview])

  if (pageState === 'loading') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 mt-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-500">커리큘럼 로딩 중...</p>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 mt-12">
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
        <button onClick={() => router.back()} className="text-sm text-zinc-500 underline hover:text-zinc-700">
          돌아가기
        </button>
      </div>
    )
  }

  if (pageState === 'no-repo') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 mt-12">
        <p className="text-zinc-500">이 커리큘럼에는 연결된 저장소가 없습니다.</p>
        <button onClick={() => router.back()} className="text-sm text-zinc-500 underline hover:text-zinc-700">
          돌아가기
        </button>
      </div>
    )
  }

  if (pageState === 'reviewing') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 mt-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-sm text-zinc-500">{statusMessage}</p>
        <p className="text-xs text-zinc-400">{curriculum?.git_repo}</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-1rem)] w-full p-2">
      <FeedbackLayout
        taskTitle={curriculum?.course_title || '코드 리뷰'}
        repoUrl={curriculum?.git_repo || ''}
        suggestions={suggestions}
        onClose={() => router.back()}
      />
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-zinc-500">로딩 중...</div>
        </div>
      }
    >
      <FeedbackPageContent />
    </Suspense>
  )
}
