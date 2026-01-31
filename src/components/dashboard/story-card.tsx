'use client'

import clsx from 'clsx'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'partial' | 'passed' | 'failed'
  grade?: string
  score?: number
}

export interface Story {
  id: string
  title: string
  description: string
  tasks: Task[]
  aiFeedback?: {
    summary: string
    date: string
    taskFeedback?: Record<string, string>
  }
}

interface StoryCardProps {
  story: Story
  className?: string
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NeurologyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1.33334V2.66668M8 13.3333V14.6667M14.6667 8H13.3333M2.66667 8H1.33334M12.7141 12.714L11.7713 11.7712M4.22878 4.22878L3.28598 3.28598M12.7141 3.28598L11.7713 4.22878M4.22878 11.7712L3.28598 12.714M10.6667 8C10.6667 9.47277 9.47278 10.6667 8.00001 10.6667C6.52725 10.6667 5.33334 9.47277 5.33334 8C5.33334 6.52724 6.52725 5.33334 8.00001 5.33334C9.47278 5.33334 10.6667 6.52724 10.6667 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TaskStatusIcon({ status }: { status: Task['status'] }) {
  if (status === 'passed') {
    return (
      <div className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[#161616]">
        <CheckIcon />
      </div>
    )
  }
  if (status === 'partial') {
    return (
      <div className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[#161616]">
        <div className="size-[8px] rounded-full bg-[#161616]" />
      </div>
    )
  }
  return (
    <div className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[rgba(245,245,245,0.04)]" />
  )
}

function StoryStatusIcon({ completed, total }: { completed: number; total: number }) {
  if (completed === total && total > 0) {
    return (
      <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[#161616]">
        <CheckIcon />
      </div>
    )
  }
  return (
    <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[#161616]">
      <span className="text-[16px] font-semibold">{completed}</span>
    </div>
  )
}

function VerticalLine() {
  return (
    <div className="flex w-[40px] shrink-0 flex-col items-center justify-stretch self-stretch px-[12px]">
      <div className="w-[1px] flex-1 bg-gradient-to-b from-[rgba(164,164,164,0.2)] to-transparent" />
    </div>
  )
}

export function StoryCard({ story, className }: StoryCardProps) {
  const completedTasks = story.tasks.filter((t) => t.status === 'passed').length
  const totalTasks = story.tasks.length

  return (
    <div
      className={clsx(
        'flex items-stretch gap-[4px] rounded-[14px] border border-[rgba(164,164,164,0.2)] p-[4px]',
        className
      )}
    >
      <div className="flex flex-1 flex-col rounded-[10px]">
        <div className="flex items-center gap-[8px] px-[12px] py-[10px]">
          <StoryStatusIcon completed={completedTasks} total={totalTasks} />
          <div className="flex flex-col justify-center gap-[2px] px-[4px]">
            <span className="text-[16px] leading-[1.5] font-medium tracking-[-0.02em] text-[#F5F5F5]">
              {story.title}
            </span>
            <span className="text-[14px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.72)]">
              {story.description}
            </span>
          </div>
        </div>

        {story.tasks.map((task, idx) => (
          <div key={task.id} className="flex items-center px-[12px]">
            {idx < story.tasks.length - 1 ? (
              <VerticalLine />
            ) : (
              <div className="flex w-[40px] shrink-0 flex-col items-center justify-stretch self-stretch px-[12px] pb-[8px]">
                <div className="w-[1px] flex-1 bg-gradient-to-b from-[rgba(164,164,164,0.2)] to-transparent" />
              </div>
            )}
            <div className="flex flex-1 items-center gap-[6px] py-[8px]">
              <TaskStatusIcon status={task.status} />
              <div className="flex flex-col justify-center gap-[2px] px-[4px]">
                <span className="text-[16px] leading-[1.5] font-medium tracking-[-0.02em] text-[#F5F5F5]">
                  {task.title}
                </span>
                {task.description && (
                  <span className="text-[14px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.72)]">
                    {task.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {story.aiFeedback && (
        <div className="flex w-[380px] shrink-0 flex-col gap-[8px] self-stretch rounded-[10px] bg-[rgba(245,245,245,0.04)] p-[16px]">
          <div className="flex items-center gap-[4px] p-[4px]">
            <div className="text-[rgba(245,245,245,0.56)]">
              <NeurologyIcon />
            </div>
            <span className="flex-1 text-[12px] leading-[1.35] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.56)]">
              AI 피드백 요약
            </span>
            <span className="text-[12px] leading-[1.35] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.4)]">
              {story.aiFeedback.date}
            </span>
          </div>

          <div className="flex flex-col gap-[2px] p-[4px]">
            <span className="text-[12px] leading-[1.35] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.72)]">
              Story 수행 요약
            </span>
            <p className="text-[14px] leading-[1.45] font-medium tracking-[-0.02em] text-[#F5F5F5]">
              {story.aiFeedback.summary}
            </p>
          </div>

          {story.aiFeedback.taskFeedback && Object.keys(story.aiFeedback.taskFeedback).length > 0 && (
            <>
              {Object.entries(story.aiFeedback.taskFeedback).map(([taskTitle, feedback]) => (
                <div key={taskTitle} className="flex flex-col gap-[2px] p-[4px]">
                  <span className="text-[12px] leading-[1.35] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.56)]">
                    {taskTitle}
                  </span>
                  <span className="text-[14px] leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(245,245,245,0.72)]">
                    {feedback}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface StoryListProps {
  stories: Story[]
  className?: string
}

export function StoryList({ stories, className }: StoryListProps) {
  return (
    <div className={clsx('flex flex-col gap-[12px]', className)}>
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}
