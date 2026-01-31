'use client'

import { AiGenerativeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'

type RatingLevel = 'beginner' | 'middle' | 'advanced' | 'expert'

interface AIRatingBadgeProps {
  level: RatingLevel
  range?: string
  className?: string
}

const levelConfig: Record<RatingLevel, { label: string; color: string; bgColor: string }> = {
  beginner: {
    label: '비기너',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  middle: {
    label: '미들',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  advanced: {
    label: '어드밴스드',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  expert: {
    label: '엑스퍼트',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
}

export function AIRatingBadge({ level, range, className }: AIRatingBadgeProps) {
  const config = levelConfig[level]

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <div className={clsx('rounded-lg p-4', config.bgColor)}>
        <HugeiconsIcon icon={AiGenerativeIcon} size={32} className={config.color} />
      </div>
      <div className={clsx('mt-2 text-lg font-semibold', config.color)}>{config.label}</div>
      {range && <div className="text-sm text-zinc-500 dark:text-zinc-500">{range}</div>}
    </div>
  )
}
