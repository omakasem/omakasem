import { ActivityHeatmap, AIRatingBadge, ProgressBar, type Epic, type Story, type Task } from '@/components/dashboard'
import { getActivityData, getCurricula, getCurriculumById, getCurriculumTasks } from '@/lib/curricula'
import type { TaskDocument } from '@/lib/types'
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

function SourceCodeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.3333 2.5V5M15.8333 3.75H10.8333M16.6667 7.5V10M18.3333 8.75H15M5 17.5L15 7.5M6.66667 10.8333L9.16667 13.3333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface PageProps {
  searchParams: Promise<{ curriculum?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { curriculum: curriculumId } = await searchParams
  const [curricula, activityData] = await Promise.all([getCurricula(), getActivityData(154)])

  const targetCurriculumId = curriculumId || (curricula.length > 0 ? curricula[0].id : null)
  const curriculum = targetCurriculumId ? await getCurriculumById(targetCurriculumId) : null

  if (!curriculum) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="text-[rgba(245,245,245,0.72)]">아직 빌더 여정이 없습니다</div>
        <Link
          href="/onboarding"
          className="rounded-full bg-[#F5F5F5] px-5 py-2.5 text-[14px] font-medium text-[#161616]"
        >
          새 빌더 여정 시작하기
        </Link>
      </div>
    )
  }

  const tasks = await getCurriculumTasks(curriculum.id)
  const epics = transformToEpics(curriculum.structure)
  const initialStories = transformToStoriesWithTasks(curriculum.structure, 0, tasks)
  const progress = curriculum.progress
  const aiFeedback =
    'Python과 웹 개발 기초를 적절히 익혀, 원활히 FastAPI 환경을 설정했습니다. 하지만, 일부 함수에 대한 이해도가 미흡해 복습이 필요합니다.'

  return (
    <div className="rounded-[16px] bg-[rgba(255,255,255,0.04)] shadow-[0_0_24px_0_rgba(22,22,22,0.06)]">
      <div className="flex items-center gap-[10px] p-[20px]">
        <div className="flex size-[24px] items-center justify-center text-[#FFFFFF]">
          <SourceCodeIcon />
        </div>
        <span className="text-[16px] leading-[1.5] font-medium tracking-[-0.02em] text-[#F5F5F5]">
          {curriculum.title}
        </span>
      </div>

      <div className="flex flex-col gap-[40px] px-[20px] pt-[8px] pb-[20px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center justify-between gap-[8px]">
            <div className="flex flex-col items-center justify-center gap-[4px] p-[4px]">
              <span className="self-start text-[18px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.72)]">
                AI 평가 기준 진행도
              </span>
              <span className="self-start text-[40px] leading-[1.2] font-semibold tracking-[-0.03em] text-[#F5F5F5]">
                {progress}%
              </span>
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-[6px] rounded-full bg-[#F5F5F5] px-[12px] py-[12px] text-[#161616]"
            >
              <WandIcon />
              <span className="text-[14px] leading-[1.45] font-medium tracking-[-0.02em]">채점 후 피드백</span>
            </button>
          </div>

          <div className="flex flex-col gap-[4px] rounded-[14px] border border-[rgba(164,164,164,0.2)] p-[4px]">
            <div className="flex items-center gap-[4px]">
              <AIRatingBadge level="middle" range="32% ~ 64%" />
              <div className="flex flex-1 flex-col gap-[16px] self-stretch rounded-[10px] bg-[rgba(245,245,245,0.04)] p-[16px]">
                <ProgressBar progress={progress} />
                <ActivityHeatmap data={activityData} />
              </div>
            </div>

            <div className="flex flex-col gap-[2px] rounded-[10px] bg-[rgba(245,245,245,0.04)] p-[20px]">
              <span className="text-[14px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.72)]">
                AI 이번주 평가
              </span>
              <p className="text-[16px] leading-[1.5] font-medium tracking-[-0.02em] text-[#F5F5F5]">{aiFeedback}</p>
            </div>
          </div>
        </div>

        {epics.length > 0 && (
          <DashboardClient
            epics={epics}
            structure={curriculum.structure}
            oneLiner={curriculum.one_liner}
            allTasks={tasks.map(serializeTaskForClient)}
          />
        )}
      </div>
    </div>
  )
}
