import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/components/component-example'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <SignedIn>
        <div className="flex items-center gap-4 p-4">
          <UserButton />
          <span>You are signed in</span>
        </div>
        <ComponentExample />
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
