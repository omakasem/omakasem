import { ProgressSteps } from '@/components/progress-steps'
import { Flag } from 'lucide-react'

export default function LoadingPage() {
  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={2} />

      <Flag className="h-8 w-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">빌더 여정 설계 중...</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          빌드할 주제를 기반으로 당신에게 맞는 빌드 루트를 설계합니다.
        </p>
      </div>
    </div>
  )
}
