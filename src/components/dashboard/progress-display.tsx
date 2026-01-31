import clsx from 'clsx'

import { levelConfig, type RatingLevel } from './ai-rating-badge'

interface ProgressDisplayProps {
  progress: number
  label?: string
  className?: string
}

export function ProgressDisplay({ progress, label = 'AI 평가 기준 진행도', className }: ProgressDisplayProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-[4px] p-[4px]', className)}>
      <span className="self-start text-[18px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">
        {label}
      </span>
      <span className="self-start text-[40px] leading-[1.2] font-semibold tracking-[-0.03em] text-[#161616] dark:text-[#F5F5F5]">
        {progress}%
      </span>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  level?: RatingLevel
  className?: string
}

export function ProgressBar({ progress, level = 'middle', className }: ProgressBarProps) {
  const color = levelConfig[level].color

  return (
    <div
      className={clsx(
        'h-[6px] w-full overflow-hidden rounded-full bg-[rgba(164,164,164,0.1)] dark:bg-[rgba(245,245,245,0.04)]',
        className
      )}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}
