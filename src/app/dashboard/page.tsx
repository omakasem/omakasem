import {
  ActivityHeatmap,
  AIRatingBadge,
  ProgressBar,
  ProgressDisplay,
  type Epic,
  type Story,
  type Task,
} from '@/components/dashboard'
import { getActivityData, getCurricula, getCurriculumById, getCurriculumTasks } from '@/lib/curricula'
import type { TaskDocument } from '@/lib/types'
import { AiGenerativeIcon, SourceCodeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { DashboardClient } from './dashboard-client'

function transformToEpics(
  structure:
    | { epics: { title: string; description: string; stories: { title: string; description: string }[] }[] }
    | undefined
): Epic[] {
  if (!structure?.epics) return []
  return structure.epics.map((epic, index) => ({
    id: String(index + 1),
    title: epic.title,
  }))
}

function transformTaskToUI(task: TaskDocument): Task {
  return {
    id: task._id.toString(),
    title: task.title,
    status: task.status,
    grade: task.grade_result?.grade,
    score: task.grade_result?.percentage,
  }
}

function serializeTaskForClient(task: TaskDocument) {
  return {
    _id: task._id.toString(),
    title: task.title,
    status: task.status,
    epic_index: task.epic_index,
    story_index: task.story_index,
    grade_result: task.grade_result,
  }
}

function transformToStoriesWithTasks(
  structure:
    | { epics: { title: string; description: string; stories: { title: string; description: string }[] }[] }
    | undefined,
  epicIndex: number,
  allTasks: TaskDocument[]
): Story[] {
  if (!structure?.epics) return []
  const epic = structure.epics[epicIndex]
  if (!epic) return []

  return epic.stories.map((story, storyIndex) => {
    const storyTasks = allTasks
      .filter((t) => t.epic_index === epicIndex && t.story_index === storyIndex)
      .map(transformTaskToUI)

    return {
      id: `${epicIndex + 1}-${storyIndex + 1}`,
      title: story.title,
      description: story.description,
      tasks: storyTasks,
    }
  })
}

export default async function DashboardPage() {
  const [curricula, activityData] = await Promise.all([getCurricula(), getActivityData(154)])

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

  const tasks = await getCurriculumTasks(firstCurriculum.id)
  const epics = transformToEpics(firstCurriculum.structure)
  const initialStories = transformToStoriesWithTasks(firstCurriculum.structure, 0, tasks)
  const progress = firstCurriculum.progress

  return (
    <>
      <div className="rounded-2xl bg-white/[0.04] p-6 shadow-[0_0_24px_0_rgba(22,22,22,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800">
            <HugeiconsIcon icon={SourceCodeIcon} size={20} className="text-zinc-300" />
          </div>
          <h1 className="text-base font-medium text-white">{firstCurriculum.title}</h1>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-zinc-400/70">AI 평가 기준 진행도</div>
              <ProgressDisplay progress={progress} />
            </div>
            <button
              type="button"
              className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
            >
              <HugeiconsIcon icon={AiGenerativeIcon} size={16} />
              채점 후 피드백
            </button>
          </div>

          <div className="flex-1 rounded-[14px] border border-zinc-700/50 lg:max-w-md">
            <div className="flex gap-2 p-2">
              <div className="flex shrink-0 items-center justify-center rounded-[10px] bg-zinc-800/60 px-5 py-4">
                <AIRatingBadge level="middle" range="32% ~ 64%" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-3 rounded-[10px] bg-zinc-800/60 px-4 py-3">
                <ProgressBar progress={progress} />
                <ActivityHeatmap data={activityData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {epics.length > 0 && (
        <DashboardClient
          epics={epics}
          structure={firstCurriculum.structure}
          oneLiner={firstCurriculum.one_liner}
          initialStories={initialStories}
          allTasks={tasks.map(serializeTaskForClient)}
        />
      )}
    </>
  )
}
