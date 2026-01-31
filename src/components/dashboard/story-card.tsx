'use client'

import { CheckIcon, MinusIcon } from '@heroicons/react/20/solid'
import { AiGenerativeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
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

function TaskStatusIcon({ status }: { status: Task['status'] }) {
  const baseClasses = "flex size-5 items-center justify-center rounded-full z-10 ring-4 ring-zinc-100 dark:ring-zinc-800"
  
  if (status === 'passed') {
    return (
      <div className={clsx(baseClasses, "bg-green-500/20 text-green-500")}>
        <CheckIcon className="size-3" />
      </div>
    )
  }
  if (status === 'partial') {
    return (
      <div className={clsx(baseClasses, "bg-yellow-500/20 text-yellow-500")}>
        <MinusIcon className="size-3" />
      </div>
    )
  }
  if (status === 'failed') {
    return (
      <div className={clsx(baseClasses, "bg-red-500/20 text-red-500")}>
        <MinusIcon className="size-3" />
      </div>
    )
  }
  return <div className={clsx(baseClasses, "bg-white border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800")} />
}

export function StoryCard({ story, className }: StoryCardProps) {
  const completedTasks = story.tasks.filter((t) => t.status === 'passed').length
  const totalTasks = story.tasks.length

  return (
    <div className={clsx('flex rounded-xl bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden', className)}>
      {/* Left: Timeline & Content */}
      <div className="relative flex-1 p-5">
        {/* Vertical Timeline Line */}
        <div className="absolute top-8 bottom-8 left-[29px] w-0.5 bg-zinc-200 dark:bg-zinc-700" />

        {/* Story Header Item */}
        <div className="relative flex items-start gap-4 mb-6">
          <div className="relative z-10 mt-0.5 flex size-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 ring-4 ring-zinc-100 dark:bg-zinc-700 dark:text-zinc-300 dark:ring-zinc-800">
            {completedTasks === totalTasks ? (
              <CheckIcon className="size-4" />
            ) : (
              <span className="text-xs font-semibold">{completedTasks}</span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-zinc-950 dark:text-white leading-tight">{story.title}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{story.description}</p>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {story.tasks.map((task) => (
            <div key={task.id} className="relative flex items-start gap-4">
              <div className="ml-0.5 flex items-center justify-center">
                <TaskStatusIcon status={task.status} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="text-sm font-medium text-zinc-950 dark:text-white leading-tight">{task.title}</div>
                {task.description && (
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">{task.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: AI Feedback Panel */}
      {story.aiFeedback && (
        <div className="w-[40%] border-l border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={AiGenerativeIcon} size={16} /> 
              AI 피드백 요약
            </span>
            <span className="opacity-70">{story.aiFeedback.date}</span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Story 수행 요약</div>
            <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{story.aiFeedback.summary}</p>
          </div>
          {story.aiFeedback.taskFeedback && (
            <div className="mt-4 space-y-3">
              {Object.entries(story.aiFeedback.taskFeedback).map(([taskTitle, feedback]) => (
                <div key={taskTitle} className="rounded bg-white/50 p-2 dark:bg-black/20">
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">{taskTitle}</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{feedback}</p>
                </div>
              ))}
            </div>
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
    <div className={clsx('space-y-4', className)}>
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
        />
      ))}
    </div>
  )
}
