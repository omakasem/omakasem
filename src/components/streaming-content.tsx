'use client'

import { useEffect, useState, useRef } from 'react'
import type { CourseInput, CoursePlan, Epic } from '@/types/planner'
import { ChevronDown } from 'lucide-react'

// Transform snake_case API response to camelCase
function transformDraft(raw: Record<string, unknown>): CoursePlan {
  const epics = (raw.epics as Array<Record<string, unknown>> || []).map((epic, epicIndex) => transformEpic(epic, epicIndex))

  return {
    title: (raw.title as string) || '',
    oneLiner: (raw.one_liner as string) || (raw.oneLiner as string) || '',
    epics,
  }
}

function transformEpic(epic: Record<string, unknown>, epicIndex: number): Epic {
  return {
    epicId: (epic.epic_id as string) || `epic_${epicIndex}`,
    weekNumber: (epic.week_number as number) || epicIndex + 1,
    title: (epic.title as string) || '',
    description: (epic.description as string) || '',
    stories: ((epic.stories as Array<Record<string, unknown>>) || []).map((story, storyIndex) => ({
      storyId: (story.story_id as string) || `story_${epicIndex}_${storyIndex}`,
      title: (story.title as string) || '',
      description: (story.description as string) || '',
      taskCount: (story.task_count as number) || (story.tasks as Array<unknown>)?.length || 0,
    })),
  }
}

interface PartialStory {
  title: string
  description: string
  estimatedHours?: number
  objectives: string[]
  isComplete: boolean
}

interface PartialEpic {
  weekNumber: number
  title: string
  description: string
  stories: PartialStory[]
  isComplete: boolean
}

// Extract partial stories from epic content
function extractPartialStories(epicContent: string): PartialStory[] {
  const stories: PartialStory[] = []

  const storiesMatch = epicContent.match(/"stories"\s*:\s*\[/)
  if (!storiesMatch || storiesMatch.index === undefined) return stories

  const storiesStart = storiesMatch.index + storiesMatch[0].length
  const storiesContent = epicContent.substring(storiesStart)

  let depth = 0
  let storyStart = -1

  for (let i = 0; i < storiesContent.length; i++) {
    const char = storiesContent[i]

    if (char === '{') {
      if (depth === 0) storyStart = i
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && storyStart !== -1) {
        const storyStr = storiesContent.substring(storyStart, i + 1)
        const story = parseStoryObject(storyStr, true)
        if (story) stories.push(story)
        storyStart = -1
      }
    } else if (char === ']' && depth === 0) {
      break
    }
  }

  // Check for incomplete story at the end
  if (storyStart !== -1) {
    const partialStoryStr = storiesContent.substring(storyStart)
    const story = parseStoryObject(partialStoryStr, false)
    if (story) stories.push(story)
  }

  return stories
}

// Parse a single story object from JSON string
function parseStoryObject(storyStr: string, isComplete: boolean): PartialStory | null {
  const titleMatch = storyStr.match(/"title"\s*:\s*"([^"]*)"/)
  if (!titleMatch) return null

  const descMatch = storyStr.match(/"description"\s*:\s*"([^"]*)"/)
  const hoursMatch = storyStr.match(/"estimated_hours"\s*:\s*([\d.]+)/)

  const objectives: string[] = []
  const objectivesMatch = storyStr.match(/"objectives"\s*:\s*\[/)
  if (objectivesMatch && objectivesMatch.index !== undefined) {
    const objStart = objectivesMatch.index + objectivesMatch[0].length
    const objContent = storyStr.substring(objStart)
    const objRegex = /"([^"]+)"/g
    let match
    while ((match = objRegex.exec(objContent)) !== null) {
      const beforeMatch = objContent.substring(0, match.index)
      if (beforeMatch.includes(']')) break
      objectives.push(match[1])
    }
  }

  return {
    title: titleMatch[1],
    description: descMatch ? descMatch[1] : '',
    estimatedHours: hoursMatch ? parseFloat(hoursMatch[1]) : undefined,
    objectives,
    isComplete,
  }
}

