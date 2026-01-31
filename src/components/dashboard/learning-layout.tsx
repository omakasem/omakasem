'use client'

import { NavbarItem } from '@/components/navbar'
import * as Headless from '@headlessui/react'
import { useState } from 'react'
import { CurriculumSidebar, type Curriculum } from './curriculum-sidebar'

function OpenMenuIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
    </svg>
  )
}

function CloseMenuIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

function MobileSidebar({ open, close, children }: { open: boolean; close: () => void; children: React.ReactNode }) {
  return (
    <Headless.Dialog open={open} onClose={close} className="lg:hidden">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <Headless.DialogPanel
        transition
        className="fixed inset-y-0 w-full max-w-80 transition duration-300 ease-in-out data-closed:-translate-x-full"
      >
        <div className="flex h-full flex-col">
          <div className="absolute top-2 right-2">
            <Headless.CloseButton as={NavbarItem} aria-label="Close navigation" className="text-white">
              <CloseMenuIcon />
            </Headless.CloseButton>
          </div>
          {children}
        </div>
      </Headless.DialogPanel>
    </Headless.Dialog>
  )
}

interface LearningLayoutProps {
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
  children: React.ReactNode
}

export function LearningLayout({
  curricula,
  selectedCurriculumId,
  onSelectCurriculum,
  onCreateNew,
  user,
  onSignOut,
  children,
}: LearningLayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false)

  const sidebar = (
    <CurriculumSidebar
      curricula={curricula}
      selectedCurriculumId={selectedCurriculumId}
      onSelectCurriculum={onSelectCurriculum}
      onCreateNew={onCreateNew}
      user={user}
      onSignOut={onSignOut}
    />
  )

  return (
    <div className="relative flex min-h-svh w-full bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar on desktop */}
      <div className="fixed inset-y-0 left-0 w-72 max-lg:hidden">{sidebar}</div>

      {/* Sidebar on mobile */}
      <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
        {sidebar}
      </MobileSidebar>

      {/* Mobile header */}
      <header className="fixed top-0 right-0 left-0 z-10 flex items-center bg-white px-4 py-3 lg:hidden dark:bg-zinc-900">
        <NavbarItem
          onClick={() => setShowSidebar(true)}
          aria-label="Open navigation"
          className="text-zinc-950 dark:text-white"
        >
          <OpenMenuIcon />
        </NavbarItem>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col lg:pl-72">
        <div className="flex-1 overflow-auto p-6 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
