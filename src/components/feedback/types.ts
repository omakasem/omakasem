export type SuggestionCategory =
  | 'architecture'
  | 'performance'
  | 'security'
  | 'code_quality'
  | 'product_idea'
  | 'hardening'

export type Priority = 'high' | 'medium' | 'low'

export type Severity = 'error' | 'warning' | 'info'

export interface Suggestion {
  category: SuggestionCategory
  title: string
  description: string
  file?: string
  line?: number
  priority: Priority
  rationale: string
}

export interface Diagnostic {
  file: string
  line: number
  column: number
  message: string
  rule: string
  severity: Severity
  suggestion?: string
}

export interface ReviewResult {
  id: string
  status: 'pending' | 'cloning' | 'running' | 'completed' | 'failed'
  repo_url: string
  results?: Diagnostic[]
  suggestions?: Suggestion[]
  error?: string
}
