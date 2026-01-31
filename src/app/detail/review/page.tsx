'use client'

import { Button } from '@/components/button'
import type { ReviewResult, Suggestion } from '@/components/feedback'
import { FeedbackPanelV2 } from '@/components/feedback'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

type ReviewState = 'idle' | 'submitting' | 'polling' | 'completed' | 'error'

function ReviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialRepo = searchParams.get('repo') || 'https://github.com/junhoyeo/threads-api'

  const [repoUrl, setRepoUrl] = useState(initialRepo)
  const [branch, setBranch] = useState('main')
  const [reviewState, setReviewState] = useState<ReviewState>('idle')
  const [reviewId, setReviewId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const pollReview = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/review/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch review status')
      }

      const data: ReviewResult = await response.json()

      switch (data.status) {
        case 'pending':
          setStatusMessage('리뷰 대기 중...')
          break
        case 'cloning':
          setStatusMessage('저장소 클론 중...')
          break
        case 'running':
          setStatusMessage('코드 분석 중...')
          break
        case 'completed':
          setReviewState('completed')
          setSuggestions(data.suggestions || [])
          return true
        case 'failed':
          setReviewState('error')
          setError(data.error || '리뷰 실패')
          return true
      }

      return false
    } catch {
      setReviewState('error')
      setError('리뷰 상태 확인 실패')
      return true
    }
  }, [])

  useEffect(() => {
    if (reviewState !== 'polling' || !reviewId) return

    const interval = setInterval(async () => {
      const isDone = await pollReview(reviewId)
      if (isDone) {
        clearInterval(interval)
      }
    }, 2000)

    pollReview(reviewId)

    return () => clearInterval(interval)
  }, [reviewState, reviewId, pollReview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewState('submitting')
    setError(null)

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoUrl,
          branch,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create review')
      }

      const data = await response.json()
      setReviewId(data.id)
      setReviewState('polling')
      setStatusMessage('리뷰 시작...')
    } catch (err) {
      setReviewState('error')
      setError(err instanceof Error ? err.message : '리뷰 생성 실패')
    }
  }

  const handleReset = () => {
    setReviewState('idle')
    setReviewId(null)
    setSuggestions([])
    setError(null)
    setStatusMessage('')
  }

  if (reviewState === 'completed') {
    return (
      <div className="h-full w-full p-4">
        <div className="mb-4">
          <Button outline onClick={handleReset}>
            다른 레포 테스트
          </Button>
        </div>
        <FeedbackPanelV2 taskTitle={`Review: ${repoUrl}`} suggestions={suggestions} onClose={() => router.back()} />
      </div>
    )
  }

  return (
    <div className="p-8">
      <Heading className="mb-6">코드 리뷰 테스트</Heading>

      {reviewState === 'idle' && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              GitHub Repository URL
            </label>
            <Input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Branch</label>
            <Input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full max-w-xs"
            />
          </div>
          <Button type="submit">리뷰 시작</Button>
        </form>
      )}

      {(reviewState === 'submitting' || reviewState === 'polling') && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">{statusMessage || '처리 중...'}</p>
          <p className="text-xs text-zinc-400">{repoUrl}</p>
        </div>
      )}

      {reviewState === 'error' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
          <Button outline onClick={handleReset}>
            다시 시도
          </Button>
        </div>
      )}
    </div>
  )
}

function ReviewFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<ReviewFallback />}>
      <ReviewContent />
    </Suspense>
  )
}
