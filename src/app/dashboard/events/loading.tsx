export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <div className="h-8 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="h-10 flex-1 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="h-10 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <ul className="mt-10">
        {[1, 2, 3, 4, 5].map((index) => (
          <li key={index}>
            {index > 0 && <div className="h-px w-full bg-zinc-950/5 dark:bg-white/5" />}
            <div className="flex items-center justify-between">
              <div className="flex w-full gap-6 py-6">
                <div className="w-32 shrink-0">
                  <div className="aspect-3/2 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 rounded-full bg-zinc-200 max-sm:hidden dark:bg-zinc-800" />
                <div className="size-6 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
