export default function Loading() {
  return (
    <div className="p-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

      <div className="mb-8 space-y-4">
        <div>
          <div className="mb-1 h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div>
          <div className="mb-1 h-4 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}
