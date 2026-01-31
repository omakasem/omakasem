'use client'

import clsx from 'clsx'
import { HugeiconsIcon } from '@hugeicons/react'
import { AiGenerativeIcon } from '@hugeicons/core-free-icons'

interface AIFeedbackPanelProps {
  weekLabel?: string
  feedback: string
  className?: string
}

export function AIFeedbackPanel({
  weekLabel = 'AI 이번주 평가',
  feedback,
  className,
}: AIFeedbackPanelProps) {
  return (
    <div className={clsx('', className)}>
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{weekLabel}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">{feedback}</div>
    </div>
  )
}

interface AIWeeklySummaryProps {
  summary: string
  date: string
  details?: {
    title: string
    description: string
  }[]
  className?: string
}

export function AIWeeklySummary({ summary, date, details, className }: AIWeeklySummaryProps) {
  return (
    <div className={clsx('rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50', className)}>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <HugeiconsIcon icon={AiGenerativeIcon} size={16} />
          AI 피드백 요약
        </span>
        <span>{date}</span>
      </div>

      <div className="mt-3">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Story 수행 요약</div>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{summary}</p>
      </div>

      {details && details.length > 0 && (
        <div className="mt-4 space-y-3">
          {details.map((detail, index) => (
            <div key={index}>
              <div className="text-xs font-medium text-zinc-500">{detail.title}</div>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{detail.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
