export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 max-lg:hidden">
        <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-32 shrink-0">
            <div className="aspect-3/2 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="mt-2 h-5 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
      <div className="mt-12 h-6 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4">
        <div className="flex justify-between border-b border-zinc-950/10 py-4 dark:border-white/10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between border-b border-zinc-950/5 py-4 dark:border-white/5">
            <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
