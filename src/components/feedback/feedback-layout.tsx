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
  isHighlighted = false,
  onClick,
}: {
  category: FeedbackCategory
  title: string
  description: string
  isHighlighted?: boolean
  onClick?: () => void
}) {
  const config = categoryConfig[category]

  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-row items-stretch gap-1 self-stretch rounded-[14px] border p-1 text-left transition-all ${
        isHighlighted ? 'border-[rgba(164,164,164,0.72)]' : 'border-[rgba(164,164,164,0.2)]'
      }`}
    >
      <div className="flex flex-1 flex-col gap-2 self-stretch rounded-[10px] bg-[rgba(164,164,164,0.1)] p-3 dark:bg-[rgba(245,245,245,0.04)]">
        <div className="flex flex-row items-center gap-1 self-stretch p-1">
          <Image
            src={config.icon}
            alt=""
            width={14}
            height={14}
            className="max-h-[14px] min-h-[14px] max-w-[14px] min-w-[14px] object-contain opacity-[0.56] invert dark:invert-0"
          />
          <span className="font-pretendard text-xs leading-[1.35] font-normal tracking-[-0.02em] text-[rgba(22,22,22,0.56)] dark:text-[rgba(245,245,245,0.56)]">
            {config.label}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 self-stretch p-1">
          <h4 className="font-pretendard text-base leading-[1.5] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
            {title}
          </h4>
          <p className="font-pretendard text-sm leading-[1.45] font-normal tracking-[-0.02em] text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">
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
        <h3 className="font-pretendard flex-1 text-lg leading-[1.45] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
          {title}
        </h3>
      </div>
      {suggestions.map((s, i) => {
        const globalIndex = startIndex + i
        const isSelected = selectedIndex === globalIndex
        const isFirst = highlightFirst && i === 0

        return (
          <FeedbackCard
            key={`${s.title}-${i}`}
            category={s.category}
            title={s.title}
            description={s.description}
            isHighlighted={isSelected || isFirst}
            onClick={() => onSelect(globalIndex)}
          />
        )
      })}
    </div>
  )
}

export function FeedbackLayout({ taskTitle, repoUrl, branch = 'main', suggestions, onClose }: FeedbackLayoutProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(suggestions.length > 0 ? 0 : null)

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
  }

  const handleNext = () => {
    if (selectedIndex === null) {
      setSelectedIndex(0)
    } else if (selectedIndex < suggestions.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    } else {
      setSelectedIndex(0)
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 lg:flex-row">
      <div className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.72)] shadow-[0px_0px_24px_0px_rgba(22,22,22,0.06)] lg:w-[400px] dark:bg-[rgba(255,255,255,0.04)]">
        <div className="flex flex-1 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="sticky top-0 z-10 flex flex-row items-center gap-2.5 self-stretch bg-[rgba(255,255,255,0.72)] p-5 backdrop-blur-sm dark:bg-[rgba(30,30,30,0.95)]">
            <div className="flex flex-row items-center gap-2">
              <div className="relative size-6">
                <Image src="/icons/ts-logo.svg" alt="" fill className="object-contain" />
              </div>
              <span className="font-pretendard text-base leading-[1.5] font-normal tracking-[-0.02em] text-[rgba(22,22,22,0.72)] dark:text-[rgba(245,245,245,0.72)]">
                {taskTitle}
              </span>
            </div>
            <Image
              src="/icons/arrow-forward.svg"
              alt=""
              width={16}
              height={16}
              className="opacity-[0.72] invert dark:invert-0"
            />
            <div className="flex flex-row items-center gap-2">
              <Image src="/icons/wand-shine.svg" alt="" width={24} height={24} className="invert dark:invert-0" />
              <span className="font-pretendard text-base leading-[1.5] font-medium tracking-[-0.02em] text-[#161616] dark:text-[#F5F5F5]">
                채점 후 피드백
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-10 px-5 pt-2 pb-24">
            {highPriority.length > 0 && (
              <FeedbackSection
                title="우선순위 높은 피드백"
                suggestions={highPriority}
                selectedIndex={selectedIndex}
                startIndex={0}
                onSelect={setSelectedIndex}
                highlightFirst={selectedIndex === null}
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
        </div>

        <div className="absolute bottom-5 left-1/2 z-10 flex w-[220px] -translate-x-1/2 flex-row items-center gap-1 rounded-full border border-[rgba(164,164,164,0.2)] bg-white p-1 shadow-[0px_0px_24px_0px_rgba(22,22,22,0.06)] backdrop-blur-[16px] dark:bg-[#161616]">
          <button
            onClick={onClose}
            className="flex flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-[#161616] px-[12px] py-3 dark:bg-[#F5F5F5]"
          >
            <Image
              src="/icons/close.svg"
              alt=""
              width={20}
              height={20}
              className="invert dark:invert-0"
              style={{ height: 12, width: 12, maxWidth: 12, maxHeight: 12 }}
            />
            <span className="font-pretendard text-sm leading-[1.45] font-medium tracking-[-0.02em] whitespace-nowrap text-[#F5F5F5] dark:text-[#161616]">
              피드백 종료
            </span>
          </button>
          <div className="flex flex-row items-center gap-1">
            <button
              onClick={handlePrevious}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  className="stroke-[#161616] dark:stroke-[#F5F5F5]"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  className="stroke-[#161616] dark:stroke-[#F5F5F5]"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[400px] flex-1 lg:min-h-0">
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
