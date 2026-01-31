'use client'

import { CheckIcon, ChevronDownIcon, ChevronUpIcon, MinusIcon } from '@heroicons/react/20/solid'
import { AiGenerativeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { useState } from 'react'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'pending'
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
  isExpanded?: boolean
  onToggleExpand?: () => void
  className?: string
}

function TaskStatusIcon({ status }: { status: Task['status'] }) {
  if (status === 'completed') {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
        <CheckIcon className="size-3" />
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
        <MinusIcon className="size-3" />
      </div>
    )
  }
  return <div className="size-5 rounded-full border border-zinc-600" />
}

export function StoryCard({ story, isExpanded = false, onToggleExpand, className }: StoryCardProps) {
  const completedTasks = story.tasks.filter((t) => t.status === 'completed').length
  const totalTasks = story.tasks.length

  return (
    <div className={clsx('rounded-xl bg-zinc-800/50', className)}>
      {/* Story Header */}
      <button type="button" onClick={onToggleExpand} className="flex w-full items-start justify-between p-4 text-left">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-zinc-700 text-zinc-300">
            {completedTasks === totalTasks ? (
              <CheckIcon className="size-4" />
            ) : (
              <span className="text-xs">{completedTasks}</span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-white">{story.title}</h4>
            <p className="mt-1 text-sm text-zinc-400">{story.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="size-5 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDownIcon className="size-5 shrink-0 text-zinc-400" />
        )}
      </button>

      {/* Expanded Content: Task List (left) + AI Feedback (right) */}
      {isExpanded && (
        <div className="flex border-t border-zinc-700/50">
          {/* Left: Task List */}
          <div className="flex-1 p-4">
            <div className="space-y-3">
              {story.tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <TaskStatusIcon status={task.status} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{task.title}</div>
                    {task.description && <div className="mt-0.5 text-xs text-zinc-500">{task.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Feedback Panel */}
          {story.aiFeedback && (
            <div className="w-[40%] border-l border-zinc-700/50 bg-zinc-800/30 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={AiGenerativeIcon} size={14} /> AI 피드백 요약
                </span>
                <span>{story.aiFeedback.date}</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-medium text-zinc-400">Story 수행 요약</div>
                <p className="mt-1 text-sm text-zinc-300">{story.aiFeedback.summary}</p>
              </div>
              {story.aiFeedback.taskFeedback && (
                <div className="mt-3 space-y-2">
                  {Object.entries(story.aiFeedback.taskFeedback).map(([taskTitle, feedback]) => (
                    <div key={taskTitle}>
                      <div className="text-xs font-medium text-zinc-500">{taskTitle}</div>
                      <p className="text-xs text-zinc-400">{feedback}</p>
                    </div>
                  ))}
                </div>
              )}
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
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(stories[0]?.id ?? null)

  return (
    <div className={clsx('space-y-3', className)}>
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          isExpanded={expandedStoryId === story.id}
          onToggleExpand={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
        />
      ))}
    </div>
  )
}
