'use client'

import clsx from 'clsx'

interface ActivityData {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  data?: ActivityData[]
  className?: string
}

function getActivityLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

function getActivityColor(level: number): string {
  // Dual theme: light mode uses darker shades for more activity, dark mode uses lighter shades
  const colors = [
    'bg-zinc-200 dark:bg-zinc-700/40', // 0 - no activity
    'bg-zinc-300 dark:bg-zinc-500/60', // 1 - low
    'bg-zinc-400 dark:bg-zinc-400', // 2 - medium-low
    'bg-zinc-500 dark:bg-zinc-300', // 3 - medium-high
    'bg-zinc-600 dark:bg-zinc-200', // 4 - high
  ]
  return colors[level] || colors[0]
}

export function ActivityHeatmap({ data = [], className }: ActivityHeatmapProps) {
  // Fixed grid: 7 rows × 22 columns to match mockup
  const rows = 7
  const cols = 22
  const totalCells = rows * cols

  // Create a map of date to count for quick lookup
  const activityMap = new Map(data.map((d) => [d.date, d.count]))

  // Generate dates for the grid (going backwards from today)
  const today = new Date()
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (totalCells - 1 - index))
    const dateStr = date.toISOString().split('T')[0]
    const count = activityMap.get(dateStr) || 0
    return { date: dateStr, count, level: getActivityLevel(count) }
  })

  // Create grid by columns (each column = 7 days)
  const columns: (typeof cells)[] = []
  for (let col = 0; col < cols; col++) {
    const column: typeof cells = []
    for (let row = 0; row < rows; row++) {
      const idx = col * rows + row
      if (idx < cells.length) {
        column.push(cells[idx])
      }
    }
    columns.push(column)
  }

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex gap-1.5">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1.5">
            {column.map((cell) => (
              <div
                key={cell.date}
                className={clsx('size-3 rounded-[3px]', getActivityColor(cell.level))}
                title={`${cell.date}: ${cell.count}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
