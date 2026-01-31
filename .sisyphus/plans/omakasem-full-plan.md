Task continued and completed in 6m 18s.

Session ID: ses_3eb6097d7ffeRBYSQBMHgRdt4u

---

# Omakasem (오마카쌤) Implementation Plan

## Complete Work Breakdown Document

---

## Executive Summary

This plan implements the **Omakasem (오마카쌤)** AI-Powered Personalized Developer Education Platform. The implementation is organized into **5 phases** with **47 atomic tasks**, designed for maximum parallelization where dependencies allow.

**Target Architecture:**
- **Frontend**: Next.js 15 (App Router) + React 19
- **UI**: Catalyst component library (27 components available)
- **Backend/Database**: Convex (realtime)
- **Authentication**: Clerk
- **AI Services**: omakasem-planner, omakasem-code-reviewer

---

## Phase 1: Foundation Infrastructure (8 Tasks)

### Task 1.1: Initialize Convex Project
- **Files**: `convex/_generated/`, `.env.local`
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Run `npx convex dev` to initialize Convex project, generate types, and obtain deployment URL. Create `.env.local` with `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`.
- **Dependencies**: None
- **Verification**: `convex/_generated/api.d.ts` exists, `npx convex dev` runs without errors
- **Complexity**: Simple
- **Can Parallelize With**: Task 1.4

---

### Task 1.2: Create Environment Configuration
- **Files**: `src/env.ts`
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Create Zod-validated environment configuration for:
  ```typescript
  import { z } from 'zod'
  
  const envSchema = z.object({
    NEXT_PUBLIC_CONVEX_URL: z.string().url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
    CLERK_SECRET_KEY: z.string().startsWith('sk_'),
    OMAKASEM_PLANNER_URL: z.string().url(),
    OMAKASEM_CODE_REVIEWER_URL: z.string().url(),
  })
  
  export const env = envSchema.parse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    OMAKASEM_PLANNER_URL: process.env.OMAKASEM_PLANNER_URL,
    OMAKASEM_CODE_REVIEWER_URL: process.env.OMAKASEM_CODE_REVIEWER_URL,
  })
  ```
- **Dependencies**: Task 1.1
- **Verification**: TypeScript compiles, accessing invalid env throws runtime error
- **Complexity**: Simple
- **Can Parallelize With**: Task 1.3, 1.4

---

