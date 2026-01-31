'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, CheckCircle2, ChevronDown } from 'lucide-react'

interface StreamingStory {
  title: string
  tasks: string[]
  isComplete: boolean
}

interface StreamingEpic {
  id: number
  title: string
  content: string
  stories: StreamingStory[]
  isComplete: boolean
}

interface EnrichmentStreamingProps {
  plannerSessionId: string
  onComplete: (plan: unknown) => void
  onError: (error: string) => void
}

export function EnrichmentStreaming({ plannerSessionId, onComplete, onError }: EnrichmentStreamingProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [totalEpics, setTotalEpics] = useState(0)
  const [epics, setEpics] = useState<StreamingEpic[]>([])
  const [currentEpicId, setCurrentEpicId] = useState<number | null>(null)
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())
  const hasStartedRef = useRef(false)
  const epicContentRef = useRef<Map<number, string>>(new Map())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [epics, currentEpicId])

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const startEnrichment = async () => {
      try {
        const response = await fetch(
          `https://planner.omakasem.com/v1/sessions/${plannerSessionId}/respond/stream`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'approve' }),
          }
        )

        if (!response.ok || !response.body) {
          onError('Enrichment 스트림 연결에 실패했습니다')
          return
        }

        setIsConnected(true)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6)
              try {
                const data = JSON.parse(dataStr)

                // phase_start event
                if (data.phase && data.description && data.step !== undefined) {
                  setCurrentPhase(data.description)
                }
                // generate_start event - detail generation begins
                else if (data.phase === 'detail' && data.total_epics !== undefined) {
                  setTotalEpics(data.total_epics)
                }
                // epic_start event
                else if (data.epic_id !== undefined && data.title) {
                  const epicId = data.epic_id
                  setCurrentEpicId(epicId)
                  epicContentRef.current.set(epicId, '')
                  setEpics(prev => [...prev, {
                    id: epicId,
                    title: data.title,
                    content: '',
                    stories: [],
                    isComplete: false,
                  }])
                }
                // token event - streaming content
                else if (data.content !== undefined && data.epic_id !== undefined) {
                  const epicId = data.epic_id
                  const currentContent = epicContentRef.current.get(epicId) || ''
                  const newContent = currentContent + data.content
                  epicContentRef.current.set(epicId, newContent)

                  // Parse stories from streaming content
                  const stories = parseStoriesFromContent(newContent)

                  setEpics(prev => prev.map(epic =>
                    epic.id === epicId
                      ? { ...epic, content: newContent, stories }
                      : epic
                  ))
                }
                // epic_complete event
                else if (data.epic_id !== undefined && data.progress) {
                  setEpics(prev => prev.map(epic =>
                    epic.id === data.epic_id
                      ? { ...epic, isComplete: true }
                      : epic
                  ))
                  setCurrentEpicId(null)
                }
                // plan_complete event
                else if (data.plan && data.quality_score !== undefined) {
                  onComplete(data.plan)
                  return
                }
              } catch {
                // Not JSON or parse error
              }
            }
          }
        }

        // Stream ended without plan_complete
        onError('스트림이 예상치 않게 종료되었습니다')
      } catch (error) {
        console.error('Enrichment error:', error)
        onError('Enrichment 처리 중 오류가 발생했습니다')
      }
    }

    startEnrichment()
  }, [plannerSessionId, onComplete, onError])

  // Parse streaming JSON to extract stories with their tasks (acceptance_criteria)
  const parseStoriesFromContent = (content: string): StreamingStory[] => {
    const stories: StreamingStory[] = []

    // Find "stories" array in the content
    const storiesMatch = content.match(/"stories"\s*:\s*\[/)
    if (!storiesMatch || storiesMatch.index === undefined) return stories

    const storiesStart = storiesMatch.index + storiesMatch[0].length
    const storiesContent = content.substring(storiesStart)

    // Parse individual story objects
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

  const parseStoryObject = (storyStr: string, isComplete: boolean): StreamingStory | null => {
    const titleMatch = storyStr.match(/"title"\s*:\s*"([^"]*)"/)
    if (!titleMatch) return null

    const tasks: string[] = []

    // Extract acceptance_criteria as tasks
    const criteriaMatch = storyStr.match(/"acceptance_criteria"\s*:\s*\[/)
    if (criteriaMatch && criteriaMatch.index !== undefined) {
      const criteriaStart = criteriaMatch.index + criteriaMatch[0].length
      const criteriaContent = storyStr.substring(criteriaStart)

      // Find all quoted strings in the array
      const taskRegex = /"([^"]+)"/g
      let match
      while ((match = taskRegex.exec(criteriaContent)) !== null) {
        // Stop if we hit the closing bracket
        const beforeMatch = criteriaContent.substring(0, match.index)
        if (beforeMatch.includes(']')) break
        tasks.push(match[1])
      }
    }

    return {
      title: titleMatch[1],
      tasks,
      isComplete,
    }
  }

  const toggleStory = (epicId: number, storyIndex: number) => {
    const key = `${epicId}-${storyIndex}`
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

  // Get status message for the top bar
  const getStatusMessage = () => {
    if (!isConnected) return '연결 중...'
    if (currentEpicId !== null) {
      const currentEpic = epics.find(e => e.id === currentEpicId)
      if (currentEpic) return `Epic 생성 중: ${currentEpic.title}`
    }
    if (currentPhase) return currentPhase
    return '상세 커리큘럼 생성 중...'
  }

  // Calculate progress percentage
  const getProgressPercent = () => {
    if (totalEpics > 0) {
      const completedEpics = epics.filter(e => e.isComplete).length
      return Math.round((completedEpics / totalEpics) * 100)
    }
    return 0
  }

  return (
    <div className="space-y-4">
      {/* Progress bar with current status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-zinc-600 dark:text-zinc-300">
              {getStatusMessage()}
            </span>
          </div>
          {totalEpics > 0 && (
            <span className="text-zinc-500 dark:text-zinc-400">
              {epics.filter(e => e.isComplete).length} / {totalEpics}
            </span>
          )}
        </div>
        {totalEpics > 0 && (
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-neutral-700">
            <div
              className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
        )}
      </div>

      {/* Epic blocks with streaming stories */}
      <div
        ref={scrollRef}
        className="max-h-[28rem] min-h-32 space-y-3 overflow-y-auto scroll-smooth"
      >
        {epics.map((epic) => {
          const isActive = currentEpicId === epic.id

          return (
            <div
              key={epic.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
              style={{
                animation: 'epicSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {/* Epic header */}
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  epic.isComplete
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                }`}>
                  {epic.isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    epic.id
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {epic.title}
                  </h3>

                  {/* Stories list */}
                  {epic.stories.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {epic.stories.map((story, storyIdx) => {
                        const storyKey = `${epic.id}-${storyIdx}`
                        const isExpanded = expandedStories.has(storyKey)
                        const hasTasks = story.tasks.length > 0

                        return (
                          <div key={storyIdx} className="border-l-2 border-zinc-200 pl-3 dark:border-neutral-600">
                            {/* Story header */}
                            <button
                              onClick={() => hasTasks && toggleStory(epic.id, storyIdx)}
                              className={`flex w-full items-center gap-2 text-left ${hasTasks ? 'cursor-pointer' : 'cursor-default'}`}
                              disabled={!hasTasks}
                            >
                              <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                                {story.title}
                                {!story.isComplete && (
                                  <span className="ml-1 inline-block h-2 w-0.5 animate-pulse bg-zinc-400" />
                                )}
                              </span>
                              {hasTasks && (
                                <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              )}
                            </button>

                            {/* Tasks (accordion content) */}
                            {isExpanded && hasTasks && (
                              <div className="mt-2 space-y-1 pl-2">
                                {story.tasks.map((task, taskIdx) => (
                                  <div
                                    key={taskIdx}
                                    className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400"
                                  >
                                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                    <span>{task}</span>
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
                  {isActive && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-zinc-900 dark:bg-white" />
                      <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-zinc-900 dark:bg-white" style={{ animationDelay: '0.2s' }} />
                      <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-zinc-900 dark:bg-white" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Next epic indicator */}
        {currentEpicId !== null && totalEpics > 0 && epics.length < totalEpics && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-neutral-900">
            <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              다음: Epic {epics.length + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