// Extract partial epics for streaming display
function extractPartialEpics(content: string): PartialEpic[] {
  const epics: PartialEpic[] = []

  const epicsArrayMatch = content.match(/"epics"\s*:\s*\[/)
  if (!epicsArrayMatch) return epics

  const epicsStart = epicsArrayMatch.index! + epicsArrayMatch[0].length
  const epicsContent = content.substring(epicsStart)

  let depth = 0
  let epicStart = -1
  let weekNum = 1

  for (let i = 0; i < epicsContent.length; i++) {
    const char = epicsContent[i]

    if (char === '{') {
      if (depth === 0) epicStart = i
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && epicStart !== -1) {
        const epicStr = epicsContent.substring(epicStart, i + 1)
        const titleMatch = epicStr.match(/"title"\s*:\s*"([^"]*)"/)
        const descMatch = epicStr.match(/"description"\s*:\s*"([^"]*)"/)

        if (titleMatch) {
          epics.push({
            weekNumber: weekNum,
            title: titleMatch[1],
            description: descMatch ? descMatch[1] : '',
            stories: extractPartialStories(epicStr),
            isComplete: true,
          })
          weekNum++
        }
        epicStart = -1
      }
    } else if (char === ']' && depth === 0) {
      break
    }
  }

  // Check for incomplete epic at the end
  if (epicStart !== -1) {
    const partialEpicStr = epicsContent.substring(epicStart)
    const titleMatch = partialEpicStr.match(/"title"\s*:\s*"([^"]*)"/)
    const descMatch = partialEpicStr.match(/"description"\s*:\s*"([^"]*)"/)

    if (titleMatch) {
      epics.push({
        weekNumber: weekNum,
        title: titleMatch[1],
        description: descMatch ? descMatch[1] : '',
        stories: extractPartialStories(partialEpicStr),
        isComplete: false,
      })
    }
  }

  return epics
}

interface StreamingContentProps {
  sessionId: string
  input: CourseInput
  onComplete: (draft: unknown) => void
  onError: (error: string) => void
}

const LOADING_MESSAGES = [
  '공식 문서 리서치 중...',
  '베스트 프랙티스 찾아보는 중...',
  '계획 세우는 중...',
  '학습 경로 설계 중...',
]

