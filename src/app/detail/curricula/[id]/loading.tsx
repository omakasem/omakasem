export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="mt-4 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((id) => (
            <div key={id} className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
              <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="mb-2 h-6 w-32 rounded bg-blue-200/50 dark:bg-blue-900/50" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-blue-200/50 dark:bg-blue-900/50" />
            <div className="h-4 w-5/6 rounded bg-blue-200/50 dark:bg-blue-900/50" />
          </div>
        </div>

        <div className="space-y-8">
          {[1, 2].map((epicId) => (
            <div key={epicId}>
              <div className="mb-4 h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-3">
                {[1, 2, 3].map((taskId) => (
                  <div key={taskId} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
                          <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                        <div className="mt-2 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                        <div className="mt-2 h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
