'use client'

import { Button } from '@/components/button'
import { FeedbackPanel } from '@/components/feedback'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function ReviewTestContent() {
  const searchParams = useSearchParams()
  const initialRepo = searchParams.get('repo') || 'https://github.com/junhoyeo/threads-api'

  const [repoUrl, setRepoUrl] = useState(initialRepo)
  const [branch, setBranch] = useState('main')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Heading className="mb-6">코드 리뷰 테스트</Heading>

        {!submitted ? (
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
        ) : (
          <div className="mb-4">
            <Button outline onClick={() => setSubmitted(false)}>
              다른 레포 테스트
            </Button>
          </div>
        )}

        {submitted && <FeedbackPanel repoUrl={repoUrl} branch={branch} />}
      </div>
    </div>
  )
}
export default function ReviewTestPage() {
  return (
    <Suspense fallback={<ReviewTestFallback />}>
      <ReviewTestContent />
    </Suspense>
  )
}
