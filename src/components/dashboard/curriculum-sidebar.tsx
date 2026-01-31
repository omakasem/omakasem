'use client'

import { Avatar } from '@/components/avatar'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Input, InputGroup } from '@/components/input'
import { ArrowRightStartOnRectangleIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { BookOpen01Icon, CodeIcon, GridIcon, SourceCodeIcon, SourceCodeSquareIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'

export interface Curriculum {
  id: string
  title: string
  icon?: string
  progress: number
}

interface CurriculumSidebarProps {
  curricula: Curriculum[]
  selectedCurriculumId?: string
  onSelectCurriculum?: (id: string) => void
  onCreateNew?: () => void
  user?: {
    name: string
    email: string
    imageUrl?: string
  }
  onSignOut?: () => void
}

function getProgressColor(progress: number): 'lime' | 'yellow' | 'cyan' | 'zinc' {
  if (progress >= 70) return 'lime'
  if (progress >= 40) return 'cyan'
  if (progress >= 20) return 'yellow'
  return 'zinc'
}

const curriculumIcons: Record<string, typeof CodeIcon> = {
  python: SourceCodeIcon,
  react: GridIcon,
  nestjs: SourceCodeSquareIcon,
  default: BookOpen01Icon,
}

export function CurriculumSidebar({
  curricula,
  selectedCurriculumId,
  onSelectCurriculum,
  onCreateNew,
  user,
  onSignOut,
}: CurriculumSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={CodeIcon} size={28} className="text-zinc-950 dark:text-white" />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <InputGroup>
          <MagnifyingGlassIcon data-slot="icon" className="text-zinc-500" />
          <Input type="search" placeholder="원하는 내용 검색" className="bg-zinc-100 dark:bg-zinc-800" />
          <XMarkIcon data-slot="icon" className="cursor-pointer text-zinc-500 hover:text-zinc-400" />
        </InputGroup>
      </div>

      {/* New Journey Button */}
      <div className="px-4 py-2">
        <Button href="/onboarding" outline className="w-full justify-center">
          <PlusIcon className="size-4" />새 빌더 여정
        </Button>
      </div>

      {/* Curriculum List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <h3 className="mb-2 text-xs font-medium text-zinc-500">빌더 여정들</h3>
        <div className="space-y-1">
          {curricula.map((curriculum) => {
            const IconComponent = curriculumIcons[curriculum.icon || 'default'] || curriculumIcons.default
            return (
              <button
                key={curriculum.id}
                onClick={() => onSelectCurriculum?.(curriculum.id)}
                className={clsx(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selectedCurriculumId === curriculum.id
                    ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white'
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <HugeiconsIcon icon={IconComponent} size={18} className="shrink-0" />
                  <span className="truncate">{curriculum.title}</span>
                </div>
                <Badge color={getProgressColor(curriculum.progress)} className="ml-2 shrink-0">
                  {curriculum.progress}%
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={user.imageUrl} className="size-10" square />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-950 dark:text-white">{user.name}</div>
                <div className="truncate text-xs text-zinc-500">{user.email}</div>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <ArrowRightStartOnRectangleIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
