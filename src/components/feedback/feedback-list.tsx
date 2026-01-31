'use client'

import { Subheading } from '@/components/heading'
import { SuggestionCard, DiagnosticCard } from './feedback-card'
import type { Suggestion, Diagnostic, Priority } from './types'

interface FeedbackListProps {
  suggestions?: Suggestion[]
  diagnostics?: Diagnostic[]
  selectedFile?: string
  selectedLine?: number
  onSelectFeedback?: (file: string, line: number) => void
}

export function FeedbackList({
  suggestions = [],
  diagnostics = [],
  selectedFile,
  selectedLine,
  onSelectFeedback,
}: FeedbackListProps) {
  const highPriority = suggestions.filter((s) => s.priority === 'high')
  const mediumPriority = suggestions.filter((s) => s.priority === 'medium')
  const lowPriority = suggestions.filter((s) => s.priority === 'low')

  const isSelected = (file?: string, line?: number) =>
    file === selectedFile && line === selectedLine

  return (
    <div className="space-y-6">
      {highPriority.length > 0 && (
        <section>
          <Subheading className="mb-3 text-red-600 dark:text-red-400">
            우선순위 높은 피드백
          </Subheading>
          <div className="space-y-3">
            {highPriority.map((suggestion, i) => (
              <SuggestionCard
                key={`high-${i}`}
                suggestion={suggestion}
                isSelected={isSelected(suggestion.file, suggestion.line)}
                onClick={() =>
                  suggestion.file && onSelectFeedback?.(suggestion.file, suggestion.line || 1)
                }
              />
            ))}
          </div>
        </section>
      )}

      {mediumPriority.length > 0 && (
        <section>
          <Subheading className="mb-3">우선순위 중간 피드백</Subheading>
          <div className="space-y-3">
            {mediumPriority.map((suggestion, i) => (
              <SuggestionCard
                key={`medium-${i}`}
                suggestion={suggestion}
                isSelected={isSelected(suggestion.file, suggestion.line)}
                onClick={() =>
                  suggestion.file && onSelectFeedback?.(suggestion.file, suggestion.line || 1)
                }
              />
            ))}
          </div>
        </section>
      )}

      {lowPriority.length > 0 && (
        <section>
          <Subheading className="mb-3 text-zinc-500">우선순위 낮은 피드백</Subheading>
          <div className="space-y-3">
            {lowPriority.map((suggestion, i) => (
              <SuggestionCard
                key={`low-${i}`}
                suggestion={suggestion}
                isSelected={isSelected(suggestion.file, suggestion.line)}
                onClick={() =>
                  suggestion.file && onSelectFeedback?.(suggestion.file, suggestion.line || 1)
                }
              />
            ))}
          </div>
        </section>
      )}

      {diagnostics.length > 0 && (
        <section>
          <Subheading className="mb-3">코드 진단 결과</Subheading>
          <div className="space-y-3">
            {diagnostics.map((diagnostic, i) => (
              <DiagnosticCard
                key={`diag-${i}`}
                diagnostic={diagnostic}
                isSelected={isSelected(diagnostic.file, diagnostic.line)}
                onClick={() => onSelectFeedback?.(diagnostic.file, diagnostic.line)}
              />
            ))}
          </div>
        </section>
      )}

      {suggestions.length === 0 && diagnostics.length === 0 && (
        <p className="py-8 text-center text-zinc-500">피드백이 없습니다.</p>
      )}
    </div>
  )
}