### Task 1.3: Define Convex Schema - Core Tables
- **Files**: `convex/schema.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Define Convex schema with tables:
  ```typescript
  import { defineSchema, defineTable } from 'convex/server'
  import { v } from 'convex/values'
  
  export default defineSchema({
    // users - synced from Clerk
    users: defineTable({
      clerkId: v.string(),
      email: v.string(),
      name: v.string(),
      imageUrl: v.optional(v.string()),
      createdAt: v.number(),
    }).index('by_clerk_id', ['clerkId']),
    
    // courses (빌더 여정)
    courses: defineTable({
      userId: v.id('users'),
      title: v.string(),
      description: v.string(),
      totalWeeks: v.number(),
      weeklyHours: v.number(),
      status: v.union(
        v.literal('generating'),
        v.literal('active'),
        v.literal('completed')
      ),
      progressPercentage: v.number(),
      level: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index('by_user', ['userId']),
    
    // epics (주차별 학습 단위)
    epics: defineTable({
      courseId: v.id('courses'),
      title: v.string(),
      order: v.number(),
      status: v.union(
        v.literal('locked'),
        v.literal('active'),
        v.literal('completed')
      ),
      createdAt: v.number(),
    }).index('by_course', ['courseId']),
    
    // stories (에픽 내 학습 스토리)
    stories: defineTable({
      epicId: v.id('epics'),
      title: v.string(),
      description: v.string(),
      order: v.number(),
      status: v.union(
        v.literal('locked'),
        v.literal('active'),
        v.literal('completed')
      ),
      createdAt: v.number(),
    }).index('by_epic', ['epicId']),
    
    // tasks (스토리 내 실습 과제)
    tasks: defineTable({
      storyId: v.id('stories'),
      title: v.string(),
      description: v.string(),
      requirements: v.array(v.string()),
      order: v.number(),
      status: v.union(
        v.literal('pending'),
        v.literal('submitted'),
        v.literal('graded')
      ),
      createdAt: v.number(),
    }).index('by_story', ['storyId']),
    
    // submissions (과제 제출물)
    submissions: defineTable({
      taskId: v.id('tasks'),
      userId: v.id('users'),
      code: v.string(),
      feedback: v.optional(v.string()),
      score: v.optional(v.number()),
      passed: v.optional(v.boolean()),
      submittedAt: v.number(),
      gradedAt: v.optional(v.number()),
    }).index('by_task', ['taskId'])
      .index('by_user', ['userId']),
    
    // activity_logs (활동 히트맵용)
    activity_logs: defineTable({
      userId: v.id('users'),
      date: v.string(), // YYYY-MM-DD format
      activityCount: v.number(),
      type: v.union(
        v.literal('task_completed'),
        v.literal('submission'),
        v.literal('login')
      ),
    }).index('by_user_date', ['userId', 'date']),
  })
  ```
- **Dependencies**: Task 1.1
- **Verification**: `npx convex dev` generates types without errors, all indices created
- **Complexity**: Medium
- **Can Parallelize With**: Task 1.2

---

### Task 1.4: Install Clerk Dependencies
- **Files**: `package.json`
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Install Clerk packages:
  ```bash
  npm install @clerk/nextjs @clerk/themes
  ```
  Note: `convex` package already installed (v1.31.7), includes `convex/react-clerk`
- **Dependencies**: None
- **Verification**: Packages listed in `package.json`, `node_modules` contains `@clerk/nextjs`
- **Complexity**: Simple
- **Can Parallelize With**: Task 1.1, 1.2, 1.3

---

### Task 1.5: Create Convex-Clerk Provider
- **Files**: `src/components/providers/convex-clerk-provider.tsx`
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Create provider component that wraps ClerkProvider and ConvexProviderWithClerk:
  ```typescript
  'use client'
  
  import { ClerkProvider, useAuth } from '@clerk/nextjs'
  import { ConvexProviderWithClerk } from 'convex/react-clerk'
  import { ConvexReactClient } from 'convex/react'
  import { ReactNode } from 'react'
  
  const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL!
  )
  
  export function ConvexClerkProvider({ 
    children 
  }: { 
    children: ReactNode 
  }) {
    return (
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    )
  }
  ```
- **Dependencies**: Task 1.2, 1.4
- **Verification**: Component renders without errors, Convex connection established
- **Complexity**: Simple
- **Can Parallelize With**: None (depends on previous)

---

### Task 1.6: Update Root Layout with Providers
- **Files**: `src/app/layout.tsx`
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Wrap application with ConvexClerkProvider. Update metadata for Omakasem branding. Set Korean lang attribute:
  ```typescript
  import '@/styles/tailwind.css'
  import type { Metadata } from 'next'
  import { ConvexClerkProvider } from '@/components/providers/convex-clerk-provider'
  
  export const metadata: Metadata = {
    title: {
      template: '%s - 오마카쌤',
      default: '오마카쌤 - AI 맞춤 개발자 교육',
    },
    description: 'AI가 설계하는 나만의 개발자 학습 여정',
  }
  
  export default function RootLayout({ 
    children 
  }: { 
    children: React.ReactNode 
  }) {
    return (
      <html lang="ko" className="antialiased">
        <head>
          <link rel="preconnect" href="https://rsms.me/" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        </head>
        <body>
          <ConvexClerkProvider>
            {children}
          </ConvexClerkProvider>
        </body>
      </html>
    )
  }
  ```
- **Dependencies**: Task 1.5
- **Verification**: App loads without hydration errors, Clerk/Convex contexts available
- **Complexity**: Simple
- **Can Parallelize With**: None

---

### Task 1.7: Create Clerk Middleware
- **Files**: `src/middleware.ts`
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Create Clerk middleware with route protection:
  ```typescript
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
  
  const isPublicRoute = createRouteMatcher([
    '/login(.*)',
    '/register(.*)',
    '/forgot-password(.*)',
    '/api/webhooks(.*)',
  ])
  
  export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
  })
  
  export const config = {
    matcher: [
      '/((?!.*\\..*|_next).*)',
      '/',
      '/(api|trpc)(.*)'
    ],
  }
  ```
- **Dependencies**: Task 1.4
- **Verification**: Unauthenticated users redirected to login, authenticated users can access dashboard
- **Complexity**: Simple
- **Can Parallelize With**: Task 1.5, 1.6

---

### Task 1.8: Setup Clerk JWT Template for Convex
- **Files**: Documentation/Manual (Clerk Dashboard)
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: In Clerk Dashboard:
  1. Go to **Configure** → **JWT Templates**
  2. Click **New template** → Select **Convex**
  3. Template will be auto-configured with:
     - Issuer: Your Clerk frontend API URL
     - Claims: `{ sub, iat, exp, nbf }`
  4. Save and note the template name (default: "convex")
- **Dependencies**: Task 1.4
- **Verification**: JWT template exists in dashboard, Convex can verify tokens
- **Complexity**: Simple (Manual step)
- **Can Parallelize With**: Task 1.5, 1.6, 1.7

---

## Phase 2: Convex Backend Functions (6 Tasks)

### Task 2.1: Create User Sync Functions
- **Files**: `convex/users.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create Convex functions for user management:
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  // Upsert user from Clerk webhook or first login
  export const upsertUser = mutation({
    args: {
      clerkId: v.string(),
      email: v.string(),
      name: v.string(),
      imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
        .unique()
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          email: args.email,
          name: args.name,
          imageUrl: args.imageUrl,
        })
        return existing._id
      }
      
      return await ctx.db.insert('users', {
        ...args,
        createdAt: Date.now(),
      })
    },
  })
  
  // Get user by Clerk ID
  export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
      return await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
        .unique()
    },
  })
  
  // Get current authenticated user
  export const getCurrentUser = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) return null
      
      return await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => 
          q.eq('clerkId', identity.subject)
        )
        .unique()
    },
  })
  ```
- **Dependencies**: Task 1.3
- **Verification**: User can be created and queried, auth context works
- **Complexity**: Medium
- **Can Parallelize With**: Task 2.2, 2.3, 2.4

---

### Task 2.2: Create Course CRUD Functions
- **Files**: `convex/courses.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create course management functions:
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  // Create new course (빌더 여정)
  export const createCourse = mutation({
    args: {
      title: v.string(),
      description: v.string(),
      totalWeeks: v.number(),
      weeklyHours: v.number(),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) throw new Error('Unauthorized')
      
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => 
          q.eq('clerkId', identity.subject)
        )
        .unique()
      if (!user) throw new Error('User not found')
      
      return await ctx.db.insert('courses', {
        userId: user._id,
        ...args,
        status: 'generating',
        progressPercentage: 0,
        level: '비기너',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    },
  })
  
  // Get all courses for current user
  export const getUserCourses = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) return []
      
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => 
          q.eq('clerkId', identity.subject)
        )
        .unique()
      if (!user) return []
      
      return await ctx.db
        .query('courses')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .collect()
    },
  })
  
  // Get single course by ID
  export const getCourseById = query({
    args: { courseId: v.id('courses') },
    handler: async (ctx, args) => {
      return await ctx.db.get(args.courseId)
    },
  })
  
  // Get course with full hierarchy
  export const getCourseWithHierarchy = query({
    args: { courseId: v.id('courses') },
    handler: async (ctx, args) => {
      const course = await ctx.db.get(args.courseId)
      if (!course) return null
      
      const epics = await ctx.db
        .query('epics')
        .withIndex('by_course', (q) => q.eq('courseId', args.courseId))
        .collect()
      
      const epicsWithStories = await Promise.all(
        epics.map(async (epic) => {
          const stories = await ctx.db
            .query('stories')
            .withIndex('by_epic', (q) => q.eq('epicId', epic._id))
            .collect()
          
          const storiesWithTasks = await Promise.all(
            stories.map(async (story) => {
              const tasks = await ctx.db
                .query('tasks')
                .withIndex('by_story', (q) => q.eq('storyId', story._id))
                .collect()
              return { ...story, tasks }
            })
          )
          return { ...epic, stories: storiesWithTasks }
        })
      )
      
      return { ...course, epics: epicsWithStories }
    },
  })
  
  // Update course status
  export const updateCourseStatus = mutation({
    args: {
      courseId: v.id('courses'),
      status: v.union(
        v.literal('generating'),
        v.literal('active'),
        v.literal('completed')
      ),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.courseId, {
        status: args.status,
        updatedAt: Date.now(),
      })
    },
  })
  
  // Update course progress
  export const updateCourseProgress = mutation({
    args: {
      courseId: v.id('courses'),
      progressPercentage: v.number(),
      level: v.string(),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.courseId, {
        progressPercentage: args.progressPercentage,
        level: args.level,
        updatedAt: Date.now(),
      })
    },
  })
  
  // Delete course
  export const deleteCourse = mutation({
    args: { courseId: v.id('courses') },
    handler: async (ctx, args) => {
      // Delete all related data (epics, stories, tasks, submissions)
      const epics = await ctx.db
        .query('epics')
        .withIndex('by_course', (q) => q.eq('courseId', args.courseId))
        .collect()
      
      for (const epic of epics) {
        const stories = await ctx.db
          .query('stories')
          .withIndex('by_epic', (q) => q.eq('epicId', epic._id))
          .collect()
        
        for (const story of stories) {
          const tasks = await ctx.db
            .query('tasks')
            .withIndex('by_story', (q) => q.eq('storyId', story._id))
            .collect()
          
          for (const task of tasks) {
            // Delete submissions for this task
            const submissions = await ctx.db
              .query('submissions')
              .withIndex('by_task', (q) => q.eq('taskId', task._id))
              .collect()
            for (const sub of submissions) {
              await ctx.db.delete(sub._id)
            }
            await ctx.db.delete(task._id)
          }
          await ctx.db.delete(story._id)
        }
        await ctx.db.delete(epic._id)
      }
      
      await ctx.db.delete(args.courseId)
    },
  })
  ```
- **Dependencies**: Task 1.3
- **Verification**: Full CRUD operations work, progress calculation accurate
- **Complexity**: Medium
- **Can Parallelize With**: Task 2.1, 2.3, 2.4

---

### Task 2.3: Create Epic/Story/Task Functions
- **Files**: `convex/epics.ts`, `convex/stories.ts`, `convex/tasks.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create learning hierarchy functions:

  **convex/epics.ts:**
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  export const createEpic = mutation({
    args: {
      courseId: v.id('courses'),
      title: v.string(),
      order: v.number(),
    },
    handler: async (ctx, args) => {
      return await ctx.db.insert('epics', {
        ...args,
        status: args.order === 0 ? 'active' : 'locked',
        createdAt: Date.now(),
      })
    },
  })
  
  export const getEpicsByCourse = query({
    args: { courseId: v.id('courses') },
    handler: async (ctx, args) => {
      return await ctx.db
        .query('epics')
        .withIndex('by_course', (q) => q.eq('courseId', args.courseId))
        .collect()
    },
  })
  
  export const updateEpicStatus = mutation({
    args: {
      epicId: v.id('epics'),
      status: v.union(
        v.literal('locked'),
        v.literal('active'),
        v.literal('completed')
      ),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.epicId, { status: args.status })
    },
  })
  ```

  **convex/stories.ts:**
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  export const createStory = mutation({
    args: {
      epicId: v.id('epics'),
      title: v.string(),
      description: v.string(),
      order: v.number(),
    },
    handler: async (ctx, args) => {
      return await ctx.db.insert('stories', {
        ...args,
        status: args.order === 0 ? 'active' : 'locked',
        createdAt: Date.now(),
      })
    },
  })
  
  export const getStoriesByEpic = query({
    args: { epicId: v.id('epics') },
    handler: async (ctx, args) => {
      return await ctx.db
        .query('stories')
        .withIndex('by_epic', (q) => q.eq('epicId', args.epicId))
        .collect()
    },
  })
  
  export const updateStoryStatus = mutation({
    args: {
      storyId: v.id('stories'),
      status: v.union(
        v.literal('locked'),
        v.literal('active'),
        v.literal('completed')
      ),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.storyId, { status: args.status })
    },
  })
  ```

  **convex/tasks.ts:**
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  export const createTask = mutation({
    args: {
      storyId: v.id('stories'),
      title: v.string(),
      description: v.string(),
      requirements: v.array(v.string()),
      order: v.number(),
    },
    handler: async (ctx, args) => {
      return await ctx.db.insert('tasks', {
        ...args,
        status: 'pending',
        createdAt: Date.now(),
      })
    },
  })
  
  export const getTasksByStory = query({
    args: { storyId: v.id('stories') },
    handler: async (ctx, args) => {
      return await ctx.db
        .query('tasks')
        .withIndex('by_story', (q) => q.eq('storyId', args.storyId))
        .collect()
    },
  })
  
  export const updateTaskStatus = mutation({
    args: {
      taskId: v.id('tasks'),
      status: v.union(
        v.literal('pending'),
        v.literal('submitted'),
        v.literal('graded')
      ),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.taskId, { status: args.status })
    },
  })
  
  export const getTaskById = query({
    args: { taskId: v.id('tasks') },
    handler: async (ctx, args) => {
      return await ctx.db.get(args.taskId)
    },
  })
  ```
- **Dependencies**: Task 1.3
- **Verification**: Hierarchical data can be created and queried, status transitions work
- **Complexity**: Medium
- **Can Parallelize With**: Task 2.1, 2.2, 2.4

---

### Task 2.4: Create Submission & Activity Functions
- **Files**: `convex/submissions.ts`, `convex/activities.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create submission and activity tracking:

  **convex/submissions.ts:**
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  export const submitTask = mutation({
    args: {
      taskId: v.id('tasks'),
      code: v.string(),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) throw new Error('Unauthorized')
      
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => 
          q.eq('clerkId', identity.subject)
        )
        .unique()
      if (!user) throw new Error('User not found')
      
      // Update task status
      await ctx.db.patch(args.taskId, { status: 'submitted' })
      
      return await ctx.db.insert('submissions', {
        taskId: args.taskId,
        userId: user._id,
        code: args.code,
        submittedAt: Date.now(),
      })
    },
  })
  
  export const updateSubmissionGrade = mutation({
    args: {
      submissionId: v.id('submissions'),
      feedback: v.string(),
      score: v.number(),
      passed: v.boolean(),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.submissionId, {
        feedback: args.feedback,
        score: args.score,
        passed: args.passed,
        gradedAt: Date.now(),
      })
      
      // If passed, update task status to graded
      const submission = await ctx.db.get(args.submissionId)
      if (submission && args.passed) {
        await ctx.db.patch(submission.taskId, { status: 'graded' })
      }
    },
  })
  
  export const getSubmissionsByTask = query({
    args: { taskId: v.id('tasks') },
    handler: async (ctx, args) => {
      return await ctx.db
        .query('submissions')
        .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
        .collect()
    },
  })
  
  export const getLatestSubmission = query({
    args: { taskId: v.id('tasks') },
    handler: async (ctx, args) => {
      const submissions = await ctx.db
        .query('submissions')
        .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
        .collect()
      
      return submissions.sort((a, b) => b.submittedAt - a.submittedAt)[0] || null
    },
  })
  ```

  **convex/activities.ts:**
  ```typescript
  import { mutation, query } from './_generated/server'
  import { v } from 'convex/values'
  
  export const logActivity = mutation({
    args: {
      type: v.union(
        v.literal('task_completed'),
        v.literal('submission'),
        v.literal('login')
      ),
      date: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) throw new Error('Unauthorized')
      
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => 
          q.eq('clerkId', identity.subject)
        )
        .unique()
      if (!user) throw new Error('User not found')
      
      const date = args.date || new Date().toISOString().split('T')[0]
      
      // Check if entry exists for this date
      const existing = await ctx.db
        .query('activity_logs')
        .withIndex('by_user_date', (q) => 
          q.eq('userId', user._id).eq('date', date)
        )
        .unique()
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          activityCount: existing.activityCount + 1,
        })
        return existing._id
      }
      
      return await ctx.db.insert('activity_logs', {
        userId: user._id,
        date,
        activityCount: 1,
        type: args.type,
      })
    },
  })
  
  export const getActivityHeatmap = query({
    args: { year: v.optional(v.number()) },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity()
      if (!identity) return []
      
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => 
          q.eq('clerkId', identity.subject)
        )
        .unique()
      if (!user) return []
      
      const year = args.year || new Date().getFullYear()
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      
      const activities = await ctx.db
        .query('activity_logs')
        .withIndex('by_user_date', (q) => q.eq('userId', user._id))
        .collect()
      
      return activities
        .filter((a) => a.date >= startDate && a.date <= endDate)
        .map((a) => ({ date: a.date, count: a.activityCount }))
    },
  })
  ```
- **Dependencies**: Task 1.3
- **Verification**: Submissions stored, activity heatmap data accurate
- **Complexity**: Medium
- **Can Parallelize With**: Task 2.1, 2.2, 2.3

---

### Task 2.5: Create Course Generation Action (AI Integration)
- **Files**: `convex/actions/generateCourse.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create Convex action that calls omakasem-planner API:
  ```typescript
  'use node'
  
  import { action } from '../_generated/server'
  import { v } from 'convex/values'
  import { api } from '../_generated/api'
  
  interface PlannerResponse {
    epics: Array<{
      title: string
      order: number
      stories: Array<{
        title: string
        description: string
        order: number
        tasks: Array<{
          title: string
          description: string
          requirements: string[]
          order: number
        }>
      }>
    }>
  }
  
  export const generateCourse = action({
    args: {
      courseId: v.id('courses'),
      title: v.string(),
      description: v.string(),
      totalWeeks: v.number(),
      weeklyHours: v.number(),
    },
    handler: async (ctx, args) => {
      try {
        // 1. Call omakasem-planner API
        const response = await fetch(
          process.env.OMAKASEM_PLANNER_URL + '/generate',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: args.title,
              description: args.description,
              duration_weeks: args.totalWeeks,
              weekly_hours: args.weeklyHours,
            }),
          }
        )
        
        if (!response.ok) {
          throw new Error(`Planner API error: ${response.status}`)
        }
        
        const curriculum: PlannerResponse = await response.json()
        
        // 2. Insert epics, stories, tasks
        for (const epicData of curriculum.epics) {
          const epicId = await ctx.runMutation(api.epics.createEpic, {
            courseId: args.courseId,
            title: epicData.title,
            order: epicData.order,
          })
          
          for (const storyData of epicData.stories) {
            const storyId = await ctx.runMutation(api.stories.createStory, {
              epicId,
              title: storyData.title,
              description: storyData.description,
              order: storyData.order,
            })
            
            for (const taskData of storyData.tasks) {
              await ctx.runMutation(api.tasks.createTask, {
                storyId,
                title: taskData.title,
                description: taskData.description,
                requirements: taskData.requirements,
                order: taskData.order,
              })
            }
          }
        }
        
        // 3. Update course status to 'active'
        await ctx.runMutation(api.courses.updateCourseStatus, {
          courseId: args.courseId,
          status: 'active',
        })
        
        return { success: true }
      } catch (error) {
        console.error('Course generation failed:', error)
        // Could update course status to 'failed' here
        throw error
      }
    },
  })
  ```
