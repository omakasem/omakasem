# Vibestudy - Agent Knowledge Base

## Stack

- **Framework**: TanStack Start (v1.157+) - React meta-framework with SSR
- **Auth**: Clerk (`@clerk/tanstack-react-start`)
- **Backend**: Convex (`convex`, `@convex-dev/react-query`)
- **Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Runtime**: Bun

## Architecture

```
ClerkProvider
  └─ ConvexProviderWithClerk (client-side auth token refresh)
       └─ TanStack Router (with QueryClient in context)
            └─ Routes (loaders prefetch, components use cached data)
```

## Key Patterns

### 1. Router Setup (`src/router.tsx`)

```tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'

export function getRouter() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!

  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  })
  const convexQueryClient = new ConvexQueryClient(convex)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })
  convexQueryClient.connect(queryClient)

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient, convexClient: convex, convexQueryClient },
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      ),
    }),
    queryClient,
  )
}
```

### 2. Root Route with Clerk + Convex (`src/routes/__root.tsx`)

```tsx
import {
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

// Server function to get Clerk auth + Convex token
const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const authState = await auth()
  const token = await authState.getToken({ template: 'convex' })
  return { userId: authState.userId, token }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  beforeLoad: async (ctx) => {
    const { userId, token } = await fetchClerkAuth()
    // Set auth token for server-side Convex calls
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }
    return { userId, token }
  },
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={context.convexClient} useAuth={useAuth}>
        {/* ... */}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
```

### 3. SSR with Cached Queries (Route Pattern)

```tsx
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/your-route')({
  // Loader runs on SERVER - prefetches and caches data
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(convexQuery(api.tasks.get, {}))
  },
  component: YourComponent,
})

function YourComponent() {
  // Uses cached data from loader - no refetch on hydration
  const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}))
  return <div>{/* render data */}</div>
}
```

**How SSR + caching works:**

1. **Server**: `loader` runs → `ensureQueryData` fetches from Convex → data cached
2. **SSR**: Component renders with cached data → HTML includes data
3. **Client**: QueryClient hydrates → `useSuspenseQuery` finds cache → no refetch
4. **Live**: Convex subscription keeps data fresh after hydration

### 4. Convex Functions (`convex/`)

```tsx
// convex/tasks.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').collect()
  },
})

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    return await ctx.db.insert('tasks', {
      text: args.text,
      isCompleted: false,
      userId: identity?.subject,
    })
  },
})
```

### 5. Clerk Auth Components

```tsx
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/tanstack-react-start'

function AuthExample() {
  return (
    <>
      <SignedIn>
        <UserButton />
        {/* Authenticated content */}
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Sign In</button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
```

## Environment Variables

```env
# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
VITE_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=dev:your-project
```

## Clerk JWT Template Setup

Create a JWT template named `convex` in Clerk Dashboard → JWT Templates with Convex's required claims.

## Commands

```bash
bun run dev          # Start dev server
bun run build        # Build for production
npx convex dev       # Start Convex dev (syncs functions)
npx convex codegen   # Generate types only
```

## File Structure

```
src/
├── routes/
│   ├── __root.tsx      # Root layout, providers, auth
│   └── index.tsx       # Home route with SSR loader
├── router.tsx          # Router + QueryClient + Convex setup
├── start.ts            # Clerk middleware
└── components/         # UI components

convex/
├── _generated/         # Auto-generated types (don't edit)
├── schema.ts           # Database schema
└── tasks.ts            # Query/mutation functions
```

## Important Notes

1. **No vinxi**: TanStack Start dropped vinxi dependency. Use `@tanstack/react-start` imports.
2. **auth()**: Clerk's `auth()` uses global context internally, no request object needed.
3. **SSR Auth**: Use `beforeLoad` + `serverHttpClient?.setAuth(token)` for authenticated server queries.
4. **Live Updates**: Convex subscriptions auto-update after SSR hydration.
