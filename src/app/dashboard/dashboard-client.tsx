'use client'

import { EpicNavigation, StoryList, type Epic, type Story, type Task } from '@/components/dashboard'
import { useState } from 'react'

interface TaskData {
  _id: { toString(): string } | string
  title: string
  status: 'pending' | 'partial' | 'passed' | 'failed'
  epic_index: number
  story_index: number
  grade_result?: {
    grade?: string
    percentage?: number
    graded_at?: string
  } | null
}

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
  allTasks: TaskData[]
}

function transformTaskToUI(task: TaskData): Task {
  return {
    id: typeof task._id === 'string' ? task._id : task._id.toString(),
    title: task.title,
    status: task.status,
    grade: task.grade_result?.grade,
    score: task.grade_result?.percentage,
  }
}

function buildAIFeedback(tasks: TaskData[]): Story['aiFeedback'] | undefined {
  const gradedTasks = tasks.filter((t) => t.grade_result)
  if (gradedTasks.length === 0) return undefined

  const passedCount = gradedTasks.filter((t) => t.status === 'passed').length
  const totalCount = gradedTasks.length
  const avgScore = gradedTasks.reduce((sum, t) => sum + (t.grade_result?.percentage || 0), 0) / totalCount

  const latestGraded = gradedTasks.sort((a, b) => {
    const dateA = a.grade_result?.graded_at ? new Date(a.grade_result.graded_at).getTime() : 0
    const dateB = b.grade_result?.graded_at ? new Date(b.grade_result.graded_at).getTime() : 0
    return dateB - dateA
  })[0]

  const taskFeedback: Record<string, string> = {}
  gradedTasks.forEach((t) => {
    if (t.grade_result) {
      const grade = t.grade_result.grade || ''
      const score = t.grade_result.percentage || 0
      taskFeedback[t.title] = `${grade} (${score}점)`
    }
  })

  return {
    summary: `${totalCount}개 과제 중 ${passedCount}개 통과, 평균 ${Math.round(avgScore)}점`,
    date: latestGraded?.grade_result?.graded_at
      ? new Date(latestGraded.grade_result.graded_at).toLocaleDateString('ko-KR')
      : '',
    taskFeedback,
  }
}

function transformToStoriesWithTasks(
  structure: DashboardClientProps['structure'],
  epicIndex: number,
  allTasks: TaskData[]
): Story[] {
  const epic = structure.epics[epicIndex]
  if (!epic) return []

  return epic.stories.map((story, storyIndex) => {
    const storyTasksRaw = allTasks.filter((t) => t.epic_index === epicIndex && t.story_index === storyIndex)
    const storyTasks = storyTasksRaw.map(transformTaskToUI)

    return {
      id: `${epicIndex + 1}-${storyIndex + 1}`,
      title: story.title,
      description: story.description,
      tasks: storyTasks,
      aiFeedback: buildAIFeedback(storyTasksRaw),
    }
  })
}

export function DashboardClient({ epics, structure, oneLiner, initialStories, allTasks }: DashboardClientProps) {
  const [selectedEpicId, setSelectedEpicId] = useState('1')
  const selectedEpicIndex = parseInt(selectedEpicId, 10) - 1
  const stories = transformToStoriesWithTasks(structure, selectedEpicIndex, allTasks)

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