- **Dependencies**: Task 2.2, 2.3
- **Verification**: Course generation creates full hierarchy, handles API errors gracefully
- **Complexity**: Complex
- **Can Parallelize With**: Task 2.6

---

### Task 2.6: Create Code Review Action (AI Integration)
- **Files**: `convex/actions/reviewCode.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create Convex action that calls omakasem-code-reviewer API:
  ```typescript
  'use node'
  
  import { action } from '../_generated/server'
  import { v } from 'convex/values'
  import { api } from '../_generated/api'
  
  interface ReviewerResponse {
    feedback: string
    score: number
    passed: boolean
    suggestions: string[]
  }
  
  export const reviewCode = action({
    args: {
      submissionId: v.id('submissions'),
      code: v.string(),
      requirements: v.array(v.string()),
      taskTitle: v.string(),
      taskDescription: v.string(),
    },
    handler: async (ctx, args) => {
      try {
        // 1. Call omakasem-code-reviewer API
        const response = await fetch(
          process.env.OMAKASEM_CODE_REVIEWER_URL + '/review',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: args.code,
              requirements: args.requirements,
              task_title: args.taskTitle,
              task_description: args.taskDescription,
            }),
          }
        )
        
        if (!response.ok) {
          throw new Error(`Reviewer API error: ${response.status}`)
        }
        
        const review: ReviewerResponse = await response.json()
        
        // 2. Format feedback with suggestions
        const fullFeedback = review.suggestions.length > 0
          ? `${review.feedback}\n\n개선 제안:\n${review.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
          : review.feedback
        
        // 3. Update submission with results
        await ctx.runMutation(api.submissions.updateSubmissionGrade, {
          submissionId: args.submissionId,
          feedback: fullFeedback,
          score: review.score,
          passed: review.passed,
        })
        
        // 4. Log activity if passed
        if (review.passed) {
          await ctx.runMutation(api.activities.logActivity, {
            type: 'task_completed',
          })
        }
        
        return {
          success: true,
          feedback: fullFeedback,
          score: review.score,
          passed: review.passed,
        }
      } catch (error) {
        console.error('Code review failed:', error)
        throw error
      }
    },
  })
  ```
- **Dependencies**: Task 2.4
- **Verification**: Code review returns feedback, progress updates propagate
- **Complexity**: Complex
- **Can Parallelize With**: Task 2.5

---

## Phase 3: UI Components & Layouts (11 Tasks)

### Task 3.1: Create Onboarding Layout
- **Files**: `src/app/(onboarding)/layout.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create dark modal-centered layout for onboarding flow matching mockup:
  ```typescript
  export default function OnboardingLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <main className="flex min-h-full items-center justify-center bg-black p-4">
        <div className="w-full max-w-lg rounded-3xl bg-neutral-900 p-8">
          {children}
        </div>
      </main>
    )
  }
  ```
  - Full black background (`bg-black`)
  - Centered card with dark grey background (`bg-neutral-900`)
  - Large rounded corners (`rounded-3xl`)
  - Max width constraint (`max-w-lg`)
  - Consistent padding (`p-8`)
- **Dependencies**: Task 1.6
- **Verification**: Layout matches mockup, responsive on mobile
- **Complexity**: Simple
- **Can Parallelize With**: Task 3.2, 3.3, 3.4, 3.5

---

### Task 3.2: Create Progress Step Indicator Component
- **Files**: `src/components/progress-steps.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create 3-segment progress indicator matching mockup:
  ```typescript
  'use client'
  
  import clsx from 'clsx'
  
  interface ProgressStepsProps {
    currentStep: 1 | 2 | 3
    totalSteps?: number
  }
  
  export function ProgressSteps({ 
    currentStep, 
    totalSteps = 3 
  }: ProgressStepsProps) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={clsx(
              'h-1 flex-1 rounded-full transition-colors',
              i < currentStep ? 'bg-white' : 'bg-neutral-700'
            )}
          />
        ))}
      </div>
    )
  }
  ```
  - Three horizontal bars with gap
  - Active segment: white (`bg-white`)
  - Inactive segments: dark grey (`bg-neutral-700`)
  - Accept `currentStep` prop (1-3)
  - Smooth transition animation
- **Dependencies**: None
- **Verification**: Renders correctly for all step values, visual matches mockup
- **Complexity**: Simple
- **Can Parallelize With**: Task 3.1, 3.3, 3.4, 3.5

---

### Task 3.3: Create Dashboard Sidebar Component
- **Files**: `src/components/dashboard-sidebar.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create sidebar matching mockup exactly:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useUser } from '@clerk/nextjs'
  import { useQuery } from 'convex/react'
  import { api } from '@/../convex/_generated/api'
  import { Avatar } from '@/components/avatar'
  import { Input } from '@/components/input'
  import { Button } from '@/components/button'
  import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/20/solid'
  import Link from 'next/link'
  import { usePathname } from 'next/navigation'
  import clsx from 'clsx'
  
  // Progress badge color based on percentage
  function getProgressColor(progress: number) {
    if (progress >= 70) return 'bg-green-500'
    if (progress >= 40) return 'bg-orange-500'
    return 'bg-pink-500'
  }
  
  export function DashboardSidebar() {
    const { user } = useUser()
    const courses = useQuery(api.courses.getUserCourses)
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = useState('')
    
    const filteredCourses = courses?.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    return (
      <aside className="flex h-full w-72 flex-col bg-gray-100">
        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon 
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" 
            />
            <Input
              type="search"
              placeholder="원하는 내용 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        {/* Course List */}
        <div className="flex-1 overflow-y-auto px-4">
          <h3 className="mb-2 text-xs font-medium text-gray-500">
            빌더 여정들
          </h3>
          <nav className="space-y-1">
            {filteredCourses?.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
                className={clsx(
                  'flex items-center justify-between rounded-lg px-3 py-2',
                  pathname.includes(course._id) 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-gray-200'
                )}
              >
                <span className="truncate text-sm font-medium">
                  {course.title}
                </span>
                <span 
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-xs font-medium text-white',
                    getProgressColor(course.progressPercentage)
                  )}
                >
                  {course.progressPercentage}%
                </span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* New Journey Button */}
        <div className="p-4">
          <Button href="/onboarding" className="w-full justify-center">
            <PlusIcon className="size-4" />
            새 빌더 여정
          </Button>
        </div>
        
        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar 
              src={user?.imageUrl} 
              alt={user?.fullName || ''} 
              className="size-10"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.fullName} 빌더
              </p>
              <p className="truncate text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>
    )
  }
  ```
  Key elements from mockup:
  - Search input: "원하는 내용 검색"
  - Section label: "빌더 여정들"
  - Course list with colored progress badges (orange 59%, pink 27%, green 75%)
  - "+ 새 빌더 여정" button
  - User profile at bottom with "빌더" suffix
  - Light grey background (`bg-gray-100`)
- **Dependencies**: Task 1.6
- **Verification**: All elements present, progress badges colored correctly, responsive
- **Complexity**: Medium
- **Can Parallelize With**: Task 3.1, 3.2, 3.4, 3.5

---

