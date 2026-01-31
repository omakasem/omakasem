// Planner API Types

export interface CourseInput {
  title: string;
  description: string;
  totalWeeks: number;
  weeklyHours: number;
  githubUrl?: string;
}

export interface Story {
  storyId: string;
  title: string;
  description: string;
  taskCount: number;
}

export interface Epic {
  epicId: string;
  weekNumber: number;
  title: string;
  description: string;
  stories: Story[];
}

export interface CoursePlan {
  title: string;
  oneLiner: string;
  epics: Epic[];
}

export interface SessionResponse {
  sessionId: string;
  status: 'generating' | 'ready' | 'approved' | 'rejected';
  draft?: CoursePlan;
}

export interface CurriculumResponse {
  curriculumId: string;
  title: string;
  oneLiner: string;
  epics: Epic[];
  taskCount: number;
  status: 'active' | 'completed';
  createdAt: string;
}

// MongoDB document types
export interface SessionDocument {
  sessionId: string;
  plannerSessionId?: string;
  userId: string;
  status: 'generating' | 'ready' | 'approved' | 'rejected';
  input: CourseInput;
  draft?: CoursePlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumDocument {
  curriculumId: string;
  userId: string;
  title: string;
  oneLiner: string;
  epics: Epic[];
  taskCount: number;
  status: 'active' | 'completed';
  githubUrl?: string;
  createdAt: Date;
}

// Planner API Plan Response (GET /v1/plans/{id})
export interface PlanTask {
  title: string;
  acceptance_criteria: string[];
  estimated_minutes: number;
}

export interface PlanStory {
  title: string;
  description: string;
  prereqs: string[];
  definition_of_done: string[];
  tasks: PlanTask[];
}

export interface PlanEpic {
  title: string;
  description: string;
  order: number;
  prerequisites: string[];
  stories: PlanStory[];
}

export interface PlanSource {
  title: string;
  url: string;
  publisher: string;
  retrieved_at: string;
}

export interface PlanResponse {
  id: string;
  course_title: string;
  one_liner: string;
  github_url: string;
  epics: PlanEpic[];
  sources: PlanSource[];
}
