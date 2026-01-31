import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(convexQuery(api.tasks.get, {}))
  },
  component: App,
})

function App() {
  return (
    <div>
      <SignedIn>
        <div className="flex items-center gap-4 p-4">
          <UserButton />
          <span>You are signed in</span>
        </div>
        <TaskList />
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-2xl font-bold">Welcome to Vibestudy</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
          <div className="flex gap-2">
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="px-4 py-2 border border-input rounded-md"
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}

function TaskList() {
  const { data: tasks } = useSuspenseQuery(convexQuery(api.tasks.get, {}))

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks yet</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className={`p-2 rounded border ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
            >
              {task.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