### Task 3.4: Create Epic Navigation Component
- **Files**: `src/components/epic-navigation.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create horizontal scrollable epic tabs matching mockup:
  ```typescript
  'use client'
  
  import { useRef, useState, useEffect } from 'react'
  import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
  import clsx from 'clsx'
  import Link from 'next/link'
  
  interface Epic {
    _id: string
    title: string
    order: number
    status: 'locked' | 'active' | 'completed'
  }
  
  interface EpicNavigationProps {
    epics: Epic[]
    activeEpicId: string
    courseId: string
  }
  
  export function EpicNavigation({ 
    epics, 
    activeEpicId, 
    courseId 
  }: EpicNavigationProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    
    const checkScroll = () => {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
    
    useEffect(() => {
      checkScroll()
      window.addEventListener('resize', checkScroll)
      return () => window.removeEventListener('resize', checkScroll)
    }, [epics])
    
    const scroll = (direction: 'left' | 'right') => {
      if (!scrollRef.current) return
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
    
    const sortedEpics = [...epics].sort((a, b) => a.order - b.order)
    
    return (
      <div className="relative flex items-center">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 flex size-8 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        )}
        
        {/* Tabs */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2 overflow-x-auto px-10 scrollbar-hide"
        >
          {sortedEpics.map((epic) => (
            <Link
              key={epic._id}
              href={`/courses/${courseId}/epics/${epic._id}`}
              className={clsx(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                epic._id === activeEpicId
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                epic.status === 'locked' && 'opacity-50'
              )}
            >
              {epic.title}
            </Link>
          ))}
        </div>
        
        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 flex size-8 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        )}
      </div>
    )
  }
  ```
  From mockup:
  - Tabs: "Python 기초", "웹 개발 기초", "FastAPI 시작", "DB 연동", "인증과 보안", "배포와 운영"
  - Active tab has dark background
  - Arrow buttons on edges
  - Smooth horizontal scroll
- **Dependencies**: None
- **Verification**: Scrolls smoothly, active state visible, arrows hide when at bounds
- **Complexity**: Medium
- **Can Parallelize With**: Task 3.1, 3.2, 3.3, 3.5

---

### Task 3.5: Create Activity Heatmap Component
- **Files**: `src/components/activity-heatmap.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create GitHub-style contribution heatmap matching mockup:
  ```typescript
  'use client'
  
  import { useMemo, useState } from 'react'
  import clsx from 'clsx'
  
  interface ActivityData {
    date: string // YYYY-MM-DD
    count: number
  }
  
  interface ActivityHeatmapProps {
    data: ActivityData[]
    year?: number
  }
  
  function getIntensityClass(count: number): string {
    if (count === 0) return 'bg-gray-100'
    if (count <= 2) return 'bg-gray-300'
    if (count <= 4) return 'bg-gray-500'
    return 'bg-gray-700'
  }
  
  export function ActivityHeatmap({ data, year }: ActivityHeatmapProps) {
    const currentYear = year || new Date().getFullYear()
    const [hoveredCell, setHoveredCell] = useState<{
      date: string
      count: number
      x: number
      y: number
    } | null>(null)
    
    // Generate all dates for the year
    const cells = useMemo(() => {
      const startDate = new Date(currentYear, 0, 1)
      const endDate = new Date(currentYear, 11, 31)
      const dataMap = new Map(data.map((d) => [d.date, d.count]))
      
      const result: Array<{
        date: string
        count: number
        weekIndex: number
        dayIndex: number
      }> = []
      
      const current = new Date(startDate)
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0]
        const weekIndex = Math.floor(
          (current.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
        const dayIndex = current.getDay()
        
        result.push({
          date: dateStr,
          count: dataMap.get(dateStr) || 0,
          weekIndex,
          dayIndex,
        })
        
        current.setDate(current.getDate() + 1)
      }
      
      return result
    }, [data, currentYear])
    
    // Group by weeks
    const weeks = useMemo(() => {
      const weekMap = new Map<number, typeof cells>()
      cells.forEach((cell) => {
        if (!weekMap.has(cell.weekIndex)) {
          weekMap.set(cell.weekIndex, [])
        }
        weekMap.get(cell.weekIndex)!.push(cell)
      })
      return Array.from(weekMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([_, days]) => days)
    }, [cells])
    
    return (
      <div className="relative">
        <div className="flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const cell = week.find((c) => c.dayIndex === dayIdx)
                if (!cell) {
                  return <div key={dayIdx} className="size-3" />
                }
                return (
                  <div
                    key={dayIdx}
                    className={clsx(
                      'size-3 rounded-sm cursor-pointer transition-transform hover:scale-125',
                      getIntensityClass(cell.count)
                    )}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredCell({
                        date: cell.date,
                        count: cell.count,
                        x: rect.left,
                        y: rect.top,
                      })
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
        
        {/* Tooltip */}
        {hoveredCell && (
          <div
            className="pointer-events-none fixed z-50 rounded bg-gray-900 px-2 py-1 text-xs text-white"
            style={{
              left: hoveredCell.x,
              top: hoveredCell.y - 30,
            }}
          >
            {hoveredCell.count}개 활동 - {hoveredCell.date}
          </div>
        )}
      </div>
    )
  }
  ```
  - 7x52 grid (days x weeks)
  - Grayscale intensity (4 levels)
  - Rounded cells (`rounded-sm`)
  - Tooltip on hover showing date and count
- **Dependencies**: None
- **Verification**: Renders full year, colors match activity levels, tooltips work
- **Complexity**: Medium
- **Can Parallelize With**: Task 3.1, 3.2, 3.3, 3.4

---

