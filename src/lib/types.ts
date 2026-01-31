import { ObjectId } from 'mongodb'

// IDs can be either ObjectId (new data) or string (planner service data)
type DocumentId = ObjectId | string

export interface TaskDocument {
  _id: DocumentId
  curriculum_id: DocumentId
  epic_index: number
  story_index: number
  epic_title: string
  story_title: string
  title: string
  description: string
  acceptance_criteria: { description: string; weight: number }[]
  estimated_minutes: number | null
  status: 'pending' | 'partial' | 'passed' | 'failed'
  grade_result: {
    grade_job_id: string
    score: number
    percentage: number
    grade: string
    criteria_results: unknown[]
    repo_url: string
    graded_at: string
  } | null
  created_at: Date
  updated_at: Date
}

export interface CurriculumDocument {
  _id: DocumentId
  session_id: string
  course_title: string
  one_liner: string
  student_id: string | null
  clerk_user_id: string | null
  status: 'generating' | 'active' | 'completed' | 'disabled' | 'approved'
  total_hours: number
  total_tasks: number
  completed_tasks: number
  icon?: string
  icon_id?: string
  git_repo?: string
  weekly_summary?: string
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
  created_at: Date
  updated_at: Date
}

export interface ActivityDocument {
  _id: ObjectId
  clerk_user_id: string
  curriculum_id?: ObjectId
  type: 'task_completed' | 'submission' | 'login' | 'study'
  /** @format YYYY-MM-DD */
  date: string
  count: number
  created_at: Date
}

export interface CurriculumListItem {
  id: string
  title: string
  icon?: string
  icon_id?: string
  git_repo?: string
  progress: number
  status: string
}

export interface CurriculumDetail {
  id: string
  title: string
  one_liner: string
  icon?: string
  icon_id?: string
  git_repo?: string
  progress: number
  status: string
  total_hours: number
  total_tasks: number
  completed_tasks: number
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
  weekly_summary?: string
}

export interface ActivityData {
  date: string
  count: number
}
