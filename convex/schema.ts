import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_clerk_id', ['clerkId']),
  
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
  
  activity_logs: defineTable({
    userId: v.id('users'),
    date: v.string(),
    activityCount: v.number(),
    type: v.union(
      v.literal('task_completed'),
      v.literal('submission'),
      v.literal('login')
    ),
  }).index('by_user_date', ['userId', 'date']),
})
