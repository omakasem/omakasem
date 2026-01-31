import { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-transparent dark:bg-neutral-900 dark:shadow-none">
        {children}
      </div>
    </main>
  )
}
