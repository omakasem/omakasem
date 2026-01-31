'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CodeViewerV2 } from './code-viewer-v2'
import type { Suggestion } from './types'

type FeedbackCategory = 'security' | 'code_quality' | 'architecture' | 'performance' | 'product_idea' | 'hardening'

interface FeedbackLayoutProps {
  taskTitle: string
  repoUrl: string
  branch?: string
  suggestions: Suggestion[]
  onClose?: () => void
  onPrevious?: () => void
  onNext?: () => void
}

const categoryConfig: Record<FeedbackCategory, { label: string; icon: string }> = {
  security: { label: '보안', icon: '/icons/shield.svg' },
  code_quality: { label: '코드 퀄리티', icon: '/icons/code.svg' },
  architecture: { label: '아키텍쳐', icon: '/icons/architecture.svg' },
  performance: { label: '성능', icon: '/icons/code.svg' },
  product_idea: { label: '제품 아이디어', icon: '/icons/wand-shine.svg' },
  hardening: { label: '강화', icon: '/icons/shield.svg' },
}

function FeedbackCard({
  category,
  title,
  description,
  isFirst = false,
  isSelected = false,
  onClick,
}: {
  category: FeedbackCategory
  title: string
  description: string
  isFirst?: boolean
  isSelected?: boolean
  onClick?: () => void
}) {
  const config = categoryConfig[category]

  return (
    <button
      onClick={onClick}
      className="flex w-full flex-row items-stretch gap-1 self-stretch rounded-[14px] p-1 text-left transition-all"
      style={{
        border: isSelected
          ? '1px solid rgba(164, 164, 164, 0.72)'
          : isFirst
            ? '1px solid rgba(164, 164, 164, 0.72)'
            : '1px solid rgba(164, 164, 164, 0.2)',
      }}
    >
      <div
        className="flex flex-1 flex-col gap-2 self-stretch rounded-[10px] p-3"
        style={{ background: 'rgba(245, 245, 245, 0.04)' }}
      >
        <div className="flex flex-row items-center gap-1 self-stretch p-1">
          <Image src={config.icon} alt="" width={16} height={16} className="opacity-56" />
          <span
            className="text-xs leading-[1.35] font-normal"
            style={{ color: 'rgba(245, 245, 245, 0.56)', letterSpacing: '-0.02em' }}
          >
            {config.label}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 self-stretch p-1">
          <h4 className="text-base leading-[1.5] font-medium" style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}>
            {title}
          </h4>
          <p
            className="text-sm leading-[1.45] font-normal"
            style={{ color: 'rgba(245, 245, 245, 0.72)', letterSpacing: '-0.02em' }}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

function FeedbackSection({
  title,
  suggestions,
  selectedIndex,
  startIndex,
  onSelect,
  highlightFirst = false,
}: {
  title: string
  suggestions: Suggestion[]
  selectedIndex: number | null
  startIndex: number
  onSelect: (index: number) => void
  highlightFirst?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 self-stretch">
      <div className="flex flex-row items-stretch gap-0.5 self-stretch p-1">
        <h3
          className="flex-1 text-lg leading-[1.45] font-medium"
          style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}
        >
          {title}
        </h3>
      </div>
      {suggestions.map((s, i) => {
        const globalIndex = startIndex + i
        return (
          <FeedbackCard
            key={`${s.title}-${i}`}
            category={s.category}
            title={s.title}
            description={s.description}
            isFirst={highlightFirst && i === 0}
            isSelected={selectedIndex === globalIndex}
            onClick={() => onSelect(globalIndex)}
          />
        )
      })}
    </div>
  )
}

