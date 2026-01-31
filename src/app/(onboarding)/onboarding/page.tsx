'use client'

import { ProgressSteps } from '@/components/progress-steps'
import { ArrowRight, Flag, Loader2 } from 'lucide-react'
import { useActionState } from 'react'
import { createSession, type CreateSessionState } from './actions'

const initialState: CreateSessionState = {}

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(createSession, initialState)

  return (
    <div className="space-y-8">
      <ProgressSteps currentStep={1} />

      <Flag className="h-8 w-8 text-zinc-900 dark:text-white" strokeWidth={1.5} />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">나만의 빌더 여정 시작하기</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          빌드할 주제를 기반으로 당신에게 맞는 빌드 여정을 설계합니다.
        </p>
      </div>

      {state.error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            주제 제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="주제 제목을 입력해주세요"
            className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
            disabled={isPending}
          />
          {state.fieldErrors?.title && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            주제 한 줄 설명
          </label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="주제에 대한 설명을 한 줄 이내로 간단히 입력해주세요"
            className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
            disabled={isPending}
          />
          {state.fieldErrors?.description && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.description[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="totalWeeks" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              총 주차
            </label>
            <input
              id="totalWeeks"
              name="totalWeeks"
              type="number"
              min="1"
              max="52"
              placeholder="예: 15"
              className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
              disabled={isPending}
            />
            {state.fieldErrors?.totalWeeks && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.totalWeeks[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="weeklyHours" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              한 주당 투자 가능 시간
            </label>
            <input
              id="weeklyHours"
              name="weeklyHours"
              type="number"
              min="1"
              max="40"
              placeholder="예: 32"
              className="h-14 w-full rounded-xl bg-zinc-100 px-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-white"
              disabled={isPending}
            />
            {state.fieldErrors?.weeklyHours && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.fieldErrors.weeklyHours[0]}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              여정 설계 중...
            </>
          ) : (
            <>
              여정 설계
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
