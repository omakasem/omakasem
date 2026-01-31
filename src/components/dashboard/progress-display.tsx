'use client'

import clsx from 'clsx'

interface ProgressDisplayProps {
  progress: number
  label?: string
  className?: string
}

export function ProgressDisplay({ progress, label = 'AI 평가 기준 진행도', className }: ProgressDisplayProps) {
  return (
    <div className={clsx('', className)}>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-5xl font-bold text-zinc-950 dark:text-white">{progress}%</div>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={clsx('h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700', className)}>
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
