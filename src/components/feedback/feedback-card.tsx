'use client'

import clsx from 'clsx'
import { Badge } from '@/components/badge'
import {
  ShieldExclamationIcon,
  CodeBracketIcon,
  CubeIcon,
  BoltIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/16/solid'
import type { Suggestion, Diagnostic, SuggestionCategory, Priority, Severity } from './types'

const categoryConfig: Record<
  SuggestionCategory,
  { label: string; icon: typeof ShieldExclamationIcon; color: 'red' | 'yellow' | 'blue' | 'purple' | 'cyan' | 'zinc' }
> = {
  security: { label: '보안', icon: ShieldExclamationIcon, color: 'red' },
  code_quality: { label: '코드 퀄리티', icon: CodeBracketIcon, color: 'blue' },
  architecture: { label: '아키텍처', icon: CubeIcon, color: 'purple' },
  performance: { label: '성능', icon: BoltIcon, color: 'yellow' },
  product_idea: { label: '제품 아이디어', icon: LightBulbIcon, color: 'cyan' },
  hardening: { label: '강화', icon: WrenchScrewdriverIcon, color: 'zinc' },
}

const severityConfig: Record<Severity, { color: 'red' | 'yellow' | 'blue' }> = {
  error: { color: 'red' },
  warning: { color: 'yellow' },
  info: { color: 'blue' },
}

interface SuggestionCardProps {
  suggestion: Suggestion
  isSelected?: boolean
  onClick?: () => void
}

export function SuggestionCard({ suggestion, isSelected, onClick }: SuggestionCardProps) {
  const config = categoryConfig[suggestion.category]
  const Icon = config.icon

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full rounded-lg border p-4 text-left transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 text-zinc-500" />
        <Badge color={config.color}>{config.label}</Badge>
      </div>
      <h4 className="mb-1 font-medium text-zinc-900 dark:text-white">{suggestion.title}</h4>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{suggestion.description}</p>
      {suggestion.file && (
        <p className="mt-2 text-xs text-zinc-500">
          {suggestion.file}
          {suggestion.line && `:${suggestion.line}`}
        </p>
      )}
    </button>
  )
}

interface DiagnosticCardProps {
  diagnostic: Diagnostic
  isSelected?: boolean
  onClick?: () => void
}

export function DiagnosticCard({ diagnostic, isSelected, onClick }: DiagnosticCardProps) {
  const config = severityConfig[diagnostic.severity]

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full rounded-lg border p-4 text-left transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <CodeBracketIcon className="size-4 text-zinc-500" />
        <Badge color={config.color}>{diagnostic.rule}</Badge>
      </div>
      <h4 className="mb-1 font-medium text-zinc-900 dark:text-white">{diagnostic.message}</h4>
      {diagnostic.suggestion && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{diagnostic.suggestion}</p>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        {diagnostic.file}:{diagnostic.line}:{diagnostic.column}
      </p>
    </button>
  )
}
