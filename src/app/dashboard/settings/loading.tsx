export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="my-10 mt-6 h-px bg-zinc-200 dark:bg-zinc-800" />

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="my-10 h-px bg-zinc-100 dark:bg-zinc-900" />
        </div>
      ))}

      <div className="flex justify-end gap-4">
        <div className="h-9 w-16 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}
