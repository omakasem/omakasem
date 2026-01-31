import { z } from "zod";

const serverEnvSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_JWT_ISSUER_DOMAIN: z.string().min(1),
  CONVEX_DEPLOYMENT: z.string().min(1),
});

export const serverEnv = serverEnvSchema.parse({
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
  CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
});
