# AGENTS.MD - Omakasem Implementation Findings

**Last Updated**: 2026-02-01 01:10 UTC

---

## Project: Omakasem (오마카쌤)

AI-Powered Personalized Developer Education Platform

**Stack**: Next.js 15, React 19, MongoDB (TBD), Clerk, Tailwind CSS  
**AI Services**: omakasem-planner, omakasem-code-reviewer (to be integrated)  
**Current Phase**: WIREFRAME/UI IMPLEMENTATION

---

## 🔄 MAJOR ARCHITECTURE PIVOT (2026-02-01 01:00 UTC)

### ❌ CONVEX DROPPED COMPLETELY

**Decision**: Dropped Convex entirely, switching to MongoDB + Next.js API routes  
**Reason**: Architecture decision by user  
**Status**: ✅ All Convex code deleted, package uninstalled  
**Impact**: Backend functions need to be reimplemented with MongoDB later

### ✅ CURRENT FOCUS: WIREFRAME IMPLEMENTATION

**Priority**: Match mockups folder design EXACTLY  
**Approach**: Pure frontend components first, backend integration later  
**Mockups**: 3 screens to implement

1. `onboarding.png` - Onboarding form (4 inputs, Korean text)
2. `onboarding-loading.png` - Loading screen with progress
3. `dashboard.png` - Main dashboard (sidebar, heatmap, cards)

---

## 🔑 ARCHITECTURAL DECISIONS (CURRENT)

### Authentication

- **Decision**: Clerk for authentication (GitHub OAuth primary)
- **Status**: ✅ Installed and configured
- **Integration**: ClerkProvider wrapping app in layout.tsx

### Styling & Design System

- **Framework**: Tailwind CSS
- **Component Library**: Catalyst (27 pre-built components available)
- **Theme**: Light/Dark mode support (using Tailwind's dark: classes)
- **Design**: Matches mockups pixel-perfect
  - Dark mode: Black backgrounds, white text, dark gray modals
  - Light mode: Light gray backgrounds, white cards, dark text

### GitHub Integration (PLANNED)

- **Purpose**: Automate repository setup and submission tracking
- **Status**: Backend not implemented yet (needs MongoDB)
- **Future**: GitHub App for commit-based submissions

---

## Project: Omakasem (오마카쌤)

AI-Powered Personalized Developer Education Platform

COMMIT AND PUSH OFTEN. MUST MATCH mockups folder's design. EDIT THIS PAGE OFTEN.

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

## Phase 1: Foundation - COMPLETED

### ✅ Task 1.1-1.7: Clerk Setup

- ✅ Clerk installed and configured
- ✅ ClerkProvider in layout.tsx
- ✅ Middleware protecting routes
- ✅ Korean metadata in place
- ✅ Environment variables configured

### ❌ Convex Tasks (DELETED)

- All Convex-related work removed
- Backend will use MongoDB + Next.js API routes instead

---

## Phase 2: UI Components - IN PROGRESS

### ✅ Onboarding Layout & Progress Steps (2026-02-01)

**Files Created:**

- `src/app/(onboarding)/layout.tsx` - Route group layout
- `src/components/progress-steps.tsx` - 3-segment progress indicator

**Features:**

- ✅ Light/Dark mode support
- ✅ Centered modal design
- ✅ Matches mockup pixel-perfect
- ✅ Responsive (max-w-lg constraint)

**Design Details:**

- Dark mode: Black background (`bg-black`), dark modal (`bg-neutral-900`)
- Light mode: Light gray background (`bg-zinc-50`), white modal (`bg-white`)
- Progress bars: White/dark toggle based on theme
- Border radius: Large (`rounded-3xl` = 24px)
- Shadow: Only in light mode (`shadow-xl`)

**Verification:**

- ✅ Build passes
- ✅ TypeScript compiles clean
- ✅ Both light and dark modes look correct

---

## 🔴 MANDATORY VISUAL VERIFICATION PROTOCOL

**CRITICAL**: After EVERY UI component/page implementation, you MUST:

1. **Use Playwright to visually verify** the implementation matches mockups
2. **Take screenshot** of the implemented UI
3. **Compare** screenshot against mockup file
4. **BLOCK** further progress if design is broken or regressed
5. **Delete artifact PNGs** after verification passes

### Verification Steps (MANDATORY)

```bash
# 1. Start dev server
npm run dev

# 2. Use Playwright skill to:
#    - Navigate to the page
#    - Take screenshot
#    - Compare with mockup
#    - Verify pixel-perfect match

# 3. Delete artifacts after verification
rm -f playwright-screenshots/*.png
```

**NEVER PROCEED** to next task if:

- Design doesn't match mockup
- Regression detected
- Visual bugs present
- Colors/spacing/typography wrong

**Fix immediately** before continuing.

---

## Delegation Patterns

### ✅ WORKS

- Single atomic tasks (one file per delegation)
- Explicit code in prompts
- **MANDATORY**: Visual verification with Playwright after each UI task
- Immediate verification after delegation
- Category "visual-engineering" for UI components

### ❌ DOESN'T WORK

- Multiple sub-tasks in one prompt (agents refuse)
- Trusting agent completion claims without visual verification
- Skipping Playwright verification for UI components
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

## Next Tasks (WIREFRAME IMPLEMENTATION)

### 🎯 Immediate Priorities

**Phase 2: UI Components** (In Progress)

- [x] Onboarding Layout + Progress Steps (with light/dark mode)
- [ ] Onboarding Form Page (4 inputs, Korean labels, validation)
- [ ] Loading Page (flag icon, "빌더 여정 설계 중..." text)
- [ ] Dashboard Sidebar (search, course list, profile)
- [ ] Activity Heatmap (GitHub-style 22x5 grid)
- [ ] Epic Navigation (horizontal tabs with scroll)
- [ ] Story Cards (icon, title, description, task list)
- [ ] Task Cards (document icon, title, shell command examples)

**Phase 3: Full Pages**

- [ ] `/onboarding` - Complete onboarding flow
- [ ] `/onboarding/loading` - Course generation loading
- [ ] `/dashboard` - Main dashboard with all components

**Phase 4: Backend (LATER)**

- [ ] MongoDB schema design
- [ ] Next.js API routes for CRUD
- [ ] AI service integrations
- [ ] GitHub App webhook handlers

**Total UI Components**: ~8 components to build  
**Total Pages**: 3 main pages to complete

---

## CONTINUOUS DOCUMENTATION REMINDER

**📌 UPDATE THIS FILE AFTER EACH PHASE OR MAJOR DISCOVERY**

Add findings to:

- Delegation patterns
- Gotchas encountered
- Performance insights
- Architecture decisions
- Testing discoveries