### Task 3.6: Create Progress Display Component
- **Files**: `src/components/progress-display.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create large progress percentage display matching mockup:
  ```typescript
  import clsx from 'clsx'
  
  interface ProgressDisplayProps {
    percentage: number
    level: string
    label?: string
  }
  
  export function ProgressDisplay({ 
    percentage, 
    level, 
    label = '나의 진행 상황' 
  }: ProgressDisplayProps) {
    return (
      <div className="space-y-4">
        {/* Label */}
        <p className="text-sm text-gray-500">{label}</p>
        
        {/* Large Percentage */}
        <div className="flex items-end gap-4">
          <span className="text-6xl font-bold tabular-nums">
            {percentage}%
          </span>
          
          {/* Level Badge */}
          <div className="mb-2 flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1">
            <span className="text-sky-500">
              {/* Level icon - could use emoji or heroicon */}
              ⚡
            </span>
            <span className="text-sm font-medium text-sky-700">
              {level}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-sky-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
  ```
  From mockup:
  - Large percentage number (59%)
  - "나의 진행 상황" label
  - Horizontal progress bar (sky blue)
  - Level indicator with icon ("미들")
- **Dependencies**: None
- **Verification**: Percentage and bar sync, level displays correctly
- **Complexity**: Simple
- **Can Parallelize With**: Task 3.5, 3.7, 3.8

---

### Task 3.7: Create Story Card Component
- **Files**: `src/components/story-card.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create story card matching mockup:
  ```typescript
  import { ReactNode } from 'react'
  
  interface StoryCardProps {
    title: string
    description: string
    children: ReactNode // Task cards
  }
  
  export function StoryCard({ 
    title, 
    description, 
    children 
  }: StoryCardProps) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Story 구성</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        
        {/* Task Cards */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
  ```
  From mockup:
  - "Story 구성" header
  - Story description: "FastAPI 프레임워크를 사용하여 첫 번째 API를 구축합니다."
  - Contains task cards as children
  - White background, subtle border, rounded corners
- **Dependencies**: None
- **Verification**: Layout matches mockup, accepts children for task cards
- **Complexity**: Simple
- **Can Parallelize With**: Task 3.6, 3.8

---

### Task 3.8: Create Task Card Component
- **Files**: `src/components/task-card.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create task card with nested requirements matching mockup:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { DocumentTextIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
  import { CheckCircleIcon } from '@heroicons/react/24/outline'
  import clsx from 'clsx'
  
  interface TaskCardProps {
    title: string
    description: string
    requirements: string[]
    status: 'pending' | 'submitted' | 'graded'
    onSubmit?: () => void
  }
  
  export function TaskCard({ 
    title, 
    description, 
    requirements,
    status,
    onSubmit 
  }: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-start gap-3 text-left"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white">
            <DocumentTextIcon className="size-5 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium">{title}</h4>
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          </div>
          <ChevronDownIcon 
            className={clsx(
              'size-5 text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )} 
          />
        </button>
        
        {/* Requirements List */}
        {isExpanded && requirements.length > 0 && (
          <div className="mt-4 space-y-2 pl-13">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircleIcon 
                  className={clsx(
                    'mt-0.5 size-4 shrink-0',
                    status === 'graded' ? 'text-green-500' : 'text-gray-300'
                  )} 
                />
                <span className="text-sm text-gray-600">{req}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Submit Button */}
        {status === 'pending' && onSubmit && (
          <div className="mt-4 pl-13">
            <button
              onClick={onSubmit}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              코드 제출
            </button>
          </div>
        )}
        
        {/* Status Badge */}
        {status !== 'pending' && (
          <div className="mt-4 pl-13">
            <span 
              className={clsx(
                'inline-block rounded-full px-3 py-1 text-xs font-medium',
                status === 'submitted' && 'bg-yellow-100 text-yellow-700',
                status === 'graded' && 'bg-green-100 text-green-700'
              )}
            >
              {status === 'submitted' ? '채점 중' : '완료'}
            </span>
          </div>
        )}
      </div>
    )
  }
  ```
  From mockup:
  - Title: "개발 환경 설정"
  - Description: "FastAPI 개발을 위한 Python 가상환경과 필수 패키지를 설치합니다."
  - Requirements:
    - "가상환경 생성": "python -m venv venv 명령으로 가상환경 생성 완료"
    - "FastAPI 설치": "pip install fastapi uvicorn 실행 후 import fastapi 성공"
    - "Hello World API 작성": "GET / 엔드포인트가 {"message": "Hello World"} 반환"
  - Expandable/collapsible
  - Document icon
- **Dependencies**: None
- **Verification**: Renders task with requirements, expand/collapse works
- **Complexity**: Medium
- **Can Parallelize With**: Task 3.6, 3.7

---

### Task 3.9: Create Loading State Component
- **Files**: `src/components/generation-loading.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create loading state matching mockup exactly:
  ```typescript
  import { FlagIcon } from '@heroicons/react/24/outline'
  import { ProgressSteps } from './progress-steps'
  
  interface GenerationLoadingProps {
    step?: 1 | 2 | 3
  }
  
  export function GenerationLoading({ step = 2 }: GenerationLoadingProps) {
    return (
      <div className="space-y-6">
        {/* Progress Steps */}
        <ProgressSteps currentStep={step} />
        
        {/* Content */}
        <div className="space-y-4 pt-4">
          {/* Flag Icon */}
          <FlagIcon className="size-8 text-white" />
          
          {/* Headline */}
          <h1 className="text-xl font-bold text-white">
            빌더 여정 설계 중...
          </h1>
          
          {/* Description */}
          <p className="text-sm text-neutral-400">
            빌드할 주제를 기반으로 당신에게 맞는 빌드 루트를 설계합니다.
          </p>
          
          {/* Loading Animation */}
          <div className="flex gap-1 pt-4">
            <span className="size-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-white" />
          </div>
        </div>
      </div>
    )
  }
  ```
  From mockup:
  - Flag icon (outline)
  - "빌더 여정 설계 중..." headline
  - "빌드할 주제를 기반으로 당신에게 맞는 빌드 루트를 설계합니다." description
  - Progress step indicator (3 segments, first active)
  - Animated dots loading indicator
- **Dependencies**: Task 3.2
- **Verification**: Renders centered, animation smooth, text correct
- **Complexity**: Simple
- **Can Parallelize With**: Task 3.6, 3.7, 3.8

---

### Task 3.10: Create Dashboard Layout
- **Files**: `src/app/(dashboard)/layout.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create two-column dashboard layout matching mockup:
  ```typescript
  import { DashboardSidebar } from '@/components/dashboard-sidebar'
  
  export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="flex h-full">
        {/* Sidebar - Hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    )
  }
  ```
  From mockup:
  - Fixed-width sidebar (left, 288px / w-72)
  - Fluid content area (right, white background)
  - Sidebar hidden on mobile (responsive)
- **Dependencies**: Task 3.3
- **Verification**: Layout matches mockup, responsive behavior correct
- **Complexity**: Medium
- **Can Parallelize With**: Task 3.11

---

### Task 3.11: Create Code Submission Dialog
- **Files**: `src/components/code-submission-dialog.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create modal for code submission:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/dialog'
  import { Button } from '@/components/button'
  import { Textarea } from '@/components/textarea'
  import clsx from 'clsx'
  
  interface CodeSubmissionDialogProps {
    isOpen: boolean
    onClose: () => void
    taskTitle: string
    requirements: string[]
    onSubmit: (code: string) => Promise<{
      feedback: string
      score: number
      passed: boolean
    }>
  }
  
  export function CodeSubmissionDialog({
    isOpen,
    onClose,
    taskTitle,
    requirements,
    onSubmit,
  }: CodeSubmissionDialogProps) {
    const [code, setCode] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{
      feedback: string
      score: number
      passed: boolean
    } | null>(null)
    
    const handleSubmit = async () => {
      if (!code.trim()) return
      
      setIsSubmitting(true)
      try {
        const res = await onSubmit(code)
        setResult(res)
      } finally {
        setIsSubmitting(false)
      }
    }
    
    const handleClose = () => {
      setCode('')
      setResult(null)
      onClose()
    }
    
    return (
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>{taskTitle}</DialogTitle>
        <DialogBody>
          {/* Requirements */}
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium">요구사항</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {requirements.map((req, i) => (
                <li key={i}>• {req}</li>
              ))}
            </ul>
          </div>
          
          {/* Code Input */}
          {!result && (
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드를 붙여넣기 하세요..."
              rows={12}
              className="font-mono text-sm"
            />
          )}
          
          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">
                  {result.score}점
                </span>
                <span 
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm font-medium',
                    result.passed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {result.passed ? '통과' : '재시도 필요'}
                </span>
              </div>
              
              {/* Feedback */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-medium">피드백</h4>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {result.feedback}
                </p>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogActions>
          {!result ? (
            <>
              <Button plain onClick={handleClose}>
                취소
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!code.trim() || isSubmitting}
              >
                {isSubmitting ? '채점 중...' : '제출하기'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              닫기
            </Button>
          )}
        </DialogActions>
      </Dialog>
    )
  }
  ```
  Features:
  - Code textarea (monospace font)
  - Submit button with loading state
  - Feedback display area
  - Score display with pass/fail badge
  - Requirements preview
- **Dependencies**: None
- **Verification**: Dialog opens/closes, code can be pasted, submission triggers
- **Complexity**: Medium
- **Can Parallelize With**: Task 3.10

---

## Phase 4: Page Implementation (8 Tasks)

### Task 4.1: Implement Onboarding Page
- **Files**: `src/app/(onboarding)/onboarding/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create onboarding page matching mockup exactly:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { useMutation } from 'convex/react'
  import { api } from '@/../convex/_generated/api'
  import { FlagIcon, XMarkIcon } from '@heroicons/react/24/outline'
  import { ArrowRightIcon } from '@heroicons/react/20/solid'
  import { ProgressSteps } from '@/components/progress-steps'
  import { Input } from '@/components/input'
  import { Button } from '@/components/button'
  
  export default function OnboardingPage() {
    const router = useRouter()
    const createCourse = useMutation(api.courses.createCourse)
    
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      totalWeeks: '',
      weeklyHours: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const validate = () => {
      const newErrors: Record<string, string> = {}
      if (!formData.title.trim()) {
        newErrors.title = '주제 제목을 입력해주세요'
      }
      if (!formData.description.trim()) {
        newErrors.description = '설명을 입력해주세요'
      }
      if (!formData.totalWeeks || parseInt(formData.totalWeeks) < 1) {
        newErrors.totalWeeks = '유효한 주차를 입력해주세요'
      }
      if (!formData.weeklyHours || parseInt(formData.weeklyHours) < 1) {
        newErrors.weeklyHours = '유효한 시간을 입력해주세요'
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }
    
    const handleSubmit = async () => {
      if (!validate()) return
      
      setIsSubmitting(true)
      try {
        const courseId = await createCourse({
          title: formData.title,
          description: formData.description,
          totalWeeks: parseInt(formData.totalWeeks),
          weeklyHours: parseInt(formData.weeklyHours),
        })
        router.push(`/onboarding/loading?courseId=${courseId}`)
      } catch (error) {
        console.error('Failed to create course:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
    
    return (
      <div className="space-y-6">
        {/* Progress Steps */}
        <ProgressSteps currentStep={1} />
        
        {/* Content */}
        <div className="space-y-6 pt-4">
          {/* Flag Icon */}
          <FlagIcon className="size-8 text-white" />
          
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-white">
              나만의 빌더 여정 시작하기
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              빌드할 주제를 기반으로 당신에게 맞는 빌드 여정을 설계합니다.
            </p>
          </div>
          
          {/* Form */}
          <div className="space-y-4">
            {/* 주제 제목 */}
            <div>
              <label className="mb-1.5 block text-sm text-neutral-400">
                주제 제목
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    title: e.target.value 
                  })}
                  placeholder="주제 제목을 입력해주세요"
                  className="w-full rounded-xl bg-neutral-800 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                {formData.title && (
                  <button
                    onClick={() => setFormData({ ...formData, title: '' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <XMarkIcon className="size-5 text-neutral-500" />
                  </button>
                )}
              </div>
            </div>
            
            {/* 주제 한 줄 설명 */}
            <div>
              <label className="mb-1.5 block text-sm text-neutral-400">
                주제 한 줄 설명
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    description: e.target.value 
                  })}
                  placeholder="주제에 대한 설명을 한 줄 이내로 간단히 입력해주세요"
                  className="w-full rounded-xl bg-neutral-800 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                {formData.description && (
                  <button
                    onClick={() => setFormData({ 
                      ...formData, 
                      description: '' 
                    })}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <XMarkIcon className="size-5 text-neutral-500" />
                  </button>
                )}
              </div>
            </div>
            
            {/* 총 주차 & 한 주당 투자 가능 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-neutral-400">
                  총 주차
                </label>
                <input
                  type="text"
                  value={formData.totalWeeks}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    totalWeeks: e.target.value.replace(/\D/g, '') 
                  })}
                  placeholder="예: 15주"
                  className="w-full rounded-xl bg-neutral-800 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-neutral-400">
                  한 주당 투자 가능 시간
                </label>
                <input
                  type="text"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    weeklyHours: e.target.value.replace(/\D/g, '') 
                  })}
                  placeholder="예: 32시간"
                  className="w-full rounded-xl bg-neutral-800 px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-4 font-semibold text-black transition-colors hover:bg-white disabled:opacity-50"
          >
            {isSubmitting ? '처리 중...' : '여정 설계'}
            <ArrowRightIcon className="size-5" />
          </button>
        </div>
      </div>
    )
  }
  ```
  From mockup:
  - Progress indicator (step 1 active)
  - Flag icon
  - Title: "나만의 빌더 여정 시작하기"
  - Subtitle: "빌드할 주제를 기반으로 당신에게 맞는 빌드 여정을 설계합니다."
  - Form fields with X clear buttons:
    - 주제 제목 / "주제 제목을 입력해주세요"
    - 주제 한 줄 설명 / "주제에 대한 설명을 한 줄 이내로 간단히 입력해주세요"
    - 총 주차 / "예: 15주" (2-column)
    - 한 주당 투자 가능 시간 / "예: 32시간" (2-column)
  - "여정 설계 →" button
- **Dependencies**: Task 3.1, 3.2, 2.2
- **Verification**: Form validates, data persists, navigates correctly
- **Complexity**: Medium
- **Can Parallelize With**: Task 4.2

---

### Task 4.2: Implement Onboarding Loading Page
- **Files**: `src/app/(onboarding)/onboarding/loading/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create loading page during course generation:
  ```typescript
  'use client'
  
  import { useEffect } from 'react'
  import { useRouter, useSearchParams } from 'next/navigation'
  import { useQuery, useAction } from 'convex/react'
  import { api } from '@/../convex/_generated/api'
  import { Id } from '@/../convex/_generated/dataModel'
  import { GenerationLoading } from '@/components/generation-loading'
  
  export default function OnboardingLoadingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const courseId = searchParams.get('courseId') as Id<'courses'>
    
    const course = useQuery(
      api.courses.getCourseById, 
      courseId ? { courseId } : 'skip'
    )
    const generateCourse = useAction(api.actions.generateCourse.generateCourse)
    
    // Trigger generation on mount
    useEffect(() => {
      if (!courseId || !course) return
      if (course.status !== 'generating') return
      
      generateCourse({
        courseId,
        title: course.title,
        description: course.description,
        totalWeeks: course.totalWeeks,
        weeklyHours: course.weeklyHours,
      }).catch((error) => {
        console.error('Generation failed:', error)
        // Could show error state here
      })
    }, [courseId, course, generateCourse])
    
    // Redirect when complete
    useEffect(() => {
      if (course?.status === 'active') {
        router.push(`/courses/${courseId}`)
      }
    }, [course?.status, courseId, router])
    
    if (!courseId) {
      router.push('/onboarding')
      return null
    }
    
    return <GenerationLoading step={2} />
  }
  ```
  - Use GenerationLoading component
  - Subscribe to course status via useQuery
  - Trigger generateCourse action
  - Redirect to dashboard when status = 'active'
  - Handle generation errors with retry option
- **Dependencies**: Task 3.9, 2.5
- **Verification**: Shows loading, redirects on completion, handles errors
- **Complexity**: Medium
- **Can Parallelize With**: Task 4.1

---

### Task 4.3: Implement Dashboard Home Page
- **Files**: `src/app/(dashboard)/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create main dashboard page:
  ```typescript
  'use client'
  
  import { useEffect } from 'react'
  import { useRouter } from 'next/navigation'
  import { useQuery } from 'convex/react'
  import { api } from '@/../convex/_generated/api'
  import { Button } from '@/components/button'
  import { PlusIcon, RocketLaunchIcon } from '@heroicons/react/20/solid'
  
  export default function DashboardPage() {
    const router = useRouter()
    const courses = useQuery(api.courses.getUserCourses)
    
    // Redirect to first course if exists
    useEffect(() => {
      if (courses && courses.length > 0) {
        router.push(`/courses/${courses[0]._id}`)
      }
    }, [courses, router])
    
    // Loading state
    if (courses === undefined) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
      )
    }
    
    // Empty state - no courses
    if (courses.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8">
          <RocketLaunchIcon className="mb-4 size-16 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold">
            아직 빌더 여정이 없습니다
          </h1>
          <p className="mb-6 text-center text-gray-500">
            AI가 당신만을 위한 맞춤 학습 여정을 설계해드립니다.
            <br />
            지금 바로 시작해보세요!
          </p>
          <Button href="/onboarding">
            <PlusIcon className="size-5" />
            새 빌더 여정 만들기
          </Button>
        </div>
      )
    }
    
    // Redirecting...
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    )
  }
  ```
  Logic:
  - If no courses: show empty state with CTA
  - If courses exist: redirect to first course
- **Dependencies**: Task 3.10, 2.2
- **Verification**: Conditional rendering works, navigation correct
- **Complexity**: Simple
- **Can Parallelize With**: Task 4.4

---

### Task 4.4: Implement Course Detail Page
- **Files**: `src/app/(dashboard)/courses/[courseId]/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create course detail page matching mockup:
  ```typescript
  'use client'
  
  import { useQuery } from 'convex/react'
  import { api } from '@/../convex/_generated/api'
  import { Id } from '@/../convex/_generated/dataModel'
  import { useParams, useRouter } from 'next/navigation'
  import { useEffect } from 'react'
  import { ProgressDisplay } from '@/components/progress-display'
  import { ActivityHeatmap } from '@/components/activity-heatmap'
  import { EpicNavigation } from '@/components/epic-navigation'
  
  export default function CourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.courseId as Id<'courses'>
    
    const course = useQuery(api.courses.getCourseById, { courseId })
    const epics = useQuery(api.epics.getEpicsByCourse, { courseId })
    const activityData = useQuery(api.activities.getActivityHeatmap, {})
    
    // Redirect to first epic
    useEffect(() => {
      if (epics && epics.length > 0) {
        const sortedEpics = [...epics].sort((a, b) => a.order - b.order)
        const firstActiveEpic = sortedEpics.find(
          (e) => e.status === 'active'
        ) || sortedEpics[0]
        router.push(`/courses/${courseId}/epics/${firstActiveEpic._id}`)
      }
    }, [epics, courseId, router])
    
    if (!course || !epics) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
      )
    }
    
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        
        {/* Progress Section */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <ProgressDisplay
            percentage={course.progressPercentage}
            level={course.level}
          />
          <ActivityHeatmap data={activityData || []} />
        </div>
        
        {/* Epic Navigation */}
        <div className="mb-8">
          <EpicNavigation
            epics={epics}
            activeEpicId=""
            courseId={courseId}
          />
        </div>
        
        {/* Redirecting to first epic... */}
        <div className="flex items-center justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
      </div>
    )
  }
  ```
  From mockup:
  - Course title with icon: "Python 웹 개발 입문"
  - Progress display: 59%, "미들" level
  - Activity heatmap (full year)
  - Epic navigation tabs
  - Auto-redirect to first active epic
- **Dependencies**: Task 3.4, 3.5, 3.6, 2.2
- **Verification**: All data loads, epic navigation works, progress accurate
- **Complexity**: Medium
- **Can Parallelize With**: Task 4.5

---

### Task 4.5: Implement Epic Content Section
- **Files**: `src/app/(dashboard)/courses/[courseId]/epics/[epicId]/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Create epic content section matching mockup:
  ```typescript
  'use client'
  
  import { useState } from 'react'
  import { useParams } from 'next/navigation'
  import { useQuery, useAction, useMutation } from 'convex/react'
  import { api } from '@/../convex/_generated/api'
  import { Id } from '@/../convex/_generated/dataModel'
  import { ProgressDisplay } from '@/components/progress-display'
  import { ActivityHeatmap } from '@/components/activity-heatmap'
  import { EpicNavigation } from '@/components/epic-navigation'
  import { StoryCard } from '@/components/story-card'
  import { TaskCard } from '@/components/task-card'
  import { CodeSubmissionDialog } from '@/components/code-submission-dialog'
  
  export default function EpicContentPage() {
    const params = useParams()
    const courseId = params.courseId as Id<'courses'>
    const epicId = params.epicId as Id<'epics'>
    
    const course = useQuery(api.courses.getCourseById, { courseId })
    const epics = useQuery(api.epics.getEpicsByCourse, { courseId })
    const stories = useQuery(api.stories.getStoriesByEpic, { epicId })
    const activityData = useQuery(api.activities.getActivityHeatmap, {})
    
    // For submission dialog
    const [selectedTask, setSelectedTask] = useState<{
      _id: Id<'tasks'>
      title: string
      description: string
      requirements: string[]
    } | null>(null)
    
    const submitTask = useMutation(api.submissions.submitTask)
    const reviewCode = useAction(api.actions.reviewCode.reviewCode)
    
    const handleSubmit = async (code: string) => {
      if (!selectedTask) throw new Error('No task selected')
      
      const submissionId = await submitTask({
        taskId: selectedTask._id,
        code,
      })
      
      const result = await reviewCode({
        submissionId,
        code,
        requirements: selectedTask.requirements,
        taskTitle: selectedTask.title,
        taskDescription: selectedTask.description,
      })
      
      return result
    }
    
    if (!course || !epics || !stories) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
      )
    }
    
    const currentEpic = epics.find((e) => e._id === epicId)
    const sortedStories = [...stories].sort((a, b) => a.order - b.order)
    
    return (
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        
        {/* Progress Section */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <ProgressDisplay
            percentage={course.progressPercentage}
            level={course.level}
          />
          <ActivityHeatmap data={activityData || []} />
        </div>
        
        {/* Epic Navigation */}
        <div className="mb-8">
          <EpicNavigation
            epics={epics}
            activeEpicId={epicId}
            courseId={courseId}
          />
        </div>
        
        {/* Stories & Tasks */}
        <div className="space-y-6">
          {sortedStories.map((story) => (
            <StoryWithTasks
              key={story._id}
              story={story}
              onSelectTask={setSelectedTask}
            />
          ))}
        </div>
        
        {/* Submission Dialog */}
        <CodeSubmissionDialog
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          taskTitle={selectedTask?.title || ''}
          requirements={selectedTask?.requirements || []}
          onSubmit={handleSubmit}
        />
      </div>
    )
  }
  
  // Helper component for story with tasks
  function StoryWithTasks({
    story,
    onSelectTask,
  }: {
    story: { 
      _id: Id<'stories'>
      title: string
      description: string 
    }
    onSelectTask: (task: any) => void
  }) {
    const tasks = useQuery(api.tasks.getTasksByStory, { 
      storyId: story._id 
    })
    
    if (!tasks) return null
    
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)
    
    return (
      <StoryCard title={story.title} description={story.description}>
        {sortedTasks.map((task) => (
          <TaskCard
            key={task._id}
            title={task.title}
            description={task.description}
            requirements={task.requirements}
            status={task.status}
            onSubmit={() => onSelectTask(task)}
          />
        ))}
      </StoryCard>
    )
  }
  ```
  From mockup:
  - Same header/progress/heatmap as course page
  - Epic tabs with current active
  - Story card: "Story 구성" / "FastAPI 프레임워크를 사용하여 첫 번째 API를 구축합니다."
  - Task cards with requirements:
    - "개발 환경 설정" / "FastAPI 개발을 위한 Python 가상환경과 필수 패키지를 설치합니다."
    - Requirements: 가상환경 생성, FastAPI 설치, Hello World API 작성
  - Click task opens submission dialog
