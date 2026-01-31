'use client'

import { Avatar } from '@/components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import type { CurriculumListItem } from '@/lib/types'
import { useClerk, useUser } from '@clerk/nextjs'
import {
  ArrowRightStartOnRectangleIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import { BookOpen01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

const curriculumIcons: Record<string, string> = {
  python: '/icons/python.svg',
  'react-native': '/icons/react-native.svg',
  nestjs: '/icons/nestjs.svg',
  swiftui: '/icons/swiftui.svg',
  'thread-api': '/icons/thread-api.svg',
  'claude-agent': '/icons/claude-agent.svg',
  replit: '/icons/replit.svg',
  default: '/icons/code.svg',
}

function getProgressBadgeStyle(progress: number): { bg: string; text: string } {
  if (progress >= 70) return { bg: 'bg-[#B931EC]', text: 'text-[#F7F4F9]' }
  if (progress >= 40) return { bg: 'bg-[#028AC7]', text: 'text-[#F0F6FA]' }
  return { bg: 'bg-[#00AF6D]', text: 'text-[#F1F7F3]' }
}

function AccountDropdownMenu({ anchor, onSignOut }: { anchor: 'top start' | 'bottom end'; onSignOut: () => void }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="#">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={onSignOut}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

interface ApplicationLayoutProps {
  curricula: CurriculumListItem[]
  selectedCurriculumId?: string | null
  children: React.ReactNode
}

export function ApplicationLayout({ curricula, selectedCurriculumId, children }: ApplicationLayoutProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  const urlCurriculumId = searchParams.get('curriculum') || searchParams.get('curriculumId')
  const activeCurriculumId = selectedCurriculumId ?? urlCurriculumId ?? curricula[0]?.id

  const handleSignOut = () => {
    signOut({ redirectUrl: '/sign-in' })
  }

  const userDisplayName = `${user?.firstName || user?.username || '빌더'} 빌더`
  const userEmail = user?.primaryEmailAddress?.emailAddress || ''
  const userImageUrl = user?.imageUrl

  const allCurricula = curricula

  const filteredCurricula = useMemo(() => {
    if (!searchQuery.trim()) return allCurricula
    const query = searchQuery.toLowerCase()
    return allCurricula.filter((c) => c.title.toLowerCase().includes(query))
  }, [allCurricula, searchQuery])

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src={userImageUrl} square />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" onSignOut={handleSignOut} />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar className="!border-0 !bg-transparent">
          <SidebarHeader className="!border-0 !p-0">
            <div className="p-4">
              <Image src="/light.svg" alt="Omakasem" width={36} height={36} className="dark:hidden" />
              <Image src="/dark.svg" alt="Omakasem" width={36} height={36} className="hidden dark:block" />
            </div>

            <div className="px-4">
              <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                <MagnifyingGlassIcon className="size-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="원하는 내용 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-zinc-500 placeholder-zinc-500 outline-none dark:text-zinc-400"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="focus:outline-none">
                    <XMarkIcon className="size-4 cursor-pointer text-zinc-400 hover:text-zinc-300" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 px-4">
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                <PlusIcon className="size-4" />새 빌더 여정
              </Link>
            </div>
          </SidebarHeader>

          <SidebarBody className="!p-0">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h3 className="mb-2 px-1 text-xs text-zinc-400/60 dark:text-zinc-500/60">
                빌더 여정들{searchQuery && ` (${filteredCurricula.length})`}
              </h3>
              <div className="space-y-1">
                {filteredCurricula.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-zinc-500">검색 결과가 없습니다</div>
                ) : (
                  filteredCurricula.map((curriculum) => {
                    const iconKey = curriculum.icon_id || curriculum.icon
                    const iconPath = iconKey ? curriculumIcons[iconKey] : null
                    const isSelected = !searchQuery && curriculum.id === activeCurriculumId
                    const badgeStyle = getProgressBadgeStyle(curriculum.progress)

                    return (
                      <Link
                        key={curriculum.id}
                        href={`/dashboard?curriculum=${curriculum.id}`}
                        className={clsx(
                          'flex w-full items-center gap-2 rounded-full px-3 py-3 text-sm transition-colors',
                          isSelected
                            ? 'bg-white/[0.04] font-medium text-zinc-100 shadow-[0_0_24px_0_rgba(22,22,22,0.06)]'
                            : 'text-zinc-100/70 hover:bg-white/[0.02]'
                        )}
                      >
                        {iconPath ? (
                          <Image src={iconPath} alt="" width={20} height={20} className="shrink-0 opacity-70" />
                        ) : (
                          <HugeiconsIcon icon={BookOpen01Icon} size={20} className="shrink-0 opacity-70" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{curriculum.title}</span>
                        <span
                          className={clsx(
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[11px]',
                            badgeStyle.bg,
                            badgeStyle.text
                          )}
                        >
                          {curriculum.progress}%
                        </span>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </SidebarBody>

          <SidebarFooter className="!border-0 !p-4 max-lg:hidden">
            <div className="flex items-center gap-3">
              <Avatar src={userImageUrl} className="size-9" square alt="" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">{userDisplayName}</div>
                <div className="truncate text-xs text-zinc-500 dark:text-zinc-500">{userEmail}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              >
                <ArrowRightStartOnRectangleIcon className="size-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
