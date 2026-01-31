import type { CourseInput, SessionResponse, CoursePlan, PlanResponse } from '@/types/planner';

const PLANNER_API_URL = process.env.PLANNER_API_URL || 'https://planner.omakasem.com';

export class PlannerClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || PLANNER_API_URL;
  }

  /**
   * Create a new session and start generating a course plan
   * Returns the sessionId immediately, draft generation happens via SSE
   */
  async createSession(input: CourseInput): Promise<{ sessionId: string }> {
    const response = await fetch(`${this.baseUrl}/v1/sessions/stream`, {
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
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }

    // Parse SSE to get session_id from session_start event
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Look for session_start event
      const sessionStartMatch = buffer.match(/event: session_start\ndata: ({[^\n]+})/);
      if (sessionStartMatch) {
        const data = JSON.parse(sessionStartMatch[1]);
        reader.cancel(); // Stop reading, we got what we need
        return { sessionId: data.session_id };
      }
    }

    throw new Error('No session_id received');
  }

  /**
   * Get session status and draft if ready
   */
  async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/v1/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get SSE stream URL for a session
   */
  getStreamUrl(sessionId: string): string {
    return `${this.baseUrl}/v1/sessions/${sessionId}/stream`;
  }

  /**
   * Submit approve/reject response for a session
   */
  async respond(sessionId: string, action: 'approve' | 'reject'): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/v1/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      throw new Error(`Failed to respond: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Save approved curriculum
   */
  async saveCurriculum(sessionId: string, draft: CoursePlan): Promise<{ curriculumId: string }> {
    const response = await fetch(`${this.baseUrl}/v1/curricula`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        ...draft,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save curriculum: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get plan from Planner API
   */
  async getPlan(planId: string): Promise<PlanResponse> {
    const response = await fetch(`${this.baseUrl}/v1/plans/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get plan: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Save enriched plan to Planner API
   */
  async savePlan(
    plannerSessionId: string,
    plan: CoursePlan,
    githubUrl?: string
  ): Promise<{ planId: string }> {
    const response = await fetch(`${this.baseUrl}/v1/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: plannerSessionId,
        course_title: plan.title,
        one_liner: plan.oneLiner,
        github_url: githubUrl || '',
        epics: plan.epics,
        sources: [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save plan: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

// Singleton instance
export const plannerClient = new PlannerClient();