- **Dependencies**: Task 3.7, 3.8, 2.3
- **Verification**: Stories and tasks render, status reflects database
- **Complexity**: Medium
- **Can Parallelize With**: Task 4.4

---

### Task 4.6: Implement Task Submission Flow
- **Files**: Integration in `src/app/(dashboard)/courses/[courseId]/epics/[epicId]/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Complete the task submission flow (partially in 4.5):
  - Full dialog integration
  - Error handling for API failures
  - Progress update after successful submission
  - Activity logging
  - Optimistic UI updates
  - Retry mechanism for failed reviews

  Add progress recalculation:
  ```typescript
  // convex/lib/progress.ts (new file)
  import { Doc, Id } from '../_generated/dataModel'
  import { DatabaseReader } from '../_generated/server'
  
  export async function calculateCourseProgress(
    db: DatabaseReader,
    courseId: Id<'courses'>
  ): Promise<{ percentage: number; level: string }> {
    const epics = await db
      .query('epics')
      .withIndex('by_course', (q) => q.eq('courseId', courseId))
      .collect()
    
    let totalTasks = 0
    let completedTasks = 0
    
    for (const epic of epics) {
      const stories = await db
        .query('stories')
        .withIndex('by_epic', (q) => q.eq('epicId', epic._id))
        .collect()
      
      for (const story of stories) {
        const tasks = await db
          .query('tasks')
          .withIndex('by_story', (q) => q.eq('storyId', story._id))
          .collect()
        
        totalTasks += tasks.length
        completedTasks += tasks.filter((t) => t.status === 'graded').length
      }
    }
    
    const percentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0
    
    const level = getLevel(percentage)
    
    return { percentage, level }
  }
  
  function getLevel(percentage: number): string {
    if (percentage >= 90) return '마스터'
    if (percentage >= 70) return '시니어'
    if (percentage >= 50) return '미들'
    if (percentage >= 30) return '주니어'
    return '비기너'
  }
  ```
- **Dependencies**: Task 3.11, 2.4, 2.6, 4.5
- **Verification**: Full flow works, feedback displays, status updates, progress recalculates
- **Complexity**: Complex
- **Can Parallelize With**: None (depends on all components)

---

### Task 4.7: Update Auth Pages for Clerk
- **Files**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Replace existing auth forms with Clerk components:
  ```typescript
  // src/app/(auth)/login/page.tsx
  import { SignIn } from '@clerk/nextjs'
  
  export default function LoginPage() {
    return (
      <div className="flex min-h-full items-center justify-center">
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none',
            },
          }}
          redirectUrl="/"
          signUpUrl="/register"
        />
      </div>
    )
  }
  ```
  
  ```typescript
  // src/app/(auth)/register/page.tsx
  import { SignUp } from '@clerk/nextjs'
  
  export default function RegisterPage() {
    return (
      <div className="flex min-h-full items-center justify-center">
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none',
            },
          }}
          redirectUrl="/"
          signInUrl="/login"
        />
      </div>
    )
  }
  ```
  
  Update layout for dark theme if needed:
  ```typescript
  // src/app/(auth)/layout.tsx
  export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <main className="flex min-h-full items-center justify-center bg-black p-4">
        {children}
      </main>
    )
  }
  ```
- **Dependencies**: Task 1.4, 1.7
- **Verification**: Auth flow works end-to-end, styling consistent
- **Complexity**: Simple
- **Can Parallelize With**: Task 4.1, 4.2

---

### Task 4.8: Implement Sidebar with Real Data
- **Files**: Update `src/app/(dashboard)/layout.tsx` and `src/components/dashboard-sidebar.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Ensure sidebar is connected to real Convex data (mostly done in 3.3, this is verification/polish):
  - Verify courses fetch and display
  - Verify progress percentages update in real-time
  - Verify search/filter works
  - Verify user profile from Clerk displays correctly
  - Verify "새 빌더 여정" navigation works
  - Add mobile menu toggle for responsive design
  
  Mobile menu addition:
  ```typescript
  // Add to layout.tsx
  'use client'
  
  import { useState } from 'react'
  import { DashboardSidebar } from '@/components/dashboard-sidebar'
  import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
  
  export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    return (
      <div className="flex h-full">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {/* Mobile header */}
          <div className="flex items-center border-b border-gray-200 p-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="size-6" />
            </button>
          </div>
          {children}
        </main>
      </div>
    )
  }
  ```
