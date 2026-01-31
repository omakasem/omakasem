import { ActivityHeatmap, AIRatingBadge, ProgressBar, type Epic, type RatingLevel } from '@/components/dashboard'
import { MarkdownText } from '@/components/markdown-text'
import { getActivityData, getCurricula, getCurriculumWithTasks, type CurriculumWithTasks } from '@/lib/curricula'
import Image from 'next/image'
import Link from 'next/link'
import { DashboardClient } from './dashboard-client'

function transformToEpics(structure: CurriculumWithTasks['structure'] | undefined): Epic[] {
  if (!structure?.epics) return []
  return structure.epics.map((epic, index) => ({
    id: String(index + 1),
    title: epic.title,
  }))
}

function serializeTaskForClient(task: CurriculumWithTasks['tasks'][number]) {
  return {
    _id: task.task_id,
    title: task.title,
    status: task.status,
    epic_index: task.epic_index,
    story_index: task.story_index,
    grade_result: task.grade_result
      ? {
          grade: task.grade_result.grade,
          percentage: task.grade_result.percentage,
          graded_at: task.grade_result.graded_at,
        }
      : null,
  }
}

function getRatingLevel(progress: number): RatingLevel {
  if (progress >= 66) return 'advanced'
  if (progress >= 33) return 'middle'
  return 'beginner'
}

function getRatingRange(level: RatingLevel): string {
  switch (level) {
    case 'beginner':
      return '0% ~ 33%'
    case 'middle':
      return '33% ~ 66%'
    case 'advanced':
      return '66% ~ 100%'
    default:
      return '0% ~ 100%'
  }
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

interface PageProps {
  searchParams: Promise<{ curriculum?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { curriculum: curriculumId } = await searchParams
  const [curricula, activityData] = await Promise.all([getCurricula(), getActivityData(154)])

  const targetCurriculumId = curriculumId || (curricula.length > 0 ? curricula[0].id : null)

  if (targetCurriculumId?.includes('mock')) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">
          빌더 여정을 찾을 수 없습니다
        </div>
        <Link
          href="/onboarding"
          className="rounded-full bg-[#161616] px-5 py-2.5 text-[14px] font-medium text-[#F5F5F5] dark:bg-[#F5F5F5] dark:text-[#161616]"
        >
          새 빌더 여정 시작하기
        </Link>
      </div>
    )
  }

  const curriculum = targetCurriculumId ? await getCurriculumWithTasks(targetCurriculumId) : null

  if (!curriculum) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">아직 빌더 여정이 없습니다</div>
        <Link
          href="/onboarding"
          className="rounded-full bg-[#161616] px-5 py-2.5 text-[14px] font-medium text-[#F5F5F5] dark:bg-[#F5F5F5] dark:text-[#161616]"
        >
          새 빌더 여정 시작하기
        </Link>
      </div>
    )
  }

  const epics = transformToEpics(curriculum.structure)
  const progress = curriculum.progress
  const level = getRatingLevel(progress)
  const range = getRatingRange(level)
  const weeklySummary = curriculum.weekly_summary

  return (
    <div className="rounded-[16px] bg-[rgba(255,255,255,0.72)] shadow-[0_0_24px_0_rgba(22,22,22,0.06)] dark:bg-[rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-[10px] p-[20px]">
        <div className="flex size-[24px] items-center justify-center text-[#161616] dark:text-[#FFFFFF]">
          <SourceCodeIcon />
        </div>
        <span className="text-[16px] leading-[1.5] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
          {curriculum.course_title}
        </span>
      </div>

      <div className="flex flex-col gap-[40px] px-[20px] pt-[8px] pb-[20px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center justify-between gap-[8px]">
            <div className="flex flex-col items-center justify-center gap-[4px] p-[4px]">
              <span className="self-start text-[18px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">
                AI 평가 기준 진행도
              </span>
              <span className="self-start text-[40px] leading-[1.2] font-semibold tracking-[-0.03em] text-[#161616] dark:text-[#F5F5F5]">
                {progress}%
              </span>
            </div>

            <Link
              href="/detail/feedback"
              className="flex items-center justify-center gap-[6px] rounded-full bg-[#161616] px-[12px] py-[12px] text-[#F5F5F5] dark:bg-[#F5F5F5] dark:text-[#161616]"
            >
              <Image src="/icons/wand-shine.svg" alt="" width={18} height={18} className="invert dark:invert-0" />
              <span className="text-[14px] leading-[1.45] font-medium tracking-[-0.02em]">채점 후 피드백</span>
            </Link>
          </div>

          <div className="flex flex-col gap-[4px] rounded-[14px] border border-[rgba(164,164,164,0.2)] p-[4px]">
            <div className="flex items-center gap-[4px]">
              <AIRatingBadge level={level} range={range} />
              <div className="flex flex-1 flex-col gap-[16px] self-stretch rounded-[10px] bg-[rgba(164,164,164,0.1)] p-[16px] dark:bg-[rgba(245,245,245,0.04)]">
                <ProgressBar progress={progress} level={level} />
                <ActivityHeatmap data={activityData} />
              </div>
            </div>

            <div className="flex flex-col gap-[2px] rounded-[10px] bg-[rgba(164,164,164,0.1)] p-[20px] dark:bg-[rgba(245,245,245,0.04)]">
              <span className="text-[14px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">
                AI 이번주 평가
              </span>
              <p className="text-[16px] leading-[1.5] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
                <MarkdownText>{weeklySummary}</MarkdownText>
              </p>
            </div>
          </div>
        </div>

        {epics.length > 0 && (
          <DashboardClient
            epics={epics}
            structure={curriculum.structure}
            oneLiner={curriculum.one_liner}
            allTasks={curriculum.tasks.map(serializeTaskForClient)}
          />
        )}
      </div>
    </div>
  )
}
