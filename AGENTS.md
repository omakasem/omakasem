# AGENTS.MD - Omakasem Implementation Findings

**Last Updated**: 2026-02-01 01:15 UTC

---

## Project: Omakasem (오마카쌤)

AI-Powered Personalized Developer Education Platform

COMMIT AND PUSH OFTEN

**Stack**: Next.js 15, React 19, Convex, Clerk (GitHub OAuth only), Tailwind CSS  
**AI Services**: omakasem-planner, omakasem-code-reviewer  
**GitHub Integration**: GitHub App for repo setup and commit-based submissions

---

## 🔑 CRITICAL ARCHITECTURE DECISIONS

### GitHub-Only Authentication

- **Decision**: Support ONLY GitHub login via Clerk OAuth
- **Rationale**: Educational platform for developers - GitHub account is prerequisite
- **Configuration**: Clerk dashboard configured for GitHub OAuth provider only
- **No email/password**: Simplifies auth flow, ensures GitHub access for submissions

### GitHub App Integration

- **Purpose**: Automate repository setup and submission tracking
- **Capabilities**:
  - **Auto-create repos**: When user starts a course, GitHub App creates structured repo
  - **Commit-based submissions**: Students push code, app detects commits as submissions
  - **Pull commits for review**: Relevant commits pulled automatically for AI grading
- **Webhook flow**:
  1. Student pushes commit to task branch
  2. GitHub webhook notifies Convex
  3. Convex fetches commit via GitHub API
  4. Triggers code review action with commit diff
  5. Stores result in submissions table

### Updated Submission Model

- **Old**: Manual code paste in textarea
- **New**: Git commit SHA + repo URL
- **Schema changes needed**:
  ```typescript
  submissions: {
    taskId: v.id('tasks'),
    userId: v.id('users'),
    repoUrl: v.string(),           // GitHub repo URL
    commitSha: v.string(),          // Commit SHA
    branchName: v.string(),         // e.g., "task-1-hello-world"
    commitMessage: v.string(),      // Student's commit message
    diff: v.string(),               // Commit diff for review
    feedback: v.optional(v.string()),
    score: v.optional(v.number()),
    passed: v.optional(v.boolean()),
    submittedAt: v.number(),
    gradedAt: v.optional(v.number()),
  }
  ```

---

## Phase 1: Foundation - FINDINGS

### ✅ Task 1.1: Convex Initialization

- **Command**: `npx convex dev --once`
- **Finding**: Auto-provisions dev deployment and updates .env.local
- **Deployment**: dev:qualified-wren-376
- **Note**: Types generated automatically in `convex/_generated/`

### ✅ Task 1.2: Environment Config (src/env.ts)

- **Pattern**: Zod validation for runtime safety
- **Finding**: `startsWith('pk_')` validation catches Clerk key errors early
- **Best Practice**: Fail fast on invalid config at app startup

### ✅ Task 1.3: Convex Schema (convex/schema.ts)

- **Gotcha**: Some agents claim completion but don't create files
- **Solution**: ALWAYS verify with own tools (ls, cat, Read)
- **Finding**: Category "quick" > "ultrabrain" for simple file tasks
- **Schema**: 7 tables with hierarchical Course→Epic→Story→Task

### ✅ Task 1.4: Clerk Dependencies

- **Packages**: @clerk/nextjs@6.37.1, @clerk/themes@2.4.51
- **Note**: Convex 1.31.7 includes convex/react-clerk built-in

### ✅ Task 1.5: Convex-Clerk Provider

- **File**: src/components/providers/convex-clerk-provider.tsx
- **Pattern**: Singleton ConvexReactClient instance
- **Integration**: ClerkProvider wraps ConvexProviderWithClerk

### ✅ Task 1.6: Update Root Layout

- **File**: src/app/layout.tsx
- **Korean branding**: Title "오마카쌤 - AI 맞춤 개발자 교육"
- **Issue**: Missing ConvexClerkProvider wrapper (needs fix)
- **Note**: Currently has generic <Providers> component

### ✅ Task 1.7: Clerk Middleware

- **File**: src/middleware.ts
- **Pattern**: clerkMiddleware with createRouteMatcher
- **Public routes**: /login, /register, /forgot-password, /api/webhooks

---

## Delegation Patterns

### ✅ WORKS

- Single atomic tasks (one file per delegation)
- Explicit code in prompts
- Immediate verification after delegation
- Category "quick" for simple tasks

### ❌ DOESN'T WORK

- Multiple sub-tasks in one prompt (agents refuse)
- Trusting agent completion claims
- Category "ultrabrain" sometimes returns empty output
- Batching multiple file operations

---

## Data Model Decisions

**Timestamps**: Unix milliseconds (`Date.now()`)  
**User Sync**: Clerk → Convex via webhooks  
**Progress**: Calculated from task completion ratios  
**Heatmap**: Date as `YYYY-MM-DD` string for easy querying

**Status Enums**:

- Course: generating | active | completed
- Epic/Story: locked | active | completed
- Task: pending | submitted | graded
- Activity: task_completed | submission | login

---

## Korean Terminology

- 빌더 여정 = Builder Journey (Course)
- 주차별 학습 단위 = Weekly Learning Unit (Epic)
- 학습 스토리 = Learning Story (Story)
- 실습 과제 = Practice Assignment (Task)
- 제출물 = Submission

---

## Next Session TODO

**Remaining Phase 1** (2 tasks):

- [ ] Task 1.6b: Fix Root Layout - Import and use ConvexClerkProvider
- [ ] Task 1.8: Clerk JWT Template (manual - Dashboard config)

**Schema Update Required** (before Phase 2):

- [ ] Update convex/schema.ts submissions table for GitHub integration
  - Add: repoUrl, commitSha, branchName, commitMessage, diff
  - Remove: code field

**Phase 2**: Backend Functions (7 tasks)

- User sync, CRUD operations, AI actions
- **NEW**: GitHub webhook handler for commit events

**Phase 3**: UI Components (11 tasks)  
**Phase 4**: Pages (8 tasks)  
**Phase 5**: Polish & Verification (8 tasks)

**Total Remaining**: 29 tasks

---

## CONTINUOUS DOCUMENTATION REMINDER

**📌 UPDATE THIS FILE AFTER EACH PHASE OR MAJOR DISCOVERY**

Add findings to:

- Delegation patterns
- Gotchas encountered
- Performance insights
- Architecture decisions
- Testing discoveries