- **Dependencies**: Task 3.3, 2.2, 1.5
- **Verification**: Real data displays, search works, navigation correct, responsive
- **Complexity**: Medium
- **Can Parallelize With**: Task 4.4, 4.5

---

## Phase 5: Polish, Testing & Verification (8 Tasks)

### Task 5.1: Implement Progress Calculation Logic
- **Files**: `convex/lib/progress.ts`, update `convex/submissions.ts`
- **Category**: `ultrabrain`
- **Skills**: `[]`
- **Description**: Create accurate progress calculation (see Task 4.6 for implementation). Also add automatic progress update after task completion:
  ```typescript
  // Update in convex/submissions.ts after grading
  export const updateSubmissionGrade = mutation({
    // ... existing args
    handler: async (ctx, args) => {
      // ... existing update logic
      
      // After updating submission, recalculate course progress
      if (args.passed) {
        const submission = await ctx.db.get(args.submissionId)
        if (submission) {
          const task = await ctx.db.get(submission.taskId)
          if (task) {
            const story = await ctx.db.get(task.storyId)
            if (story) {
              const epic = await ctx.db.get(story.epicId)
              if (epic) {
                const { percentage, level } = await calculateCourseProgress(
                  ctx.db,
                  epic.courseId
                )
                await ctx.db.patch(epic.courseId, {
                  progressPercentage: percentage,
                  level,
                  updatedAt: Date.now(),
                })
              }
            }
          }
        }
      }
    },
  })
  ```
  
  Level thresholds:
  - 0-29%: 비기너 (Beginner)
  - 30-49%: 주니어 (Junior)
  - 50-69%: 미들 (Middle)
  - 70-89%: 시니어 (Senior)
  - 90-100%: 마스터 (Master)
- **Dependencies**: Task 2.3, 2.4
- **Verification**: Progress matches expected values, updates in real-time
- **Complexity**: Medium
- **Can Parallelize With**: Task 5.2

---

### Task 5.2: Add Korean Font Support
- **Files**: `src/app/layout.tsx`, `src/styles/tailwind.css`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Configure Korean font (Pretendard):
  ```typescript
  // src/app/layout.tsx
  import localFont from 'next/font/local'
  
  const pretendard = localFont({
    src: [
      {
        path: '../fonts/Pretendard-Regular.woff2',
        weight: '400',
        style: 'normal',
      },
      {
        path: '../fonts/Pretendard-Medium.woff2',
        weight: '500',
        style: 'normal',
      },
      {
        path: '../fonts/Pretendard-SemiBold.woff2',
        weight: '600',
        style: 'normal',
      },
      {
        path: '../fonts/Pretendard-Bold.woff2',
        weight: '700',
        style: 'normal',
      },
    ],
    variable: '--font-pretendard',
  })
  
  export default function RootLayout({ children }) {
    return (
      <html lang="ko" className={`${pretendard.variable} antialiased`}>
        ...
      </html>
    )
  }
  ```
  
  ```css
  /* src/styles/tailwind.css */
  @import 'tailwindcss';
  
  @theme {
    --font-sans: var(--font-pretendard), Inter, sans-serif;
  }
  ```
  
  Download Pretendard fonts or use CDN fallback:
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
  ```
- **Dependencies**: Task 1.6
- **Verification**: Korean text renders with correct font, all weights work
- **Complexity**: Simple
- **Can Parallelize With**: Task 5.1, 5.3

---

### Task 5.3: Implement Dark/Light Mode Support
- **Files**: Various components, `src/app/layout.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: 
  - Onboarding routes: Always dark mode
  - Dashboard routes: Always light mode (matches mockup)
  - Auth routes: Dark mode
  
  Implementation via route group layouts:
  ```typescript
  // src/app/(onboarding)/layout.tsx - forces dark
  export default function OnboardingLayout({ children }) {
    return (
      <div className="dark bg-black min-h-full">
        {children}
      </div>
    )
  }
  
  // src/app/(dashboard)/layout.tsx - forces light
  export default function DashboardLayout({ children }) {
    return (
      <div className="bg-white min-h-full">
        {children}
      </div>
    )
  }
  
  // src/app/(auth)/layout.tsx - forces dark
  export default function AuthLayout({ children }) {
    return (
      <div className="dark bg-black min-h-full">
        {children}
      </div>
    )
  }
  ```
- **Dependencies**: All component tasks
- **Verification**: Modes apply correctly per route group
- **Complexity**: Medium
- **Can Parallelize With**: Task 5.1, 5.2

---

### Task 5.4: Add Loading States & Skeletons
- **Files**: Various page files, new `src/components/skeletons.tsx`
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
- **Description**: Add loading states for all data-dependent sections:
  ```typescript
  // src/components/skeletons.tsx
  import clsx from 'clsx'
  
  function Skeleton({ className }: { className?: string }) {
    return (
      <div 
        className={clsx(
          'animate-pulse rounded bg-gray-200',
          className
        )} 
      />
    )
  }
  
  export function SidebarSkeleton() {
    return (
      <div className="flex h-full w-72 flex-col bg-gray-100 p-4">
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-2 h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }
  
  export function ProgressSkeleton() {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-48" />
        <Skeleton className="h-2 w-full" />
      </div>
    )
  }
  
  export function HeatmapSkeleton() {
    return (
      <Skeleton className="h-32 w-full" />
    )
  }
  
  export function StoryCardSkeleton() {
    return (
      <div className="rounded-2xl border border-gray-200 p-6">
        <Skeleton className="mb-2 h-6 w-32" />
        <Skeleton className="mb-4 h-4 w-3/4" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }
  ```
  
  Use in pages with `Suspense` or conditional rendering.
- **Dependencies**: Phase 4 tasks
- **Verification**: No layout shift on load, skeletons appear during fetch
- **Complexity**: Medium
- **Can Parallelize With**: Task 5.5

---

### Task 5.5: Add Error Handling & Boundaries
- **Files**: `src/app/error.tsx`, `src/app/global-error.tsx`, various
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Implement comprehensive error handling:
  ```typescript
  // src/app/error.tsx
  'use client'
  
  import { Button } from '@/components/button'
  import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
  
  export default function Error({
    error,
    reset,
  }: {
    error: Error & { digest?: string }
    reset: () => void
  }) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center p-8">
        <ExclamationTriangleIcon className="mb-4 size-16 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold">문제가 발생했습니다</h2>
        <p className="mb-6 text-center text-gray-500">
          예상치 못한 오류가 발생했습니다.
          <br />
          다시 시도해 주세요.
        </p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    )
  }
  ```
  
  ```typescript
  // src/app/global-error.tsx
  'use client'
  
  export default function GlobalError({
    error,
    reset,
  }: {
    error: Error & { digest?: string }
    reset: () => void
  }) {
    return (
      <html lang="ko">
        <body>
          <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <h2 className="mb-4 text-2xl font-bold">치명적 오류</h2>
            <button
              onClick={reset}
              className="rounded bg-black px-4 py-2 text-white"
            >
              다시 시도
            </button>
          </div>
        </body>
      </html>
    )
  }
  ```
  
  Also add try-catch in Convex actions for AI service errors.
- **Dependencies**: Phase 4 tasks
- **Verification**: Errors caught and displayed gracefully, retry works
- **Complexity**: Medium
- **Can Parallelize With**: Task 5.4

---

### Task 5.6: Visual QA Against Mockups
- **Files**: N/A (verification only)
- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux", "playwright"]`
- **Description**: Compare implemented UI against mockups:
  
  **Checklist:**
  1. Onboarding page (`mockups/onboarding.png`):
     - [ ] Progress indicator (3 segments, first active)
     - [ ] Flag icon
     - [ ] Title/subtitle text exact match
     - [ ] Form fields with labels and placeholders
     - [ ] 2-column grid for bottom fields
     - [ ] X clear buttons on inputs
     - [ ] "여정 설계 →" button styling
     - [ ] Dark theme colors
  
  2. Loading page (`mockups/onboarding-loading.png`):
     - [ ] Same card layout as onboarding
     - [ ] Flag icon
     - [ ] "빌더 여정 설계 중..." text
     - [ ] Subtitle text
     - [ ] Loading animation
  
  3. Dashboard (`mockups/dashboard.png`):
     - [ ] Sidebar width and layout
     - [ ] Search input styling
     - [ ] Course list with colored progress badges
     - [ ] "+ 새 빌더 여정" button
     - [ ] User profile section
     - [ ] Progress percentage (large number)
     - [ ] Level badge
     - [ ] Activity heatmap
     - [ ] Epic navigation tabs
     - [ ] Story card styling
     - [ ] Task card with requirements
  
  Use Playwright for screenshot comparison if desired.