export function StreamingContent({ sessionId, input, onComplete, onError }: StreamingContentProps) {
  const [partialEpics, setPartialEpics] = useState<PartialEpic[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [appearedEpics, setAppearedEpics] = useState<Set<number>>(new Set())
  const [appearedStories, setAppearedStories] = useState<Set<string>>(new Set())
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const hasStartedRef = useRef(false)
  const isCancelledRef = useRef(false)

  // Rotate loading messages before first content
  useEffect(() => {
    if (partialEpics.length > 0) return

    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [partialEpics.length])

  // Mark new epics and stories as appeared
  useEffect(() => {
    partialEpics.forEach((epic) => {
      if (!appearedEpics.has(epic.weekNumber)) {
        setAppearedEpics(prev => new Set([...prev, epic.weekNumber]))
      }
      epic.stories.forEach((_, storyIdx) => {
        const storyKey = `${epic.weekNumber}-${storyIdx}`
        if (!appearedStories.has(storyKey)) {
          setAppearedStories(prev => new Set([...prev, storyKey]))
        }
      })
    })
  }, [partialEpics, appearedEpics, appearedStories])

  const toggleStory = (epicWeek: number, storyIndex: number) => {
    const key = `${epicWeek}-${storyIndex}`
    setExpandedStories(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    isCancelledRef.current = false

    const startStream = async () => {
      try {
        const response = await fetch('https://planner.omakasem.com/v1/sessions/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title,
            description: input.description,
            total_weeks: input.totalWeeks,
            hours_per_week: input.weeklyHours,
          }),
        })

        if (isCancelledRef.current) return

        if (!response.ok || !response.body) {
          onError('스트림 연결에 실패했습니다')
          return
        }

        setIsConnected(true)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullContent = ''
        let plannerSessionId: string | null = null

        while (!isCancelledRef.current) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.substring(7).trim()

              if (eventType === 'draft_complete' || eventType === 'complete') {
                if (isCancelledRef.current) return

                try {
                  const rawDraft = JSON.parse(fullContent)
                  const draft = transformDraft(rawDraft)

                  await fetch('/api/planner/sessions/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId,
                      plannerSessionId,
                      draft,
                      status: 'ready',
                    }),
                  })

                  if (!isCancelledRef.current) {
                    onComplete(draft)
                  }
                } catch {
                  if (!isCancelledRef.current) {
                    onError('드래프트 파싱에 실패했습니다')
                  }
                }
                return
              }
            } else if (line.startsWith('data: ')) {
              const dataStr = line.substring(6)
              try {
                const data = JSON.parse(dataStr)

                if (data.session_id) {
                  plannerSessionId = data.session_id
                }

                if (data.content) {
                  fullContent += data.content

                  // Extract partial epics for display
                  const extracted = extractPartialEpics(fullContent)
                  if (extracted.length > 0 && !isCancelledRef.current) {
                    setPartialEpics(extracted)
                  }
                }
              } catch {
                // Not JSON
              }
            }
          }
        }

        // Stream ended without complete event
        if (!isCancelledRef.current && fullContent) {
          try {
            const rawDraft = JSON.parse(fullContent)
            const draft = transformDraft(rawDraft)

            await fetch('/api/planner/sessions/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                plannerSessionId,
                draft,
                status: 'ready',
              }),
            })

            onComplete(draft)
          } catch {
            onError('드래프트 파싱에 실패했습니다')
          }
        }
      } catch (error) {
        console.error('Stream error:', error)
        if (!isCancelledRef.current) {
          onError('스트림 연결에 실패했습니다')
        }
      }
    }

    startStream()
  }, [])

  return (
    <div className="space-y-4">
      <div className="min-h-32 space-y-3">
        {partialEpics.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-zinc-100 p-4 dark:bg-neutral-800">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '0ms' }} />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '150ms' }} />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '300ms' }} />
            </div>
            <span
              key={loadingMessageIndex}
              className="text-sm text-zinc-600 dark:text-zinc-300"
              style={{ animation: 'fadeIn 0.3s ease-in-out' }}
            >
              {LOADING_MESSAGES[loadingMessageIndex]}
            </span>
          </div>
        ) : (
          partialEpics.map((epic) => {
            const weekNum = epic.weekNumber
            const isNew = !appearedEpics.has(weekNum)
            const isActiveEpic = !epic.isComplete

            return (
              <div
                key={`epic-${weekNum}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                style={isNew ? {
                  animation: 'epicSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                } : undefined}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-black">
                    {weekNum}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                      {epic.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {epic.description}
                      {isActiveEpic && epic.stories.length === 0 && (
                        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-zinc-400" />
                      )}
                    </p>

                    {/* Stories list */}
                    {epic.stories.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {epic.stories.map((story, storyIdx) => {
                          const storyKey = `${weekNum}-${storyIdx}`
                          const isExpanded = expandedStories.has(storyKey)
                          const hasObjectives = story.objectives.length > 0
                          const isActiveStory = !story.isComplete
                          const isNewStory = !appearedStories.has(storyKey)

                          return (
                            <div
                              key={storyIdx}
                              className="border-l-2 border-zinc-200 pl-3 dark:border-neutral-600"
                              style={isNewStory ? {
                                animation: 'storySlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                              } : undefined}
                            >
                              <button
                                onClick={() => hasObjectives && toggleStory(weekNum, storyIdx)}
                                className={`flex w-full items-center gap-2 text-left ${hasObjectives ? 'cursor-pointer' : 'cursor-default'}`}
                                disabled={!hasObjectives}
                              >
                                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                                  {story.title}
                                  {isActiveStory && (
                                    <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-zinc-400" />
                                  )}
                                </span>
                                {hasObjectives && (
                                  <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                              </button>

                              {/* Objectives (expanded) */}
                              {isExpanded && hasObjectives && (
                                <div className="mt-2 space-y-1 pl-2">
                                  {story.objectives.map((obj, objIdx) => (
                                    <div
                                      key={objIdx}
                                      className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400"
                                    >
                                      <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                      <span>{obj}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Typing indicator for active epic */}
                    {isActiveEpic && epic.stories.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-zinc-400" />
                        <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-zinc-400" style={{ animationDelay: '0.2s' }} />
                        <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-zinc-400" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {partialEpics.length > 0 && isConnected && !partialEpics[partialEpics.length - 1]?.isComplete && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-neutral-900">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Week {partialEpics.length} 생성 중...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
