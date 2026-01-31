export default function Loading() {
  return (
    <div className="rounded-[16px] bg-[rgba(255,255,255,0.72)] shadow-[0_0_24px_0_rgba(22,22,22,0.06)] dark:bg-[rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-[10px] p-[20px]">
        <div className="size-[24px] animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
        <div className="h-[24px] w-48 animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
      </div>

      <div className="flex flex-col gap-[40px] px-[20px] pt-[8px] pb-[20px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px] p-[4px]">
              <div className="h-[26px] w-32 animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
              <div className="h-[48px] w-24 animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
            </div>
            <div className="h-[42px] w-[140px] animate-pulse rounded-full bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
          </div>

          <div className="flex flex-col gap-[4px] rounded-[14px] border border-[rgba(164,164,164,0.2)] p-[4px]">
            <div className="flex items-center gap-[4px]">
              <div className="h-[180px] w-[160px] shrink-0 animate-pulse rounded-[10px] bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />

              <div className="flex flex-1 flex-col gap-[16px] self-stretch rounded-[10px] bg-[rgba(164,164,164,0.1)] p-[16px] dark:bg-[rgba(245,245,245,0.04)]">
                <div className="h-[24px] w-full animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
                <div className="flex-1 animate-pulse rounded bg-[rgba(22,22,22,0.1)] opacity-50 dark:bg-[rgba(245,245,245,0.1)]" />
              </div>
            </div>

            <div className="flex flex-col gap-[12px] rounded-[10px] bg-[rgba(164,164,164,0.1)] p-[20px] dark:bg-[rgba(245,245,245,0.04)]">
              <div className="h-[20px] w-32 animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
              <div className="space-y-2">
                <div className="h-[16px] w-full animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
                <div className="h-[16px] w-2/3 animate-pulse rounded bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[32px] w-[100px] shrink-0 animate-pulse rounded-full bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]"
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[200px] w-full animate-pulse rounded-[16px] bg-[rgba(22,22,22,0.1)] dark:bg-[rgba(245,245,245,0.1)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
