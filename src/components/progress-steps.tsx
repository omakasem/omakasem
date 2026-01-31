'use client'

import clsx from 'clsx'

interface ProgressStepsProps {
  currentStep: 1 | 2 | 3
  totalSteps?: number
}

export function ProgressSteps({ currentStep, totalSteps = 3 }: ProgressStepsProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={`step-${i}`}
          className={clsx(
            'h-1 flex-1 rounded-full transition-colors',
            i < currentStep ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-neutral-700'
          )}
        />
      ))}
    </div>
  )
}
