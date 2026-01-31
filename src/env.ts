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
