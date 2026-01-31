import { clsx } from 'clsx'

interface ProgressStepsProps {
  currentStep: number
  totalSteps?: number
}

export function ProgressSteps({ currentStep, totalSteps = 3 }: ProgressStepsProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={clsx(
            'h-1 flex-1 rounded-full transition-colors',
            step <= currentStep
              ? 'bg-zinc-900 dark:bg-white'
              : 'bg-zinc-200 dark:bg-zinc-700'
          )}
        />
      ))}
    </div>
  )
}
