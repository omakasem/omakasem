'use client'

import type { CoursePlan } from '@/types/planner'
import { ChevronDown, ChevronRight, BookOpen, FileText } from 'lucide-react'
import { useState } from 'react'

interface DraftPreviewProps {
  draft: CoursePlan
}

export function DraftPreview({ draft }: DraftPreviewProps) {
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set())

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) => {
      const next = new Set(prev)
      if (next.has(epicId)) {
        next.delete(epicId)
      } else {
        next.add(epicId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{draft.title}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{draft.oneLiner}</p>
      </div>

      {/* Epics list */}
      <div className="space-y-3">
        {draft.epics.map((epic) => (
          <div
            key={epic.epicId}
            className="overflow-hidden rounded-xl border border-zinc-200 dark:border-neutral-700"
          >
            {/* Epic header */}
            <button
              onClick={() => toggleEpic(epic.epicId)}
              className="flex w-full items-center gap-3 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              {expandedEpics.has(epic.epicId) ? (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Week {epic.weekNumber}
                  </span>
                  <span className="truncate font-medium text-zinc-900 dark:text-white">{epic.title}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {epic.description}
                </p>
              </div>
              <span className="text-xs text-zinc-400">
                {epic.stories.length} stories
              </span>
            </button>

            {/* Stories */}
            {expandedEpics.has(epic.epicId) && (
              <div className="border-t border-zinc-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
                {epic.stories.map((story) => (
                  <div
                    key={story.storyId}
                    className="flex items-start gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-neutral-800"
                  >
                    <BookOpen className="mt-0.5 h-4 w-4 text-zinc-400" />
                    <div className="flex-1">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{story.title}</p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {story.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                        <FileText className="h-3 w-3" />
                        <span>{story.taskCount} tasks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
