'use client'

import { useEffect, useState, useRef } from 'react'
import type { CourseInput, CoursePlan, Epic } from '@/types/planner'
import { BookOpen } from 'lucide-react'

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

interface PartialEpic {
  weekNumber: number
  title: string
  description: string
  storyCount: number
  isComplete: boolean
}

// Extract partial epics for streaming display
function extractPartialEpics(content: string): PartialEpic[] {
  const epics: PartialEpic[] = []

  // Find the epics array first
  const epicsArrayMatch = content.match(/"epics"\s*:\s*\[/)
  if (!epicsArrayMatch) return epics

  const epicsStart = epicsArrayMatch.index! + epicsArrayMatch[0].length
  const epicsContent = content.substring(epicsStart)

  // Find epic blocks by looking for objects with "estimated_hours" or "objectives" (epic-specific fields)
  // Or objects that contain "stories" array
  let depth = 0
  let epicStart = -1
  let weekNum = 1

  for (let i = 0; i < epicsContent.length; i++) {
    const char = epicsContent[i]

    if (char === '{') {
      if (depth === 0) {
        epicStart = i
      }
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && epicStart !== -1) {
        // Found a complete object at depth 0 - this is an Epic
        const epicStr = epicsContent.substring(epicStart, i + 1)

        // Extract title
        const titleMatch = epicStr.match(/"title"\s*:\s*"([^"]*)"/)
        // Extract description
        const descMatch = epicStr.match(/"description"\s*:\s*"([^"]*)"/)

        if (titleMatch) {
          // Count stories
          let storyCount = 0
          const storiesMatch = epicStr.match(/"stories"\s*:\s*\[/)
          if (storiesMatch) {
            const storyTitles = epicStr.match(/"title"\s*:\s*"/g)
            // First title is the epic title, rest are story titles
            storyCount = storyTitles ? Math.max(0, storyTitles.length - 1) : 0
          }

          epics.push({
            weekNumber: weekNum,
            title: titleMatch[1],
            description: descMatch ? descMatch[1] : '',
            storyCount,
            isComplete: true,
          })
          weekNum++
        }
        epicStart = -1
      }
    } else if (char === ']' && depth === 0) {
      // End of epics array
      break
    }
  }

  // Check for incomplete epic at the end
  if (epicStart !== -1) {
    const partialEpicStr = epicsContent.substring(epicStart)
    const titleMatch = partialEpicStr.match(/"title"\s*:\s*"([^"]*)"/)
    const descMatch = partialEpicStr.match(/"description"\s*:\s*"([^"]*)"/)

    if (titleMatch) {
      let storyCount = 0
      const storyTitles = partialEpicStr.match(/"stories"[\s\S]*?"title"\s*:\s*"/g)
      if (storyTitles) {
        storyCount = storyTitles.length
      }

      epics.push({
        weekNumber: weekNum,
        title: titleMatch[1],
        description: descMatch ? descMatch[1] : '',
        storyCount,
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

export function StreamingContent({ sessionId, input, onComplete, onError }: StreamingContentProps) {
  const [partialEpics, setPartialEpics] = useState<PartialEpic[]>([])
  const [typingText, setTypingText] = useState<Record<number, string>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [appearedEpics, setAppearedEpics] = useState<Set<number>>(new Set())
  const hasStartedRef = useRef(false)
  const isCancelledRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mark new epics as appeared and start typing
  useEffect(() => {
    partialEpics.forEach((epic) => {
      if (!appearedEpics.has(epic.weekNumber)) {
        setAppearedEpics(prev => new Set([...prev, epic.weekNumber]))
      }
    })
  }, [partialEpics, appearedEpics])

  // Typing effect for descriptions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    partialEpics.forEach((epic) => {
      const weekNum = epic.weekNumber
      const currentTyped = typingText[weekNum] || ''
      const targetText = epic.description

      if (currentTyped.length < targetText.length) {
        const timer = setTimeout(() => {
          setTypingText(prev => ({
            ...prev,
            [weekNum]: targetText.substring(0, currentTyped.length + 2)
          }))
        }, 20)
        timers.push(timer)
      }
    })

    return () => timers.forEach(t => clearTimeout(t))
  }, [partialEpics, typingText])

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

  // Auto-scroll when new content appears
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [partialEpics, typingText])

  return (
    <div className="space-y-4">
      <div
        ref={scrollRef}
        className="max-h-[28rem] min-h-32 overflow-y-auto space-y-3 scroll-smooth"
      >
        {partialEpics.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-4 dark:bg-neutral-800">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {isConnected ? '커리큘럼 생성 중...' : '연결 중...'}
            </span>
          </div>
        ) : (
          partialEpics.map((epic) => {
            const weekNum = epic.weekNumber
            const isNew = !appearedEpics.has(weekNum)
            const displayText = typingText[weekNum] || ''
            const isTyping = displayText.length < epic.description.length

            return (
              <div
                key={`epic-${weekNum}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                style={isNew ? {
                  animation: 'epicSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 min-h-[2.5rem]">
                      {displayText}
                      {isTyping && (
                        <span className="inline-block w-0.5 h-4 ml-0.5 bg-zinc-400 animate-pulse" />
                      )}
                    </p>
                    {epic.storyCount > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                        <BookOpen className="h-3 w-3" />
                        <span>{epic.storyCount}개 스토리</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {partialEpics.length > 0 && isConnected && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-neutral-900">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Week {partialEpics.length + 1} 생성 중...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
