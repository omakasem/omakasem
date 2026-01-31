'use client'

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

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 15L12.5 10L7.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
    <div className={clsx('flex items-center justify-center gap-[8px]', className)}>
      <button
        onClick={handlePrevious}
        disabled={selectedIndex <= 0}
        className="flex size-[48px] shrink-0 items-center justify-center gap-[6px] rounded-full bg-[rgba(245,245,245,0.04)] p-[14px] text-[rgba(245,245,245,0.72)] disabled:opacity-40"
      >
        <ArrowLeftIcon />
      </button>
      <button
        onClick={handleNext}
        disabled={selectedIndex >= epics.length - 1}
        className="flex size-[48px] shrink-0 items-center justify-center gap-[6px] rounded-full bg-[rgba(245,245,245,0.04)] p-[14px] text-[rgba(245,245,245,0.72)] disabled:opacity-40"
      >
        <ArrowRightIcon />
      </button>

      <div className="flex flex-1 items-stretch gap-[4px] overflow-x-auto rounded-full border border-[rgba(164,164,164,0.2)] p-[4px]">
        {epics.map((epic) => (
          <button
            key={epic.id}
            onClick={() => onSelectEpic?.(epic.id)}
            className={clsx(
              'flex flex-1 items-center justify-center gap-[6px] rounded-full px-[14px] py-[8px] text-center text-[16px] leading-[1.5] tracking-[-0.02em] whitespace-nowrap',
              epic.id === selectedEpicId
                ? 'bg-[rgba(245,245,245,0.04)] font-medium text-[#F5F5F5]'
                : 'font-normal text-[rgba(245,245,245,0.4)]'
            )}
          >
            {epic.title}
          </button>
        ))}
      </div>
    </div>
  )
}
