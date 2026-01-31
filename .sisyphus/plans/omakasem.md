# Omakasem Implementation Plan (47 Tasks)

**Generated**: 2026-02-01  
**Source**: Plan Agent (ses_3eb6097d7ffeRBYSQBMHgRdt4u)

Full plan saved from Plan agent output. See `/Users/cho/.local/share/opencode/tool-output/tool_c14a904af001pmjX1SAaLEKECi` for complete details.

---

## Executive Summary

**Total Tasks**: 48 atomic tasks across 5 phases  
**Parallelization**: Up to 12 tasks can run simultaneously in Wave 4  
**Tech Stack**: Next.js 15, Convex, Clerk (GitHub OAuth only), Tailwind CSS  
**GitHub Integration**: GitHub App for auto repo creation and commit-based submissions

**IMPORTANT ARCHITECTURAL DECISIONS**:

- **GitHub-Only Auth**: Only GitHub login via Clerk OAuth (no email/password)
- **GitHub App**: Auto-creates repos for courses, pulls commits as submissions
- **Commit-Based Submissions**: Students push commits, not paste code
- **Schema Update Required**: submissions table needs repoUrl, commitSha, branchName, commitMessage, diff

---

## Phase 1: Foundation Infrastructure (8 Tasks)

### ✅ COMPLETED

- [x] 1.1: Initialize Convex Project
- [x] 1.2: Create Environment Configuration (src/env.ts)
- [x] 1.3: Define Convex Schema (convex/schema.ts - 7 tables)
- [x] 1.4: Install Clerk Dependencies
- [x] 1.5: Create Convex-Clerk Provider (src/components/providers/convex-clerk-provider.tsx)
- [x] 1.6: Update Root Layout with Korean metadata (src/app/layout.tsx) - **NOTE**: Needs ConvexClerkProvider import
- [x] 1.7: Create Clerk Middleware (src/middleware.ts)

### ⏳ IN PROGRESS / PENDING

- [ ] 1.6b: Fix Root Layout - Import and use ConvexClerkProvider (needs Providers component replaced)
- [ ] 1.8: Setup Clerk JWT Template (Manual - Clerk Dashboard - GitHub OAuth only)
- [ ] 1.9: **NEW** Update Convex Schema for GitHub Integration (submissions table)

---

## Phase 2: Convex Backend Functions (7 Tasks)

- [ ] 2.1: Create User Sync Functions (convex/users.ts)
- [ ] 2.2: Create Course CRUD Functions (convex/courses.ts)
- [ ] 2.3: Create Epic/Story/Task Functions (convex/epics.ts, stories.ts, tasks.ts)
- [ ] 2.4: Create Submission & Activity Functions (convex/submissions.ts, activities.ts)
- [ ] 2.5: Create Course Generation Action (convex/actions/generateCourse.ts)
- [ ] 2.6: Create Code Review Action (convex/actions/reviewCode.ts)
- [ ] 2.7: **NEW** Create GitHub Webhook Handler (convex/github.ts) - Process commit push events

---

## Phase 3: UI Components & Layouts (11 Tasks)

- [ ] 3.1: Create Onboarding Layout
- [ ] 3.2: Create Progress Step Indicator Component
- [ ] 3.3: Create Dashboard Sidebar Component
- [ ] 3.4: Create Epic Navigation Component
- [ ] 3.5: Create Activity Heatmap Component
- [ ] 3.6: Create Progress Display Component
- [ ] 3.7: Create Story Card Component
- [ ] 3.8: Create Task Card Component
- [ ] 3.9: Create Submission Dialog Component
- [ ] 3.10: Create Feedback Display Component
- [ ] 3.11: Create Course Selection Component

---

## Phase 4: Page Implementations (8 Tasks)

- [ ] 4.1: Create Onboarding Page (Step 1)
- [ ] 4.2: Create Onboarding Loading Page
- [ ] 4.3: Create Dashboard Page
- [ ] 4.4: Create Course Detail Page
- [ ] 4.5: Create Epic View Page
- [ ] 4.6: Create Story View Page
- [ ] 4.7: Create Task View Page
- [ ] 4.8: Update Authentication Pages (Korean localization)

---

## Phase 5: Verification & Polish (8 Tasks)

- [ ] 5.1: Test User Registration Flow
- [ ] 5.2: Test Course Generation Flow
- [ ] 5.3: Test Task Submission & Grading
- [ ] 5.4: Test Progress Tracking
- [ ] 5.5: Test Activity Heatmap
- [ ] 5.6: Visual QA Against Mockups
- [ ] 5.7: Performance Optimization
- [ ] 5.8: Final Build & Deployment Prep

---

## Parallelization Map

**Wave 1** (4 tasks parallel):

- Tasks 1.1, 1.2, 1.3, 1.4

**Wave 2** (3 tasks parallel):

- Tasks 1.5, 1.6, 1.7

**Wave 3** (4 tasks parallel):

- Tasks 2.1, 2.2, 2.3, 2.4

**Wave 4** (12 tasks parallel - MAX):

- All Phase 3 UI components

**Wave 5** (8 tasks parallel):

- All Phase 4 pages

**Wave 6** (Sequential):

- Phase 5 verification tasks

---

## Success Criteria

- [ ] All mockup screens pixel-perfect
- [ ] Convex schema supports full hierarchy
- [ ] Clerk auth end-to-end functional
- [ ] AI services integrated
- [ ] Progress tracking accurate
- [ ] Build passes with zero errors
- [ ] No TypeScript/ESLint errors
- [ ] All E2E tests pass

---

**Next Steps**: Complete Phase 1 tasks 1.5-1.8, then proceed to Phase 2 backend functions.
