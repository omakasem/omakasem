'use client'

import { EpicNavigation, StoryList, type Epic, type Story } from '@/components/dashboard'
import { useState } from 'react'

interface DashboardClientProps {
  epics: Epic[]
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
  oneLiner: string
  initialStories: Story[]
}

function transformToStories(
  structure: DashboardClientProps['structure'],
  epicIndex: number
): Story[] {
  const epic = structure.epics[epicIndex]
  if (!epic) return []

  return epic.stories.map((story, index) => ({
    id: `${epicIndex + 1}-${index + 1}`,
    title: story.title,
    description: story.description,
    tasks: [],
  }))
}

export function DashboardClient({ epics, structure, oneLiner, initialStories }: DashboardClientProps) {
  const [selectedEpicId, setSelectedEpicId] = useState('1')
  const selectedEpicIndex = parseInt(selectedEpicId, 10) - 1
  const stories = transformToStories(structure, selectedEpicIndex)

  return (
    <div className="mt-8">
      <EpicNavigation epics={epics} selectedEpicId={selectedEpicId} onSelectEpic={setSelectedEpicId} />

      {stories.length > 0 && (
        <div className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Story 구성</h2>
            <p className="text-sm text-zinc-500">{oneLiner}</p>
          </div>

          <div className="mt-4">
            <StoryList stories={stories} />
          </div>
        </div>
      )}
    </div>
  )
}
