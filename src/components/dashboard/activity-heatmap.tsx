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

function getActivityOpacity(count: number): number {
  if (count === 0) return 0.04
  if (count <= 1) return 0.24
  if (count <= 2) return 0.36
  if (count <= 3) return 0.48
  if (count <= 4) return 0.56
  if (count <= 5) return 0.64
  if (count <= 6) return 0.72
  return 1
}

export function ActivityHeatmap({ data = [], className }: ActivityHeatmapProps) {
  const rows = 7
  const cols = 22
  const totalCells = rows * cols

  const activityMap = new Map(data.map((d) => [d.date, d.count]))

  const today = new Date()
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (totalCells - 1 - index))
    const dateStr = date.toISOString().split('T')[0]
    const count = activityMap.get(dateStr) || 0
    return { date: dateStr, count, opacity: getActivityOpacity(count) }
  })

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
    <div className={clsx('w-full mt-auto', className)}>
      <div className="flex gap-[4px]">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-[4px]">
            {column.map((cell) => (
              <div
                key={cell.date}
                className="size-[14px] rounded-[4px]"
                style={{ backgroundColor: `rgba(245, 245, 245, ${cell.opacity})` }}
                title={`${cell.date}: ${cell.count}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