export function FeedbackLayout({
  taskTitle,
  repoUrl,
  branch = 'main',
  suggestions,
  onClose,
  onPrevious,
  onNext,
}: FeedbackLayoutProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const highPriority = suggestions.filter((s) => s.priority === 'high')
  const mediumPriority = suggestions.filter((s) => s.priority === 'medium')
  const lowPriority = suggestions.filter((s) => s.priority === 'low')

  const selectedSuggestion = selectedIndex !== null ? suggestions[selectedIndex] : null

  const handlePrevious = () => {
    if (selectedIndex === null) {
      setSelectedIndex(suggestions.length - 1)
    } else if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    } else {
      setSelectedIndex(suggestions.length - 1)
    }
    onPrevious?.()
  }

  const handleNext = () => {
    if (selectedIndex === null) {
      setSelectedIndex(0)
    } else if (selectedIndex < suggestions.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    } else {
      setSelectedIndex(0)
    }
    onNext?.()
  }

  return (
    <div className="flex h-full w-full flex-row gap-4">
      <div
        className="flex w-[400px] shrink-0 flex-col rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          boxShadow: '0px 0px 24px 0px rgba(22, 22, 22, 0.06)',
        }}
      >
        <div className="flex flex-row items-center gap-2.5 self-stretch p-5">
          <div className="flex flex-row items-center gap-2">
            <div className="relative size-6">
              <Image src="/icons/ts-logo.svg" alt="" fill className="object-contain" />
            </div>
            <span
              className="text-base leading-[1.5] font-normal"
              style={{ color: 'rgba(245, 245, 245, 0.72)', letterSpacing: '-0.02em' }}
            >
              {taskTitle}
            </span>
          </div>
          <Image src="/icons/arrow-forward.svg" alt="" width={16} height={16} className="opacity-72" />
          <div className="flex flex-row items-center gap-2">
            <Image src="/icons/wand-shine.svg" alt="" width={24} height={24} />
            <span
              className="text-base leading-[1.5] font-medium"
              style={{ color: '#F5F5F5', letterSpacing: '-0.02em' }}
            >
              채점 후 피드백
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col gap-10 overflow-y-auto px-5 pt-2 pb-24">
          {highPriority.length > 0 && (
            <FeedbackSection
              title="우선순위 높은 피드백"
              suggestions={highPriority}
              selectedIndex={selectedIndex}
              startIndex={0}
              onSelect={setSelectedIndex}
              highlightFirst={true}
            />
          )}

          {mediumPriority.length > 0 && (
            <FeedbackSection
              title="우선순위 중간 피드백"
              suggestions={mediumPriority}
              selectedIndex={selectedIndex}
              startIndex={highPriority.length}
              onSelect={setSelectedIndex}
            />
          )}

          {lowPriority.length > 0 && (
            <FeedbackSection
              title="우선순위 낮은 피드백"
              suggestions={lowPriority}
              selectedIndex={selectedIndex}
              startIndex={highPriority.length + mediumPriority.length}
              onSelect={setSelectedIndex}
            />
          )}
        </div>

        <div
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-row items-center gap-1 rounded-full p-1"
          style={{
            background: '#161616',
            border: '1px solid rgba(164, 164, 164, 0.2)',
            boxShadow: '0px 0px 24px 0px rgba(22, 22, 22, 0.06)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <button
            onClick={onClose}
            className="flex flex-row items-center justify-center gap-1.5 rounded-full px-3 py-3"
            style={{ background: '#F5F5F5' }}
          >
            <Image src="/icons/close.svg" alt="" width={20} height={20} />
            <span className="text-sm leading-[1.45] font-medium" style={{ color: '#161616', letterSpacing: '-0.02em' }}>
              피드백 종료
            </span>
          </button>
          <div className="flex flex-row items-center gap-1">
            <button
              onClick={handlePrevious}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#F5F5F5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="#F5F5F5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <CodeViewerV2
          repoUrl={repoUrl}
          file={selectedSuggestion?.file}
          highlightLine={selectedSuggestion?.line}
          branch={branch}
          tooltip={
            selectedSuggestion?.line
              ? {
                  line: selectedSuggestion.line,
                  message: selectedSuggestion.rationale || selectedSuggestion.description,
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
