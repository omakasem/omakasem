import {
  ActivityHeatmap,
  AIFeedbackPanel,
  AIRatingBadge,
  EpicNavigation,
  ProgressBar,
  ProgressDisplay,
  StoryList,
  type Epic,
  type Story,
} from '@/components/dashboard'
import { Heading } from '@/components/heading'
import { getActivityData, getCurricula, getCurriculumById } from '@/lib/curricula'
import { SourceCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { DashboardClient } from './dashboard-client'

function transformToEpics(
  structure: { epics: { title: string; description: string; stories: { title: string; description: string }[] }[] } | undefined
): Epic[] {
  if (!structure?.epics) return []
  return structure.epics.map((epic, index) => ({
    id: String(index + 1),
    title: epic.title,
  }))
}

function transformToStories(
  structure: { epics: { title: string; description: string; stories: { title: string; description: string }[] }[] } | undefined,
  epicIndex: number
): Story[] {
  if (!structure?.epics) return []
  const epic = structure.epics[epicIndex]
  if (!epic) return []

  return epic.stories.map((story, index) => ({
    id: `${epicIndex + 1}-${index + 1}`,
    title: story.title,
    description: story.description,
    tasks: [],
  }))
}

export default async function DashboardPage() {
  // Server-side data fetching - no client round trips
  const [curricula, activityData] = await Promise.all([getCurricula(), getActivityData(154)])

  // Get first curriculum details if exists
  const firstCurriculum = curricula.length > 0 ? await getCurriculumById(curricula[0].id) : null

  if (!firstCurriculum) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="text-zinc-500">아직 빌더 여정이 없습니다</div>
        <Link
          href="/onboarding"
          className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          새 빌더 여정 시작하기
        </Link>
      </div>
    )
  }

  const epics = transformToEpics(firstCurriculum.structure)
  const initialStories = transformToStories(firstCurriculum.structure, 0)
  const progress = firstCurriculum.progress

  return (
    <>
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={SourceCodeIcon} size={28} className="text-zinc-950 dark:text-white" />
        <Heading>{firstCurriculum.title}</Heading>
      </div>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <ProgressDisplay progress={progress} />
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          채점 후 피드백
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-300/50 p-1 dark:border-zinc-700/30">
        <div className="flex gap-1">
          <div className="flex flex-col items-center justify-center rounded-xl bg-zinc-100 px-6 py-6 dark:bg-zinc-800/50">
            <AIRatingBadge level="middle" range="32% ~ 64%" />
          </div>

          <div className="flex-1 rounded-xl bg-zinc-100 px-6 py-6 dark:bg-zinc-800/50">
            <ProgressBar progress={progress} className="mb-4" />
            <ActivityHeatmap data={activityData} />
          </div>
        </div>

        <div className="mt-1 rounded-xl bg-zinc-100 px-6 py-4 dark:bg-zinc-800/50">
          <AIFeedbackPanel
            weekLabel="AI 이번주 평가"
            feedback={firstCurriculum.weekly_summary || '이번 주에 완료된 과제가 없습니다. 새로운 과제에 도전해보세요!'}
          />
        </div>
      </div>

      {epics.length > 0 && (
        <DashboardClient
          epics={epics}
          structure={firstCurriculum.structure}
          oneLiner={firstCurriculum.one_liner}
          initialStories={initialStories}
        />
      )}
    </>
  )
}
