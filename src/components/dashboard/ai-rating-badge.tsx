'use client'

import clsx from 'clsx'
import Image from 'next/image'

type RatingLevel = 'beginner' | 'middle' | 'advanced'

interface AIRatingBadgeProps {
  level: RatingLevel
  range?: string
  className?: string
}

const levelConfig: Record<RatingLevel, { label: string; color: string; bgColor: string; icon: string }> = {
  beginner: {
    label: '비기너',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: '/icons/levels/level-1',
  },
  middle: {
    label: '미들',
    color: '#028AC7',
    bgColor: 'rgba(2, 138, 199, 0.1)',
    icon: '/icons/levels/level-2',
  },
  advanced: {
    label: '어드밴스드',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    icon: '/icons/levels/level-3',
  },
}

export function AIRatingBadge({ level, range, className }: AIRatingBadgeProps) {
  const config = levelConfig[level]

  return (
    <div
      className={clsx(
        'flex shrink-0 flex-col items-center justify-center gap-[16px] self-stretch rounded-[10px] bg-[rgba(245,245,245,0.04)] p-[32px]',
        className
      )}
      style={{ width: 'auto' }}
    >
      <>
        <Image src={`${config.icon}-light.svg`} alt={config.label} width={64} height={64} className="dark:hidden" />
        <Image
          src={`${config.icon}-dark.svg`}
          alt={config.label}
          width={64}
          height={64}
          className="hidden dark:block"
        />
      </>
      <div className="flex flex-col items-center gap-[2px] self-stretch">
        <span
          className="text-center text-[20px] leading-[1.4] font-semibold tracking-[-0.02em]"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        {range && (
          <span
            className="text-center text-[12px] leading-[1.35] font-normal tracking-[-0.02em]"
            style={{ color: config.color }}
          >
            {range}
          </span>
        )}
      </div>
    </div>
  )
}