- **Dependencies**: All Phase 4 tasks
- **Verification**: Screenshots match mockups, deviations documented/approved
- **Complexity**: Medium
- **Can Parallelize With**: Task 5.7

---

### Task 5.7: End-to-End Flow Testing
- **Files**: N/A (testing only) or `tests/e2e/*.spec.ts`
- **Category**: `visual-engineering`
- **Skills**: `["playwright"]`
- **Description**: Test complete user flows:
  
  **Test Scenarios:**
  1. **New User Onboarding**
     - Sign up with Clerk
     - Complete onboarding form
     - Wait for course generation
     - Arrive at dashboard
  
  2. **Course Navigation**
     - View course with epics
     - Click through epic tabs
     - View stories and tasks
  
  3. **Task Submission**
     - Open task submission dialog
     - Paste code
     - Submit for review
     - View feedback
     - Verify progress updates
  
  4. **Multiple Courses**
     - Create second course
     - Switch between courses in sidebar
     - Search courses
  
  Mock AI services for testing:
  ```typescript
  // In test setup, intercept API calls
  await page.route('**/omakasem-planner/**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockCurriculumResponse),
    })
  })
  ```
- **Dependencies**: All previous tasks
- **Verification**: All flows complete without errors
- **Complexity**: Complex
- **Can Parallelize With**: Task 5.6

---

### Task 5.8: Build & Type Check Verification
- **Files**: N/A
- **Category**: `unspecified-low`
- **Skills**: `[]`
- **Description**: Final verification:
  ```bash
  # TypeScript check
  npx tsc --noEmit
  
  # ESLint check
  npm run lint
  
  # Build check
  npm run build
  
  # Convex deploy
  npx convex deploy
  ```
  
  **Pass Criteria:**
  - [ ] `tsc --noEmit` exits with 0
  - [ ] `npm run lint` exits with 0 (or only warnings)
  - [ ] `npm run build` completes successfully
  - [ ] `npx convex deploy` succeeds
  - [ ] No runtime errors in browser console
- **Dependencies**: All previous tasks
- **Verification**: CI-ready build passes
- **Complexity**: Simple
- **Can Parallelize With**: None (final gate)

---

## Parallelization Map

### Wave 1 (No Dependencies) - 2 tasks
| Task | Description |
|------|-------------|
| 1.1 | Initialize Convex Project |
| 1.4 | Install Clerk Dependencies |

### Wave 2 (After Wave 1) - 4 tasks
| Task | Description |
|------|-------------|
| 1.2 | Create Environment Configuration |
| 1.3 | Define Convex Schema |
| 1.7 | Create Clerk Middleware |
| 1.8 | Setup Clerk JWT Template |

### Wave 3 (After Wave 2) - 5 tasks
| Task | Description |
|------|-------------|
| 1.5 | Create Convex-Clerk Provider |
| 2.1 | Create User Sync Functions |
| 2.2 | Create Course CRUD Functions |
| 2.3 | Create Epic/Story/Task Functions |
| 2.4 | Create Submission & Activity Functions |

### Wave 4 (After Wave 3) - 12 tasks (MAX PARALLELIZATION)
| Task | Description |
|------|-------------|
| 1.6 | Update Root Layout |
| 2.5 | Create Course Generation Action |
| 2.6 | Create Code Review Action |
| 3.1 | Create Onboarding Layout |
| 3.2 | Create Progress Step Indicator |
| 3.3 | Create Dashboard Sidebar |
| 3.4 | Create Epic Navigation |
| 3.5 | Create Activity Heatmap |
| 3.6 | Create Progress Display |
| 3.7 | Create Story Card |
| 3.8 | Create Task Card |
| 4.7 | Update Auth Pages |

### Wave 5 (After Wave 4) - 3 tasks
| Task | Description |
|------|-------------|
| 3.9 | Create Loading State |
| 3.10 | Create Dashboard Layout |
| 3.11 | Create Code Submission Dialog |

### Wave 6 (After Wave 5) - 6 tasks
| Task | Description |
|------|-------------|
| 4.1 | Implement Onboarding Page |
| 4.2 | Implement Onboarding Loading Page |
| 4.3 | Implement Dashboard Home |
| 4.4 | Implement Course Detail Page |
| 4.5 | Implement Epic Content Section |
| 4.8 | Implement Sidebar with Real Data |

### Wave 7 (After Wave 6) - 4 tasks
| Task | Description |
|------|-------------|
| 4.6 | Implement Task Submission Flow |
| 5.1 | Implement Progress Calculation |
| 5.2 | Add Korean Font Support |
| 5.3 | Implement Dark/Light Mode |

### Wave 8 (After Wave 7) - 4 tasks
| Task | Description |
|------|-------------|
| 5.4 | Add Loading States |
| 5.5 | Add Error Handling |
| 5.6 | Visual QA |
| 5.7 | E2E Testing |

### Wave 9 (Final) - 1 task
| Task | Description |
|------|-------------|
| 5.8 | Build Verification |

---

## Recommended Delegation Strategy

| Category | Skills | Task Types | Task Numbers |
|----------|--------|------------|--------------|
| `unspecified-low` | `[]` | Config, setup, simple tasks | 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 5.5, 5.8 |
| `ultrabrain` | `[]` | Schema design, backend functions, complex logic | 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.1 |
| `visual-engineering` | `["frontend-ui-ux"]` | All UI components, pages | 3.1-3.11, 4.1-4.8, 5.2, 5.3, 5.4 |
| `visual-engineering` | `["frontend-ui-ux", "playwright"]` | QA and testing | 5.6, 5.7 |

---

## Success Criteria

### Must Have (P0)
- [ ] Onboarding flow matches mockup pixel-perfect (dark theme, form fields, button)
- [ ] Loading state displays correctly during course generation
- [ ] Dashboard layout matches mockup (sidebar, content area)
- [ ] Convex schema supports full Course → Epic → Story → Task hierarchy
- [ ] Clerk auth works end-to-end (sign up, sign in, protected routes)
- [ ] Build passes with zero TypeScript errors

### Should Have (P1)
- [ ] AI planner integration generates curriculum from user input
- [ ] AI code reviewer integration grades submissions with feedback
- [ ] Progress tracking is accurate and updates in real-time
- [ ] Activity heatmap displays user activity correctly
- [ ] Korean text renders with proper typography (Pretendard)

### Nice to Have (P2)
- [ ] All E2E flows complete successfully
- [ ] Loading skeletons prevent layout shift
- [ ] Error boundaries provide graceful degradation
- [ ] Mobile responsive design works

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| External AI Services Unavailable | Create mock responses in `convex/actions/` for development/testing. Add retry logic with exponential backoff. |
| Clerk/Convex Integration Issues | Follow exact patterns from official Convex demos (referenced in research). Test auth flow early in Phase 1. |
| Korean Font Rendering Issues | Test font loading early. Have Inter as fallback font. Use CDN option if local fonts problematic. |
| Progress Calculation Complexity | Write helper function with unit tests. Verify with manual calculations on test data. |
| Mockup Interpretation Ambiguity | Document all assumptions. Flag deviations for user review before proceeding. |
| Convex Cold Start Latency | Implement optimistic UI updates. Show skeletons during data fetch. |

---

## Questions for Clarification

Before beginning implementation, please confirm:

1. **AI Service URLs**: Are `omakasem-planner` and `omakasem-code-reviewer` already deployed? What are the actual endpoint URLs and authentication methods (API key, JWT, etc.)?

2. **Level/Rank System**: What are the exact level names and thresholds? I assumed:
   - 비기너 (0-29%)
   - 주니어 (30-49%)
   - 미들 (50-69%)
   - 시니어 (70-89%)
   - 마스터 (90-100%)
   
   Are these correct?

3. **Progress Badge Colors**: Are the colors (orange, pink, green) based on:
   - Progress ranges (green = high, orange = medium, pink = low)?
   - Course categories/types?
   - Something else?

4. **Heatmap Data**: Should the heatmap show:
   - Task completions only?
   - All submissions (including failed)?
   - All activity types (login, submission, completion)?

5. **Mobile Responsiveness**: Are there mobile mockups? If not, should I use:
   - Sidebar as drawer/overlay on mobile?
   - Simplified navigation?
   - Same layout scaled down?

---

## File Structure Summary

After implementation, the project will have this structure:

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── error.tsx                     # Error boundary
│   ├── global-error.tsx              # Global error boundary
│   ├── (auth)/
│   │   ├── layout.tsx                # Dark theme auth layout
│   │   ├── login/page.tsx            # Clerk SignIn
│   │   └── register/page.tsx         # Clerk SignUp
│   ├── (onboarding)/
│   │   ├── layout.tsx                # Dark modal layout
│   │   └── onboarding/
│   │       ├── page.tsx              # Onboarding form
│   │       └── loading/page.tsx      # Generation loading
│   └── (dashboard)/
│       ├── layout.tsx                # Two-column layout
│       ├── page.tsx                  # Dashboard home (redirect)
│       └── courses/
│           └── [courseId]/
│               ├── page.tsx          # Course detail
│               └── epics/
│                   └── [epicId]/
│                       └── page.tsx  # Epic content
├── components/
│   ├── providers/
│   │   └── convex-clerk-provider.tsx
│   ├── progress-steps.tsx
│   ├── dashboard-sidebar.tsx
│   ├── epic-navigation.tsx
│   ├── activity-heatmap.tsx
│   ├── progress-display.tsx
│   ├── story-card.tsx
│   ├── task-card.tsx
│   ├── generation-loading.tsx
│   ├── code-submission-dialog.tsx
│   ├── skeletons.tsx
│   └── [existing Catalyst components...]
├── env.ts
├── middleware.ts
└── styles/
    └── tailwind.css

convex/
├── schema.ts
├── users.ts
├── courses.ts
├── epics.ts
├── stories.ts
├── tasks.ts
├── submissions.ts
├── activities.ts
├── lib/
│   └── progress.ts
└── actions/
    ├── generateCourse.ts
    └── reviewCode.ts
```

---

**Total Tasks: 47**
**Estimated Waves: 9**
**Maximum Parallel Tasks: 12 (Wave 4)**

---
To continue this session: session_id="ses_3eb6097d7ffeRBYSQBMHgRdt4u"