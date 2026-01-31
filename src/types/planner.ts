// Planner API Types

export interface CourseInput {
  title: string
  description: string
  totalWeeks: number
  weeklyHours: number
  githubUrl?: string
}

// Draft-phase Story (before enrichment) - has taskCount but no actual tasks
export interface Story {
  storyId: string
  title: string
  description: string
  taskCount: number
}

// Draft-phase Epic (before enrichment)
export interface Epic {
  epicId: string
  weekNumber: number
  title: string
  description: string
  stories: Story[]
}

// Draft CoursePlan (before enrichment) - epics have Stories with taskCount only
export interface CoursePlan {
  title: string
  oneLiner: string
  epics: Epic[]
}

// Enriched Task (after plan_complete) - has actual task details
export interface EnrichedTask {
  title: string
  acceptance_criteria: string[]
  estimated_minutes: number
}

// Enriched Story (after plan_complete) - has actual tasks array
export interface EnrichedStory {
  title: string
  description: string
  prereqs?: string[]
  definition_of_done?: string[]
  tasks: EnrichedTask[]
}

// Enriched Epic (after plan_complete) - has enriched stories with tasks
export interface EnrichedEpic {
  title: string
  description: string
  order?: number
  prerequisites?: string[]
  stories: EnrichedStory[]
}

// Enriched CoursePlan (after plan_complete from Python) - full plan with tasks
export interface EnrichedCoursePlan {
  id?: string
  course_title: string // Note: Python uses snake_case
  one_liner: string
  github_url?: string
  epics: EnrichedEpic[]
  sources?: PlanSource[]
  quality_report?: {
    score: number
    passed: boolean
    issues: unknown[]
  }
}

export interface SessionResponse {
  sessionId: string
  status: 'generating' | 'ready' | 'approved' | 'rejected'
  draft?: CoursePlan
}

export interface CurriculumResponse {
  curriculumId: string
  title: string
  oneLiner: string
  epics: Epic[]
  taskCount: number
  status: 'active' | 'completed'
  createdAt: string
}

// MongoDB document types
export interface SessionDocument {
  sessionId: string
  plannerSessionId?: string
  userId: string
  status: 'generating' | 'ready' | 'approved' | 'rejected'
  input: CourseInput
  draft?: CoursePlan
  createdAt: Date
  updatedAt: Date
}

export interface CurriculumDocument {
  curriculumId: string
  userId: string
  title: string
  oneLiner: string
  epics: Epic[]
  taskCount: number
  status: 'active' | 'completed'
  githubUrl?: string
  createdAt: Date
}

// Planner API Plan Response (GET /v1/plans/{id})
export interface PlanTask {
  title: string
  acceptance_criteria: string[]
  estimated_minutes: number
}

export interface PlanStory {
  title: string
  description: string
  prereqs: string[]
  definition_of_done: string[]
  tasks: PlanTask[]
}

export interface PlanEpic {
  title: string
  description: string
  order: number
  prerequisites: string[]
  stories: PlanStory[]
}

export interface PlanSource {
  title: string
  url: string
  publisher: string
  retrieved_at: string
}

export interface PlanResponse {
  id: string
  course_title: string
  one_liner: string
  github_url: string
  epics: PlanEpic[]
  sources: PlanSource[]
}
