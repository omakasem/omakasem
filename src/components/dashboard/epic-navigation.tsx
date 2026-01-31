'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

export interface Epic {
  id: string
  title: string
}

interface EpicNavigationProps {
  epics: Epic[]
  selectedEpicId?: string
  onSelectEpic?: (id: string) => void
  className?: string
}

export function EpicNavigation({ epics, selectedEpicId, onSelectEpic, className }: EpicNavigationProps) {
  const selectedIndex = epics.findIndex((e) => e.id === selectedEpicId)

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      onSelectEpic?.(epics[selectedIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (selectedIndex < epics.length - 1) {
      onSelectEpic?.(epics[selectedIndex + 1].id)
    }
  }

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <button
        onClick={handlePrevious}
        disabled={selectedIndex <= 0}
        className="rounded-lg bg-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-300 hover:text-zinc-950 disabled:opacity-50 disabled:hover:bg-zinc-200 disabled:hover:text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white dark:disabled:hover:bg-zinc-800 dark:disabled:hover:text-zinc-400"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        onClick={handleNext}
        disabled={selectedIndex >= epics.length - 1}
        className="rounded-lg bg-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-300 hover:text-zinc-950 disabled:opacity-50 disabled:hover:bg-zinc-200 disabled:hover:text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white dark:disabled:hover:bg-zinc-800 dark:disabled:hover:text-zinc-400"
      >
        <ChevronRightIcon className="size-5" />
      </button>

      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {epics.map((epic) => (
          <button
            key={epic.id}
            onClick={() => onSelectEpic?.(epic.id)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              epic.id === selectedEpicId
                ? 'bg-zinc-300 text-zinc-950 dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
            )}
          >
            {epic.title}
          </button>
        ))}
      </div>
    </div>
  )
}
