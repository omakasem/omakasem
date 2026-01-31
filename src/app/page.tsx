import Image from 'next/image'

import { Button } from '@/components/button'

import { Logo } from './logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-lg font-bold text-zinc-950 md:text-xl dark:text-white">오마카쌤</span>
          </div>
          <Button href="/onboarding" color="dark/zinc">
            시작하기
          </Button>
        </div>
      </nav>

      <main className="flex flex-col items-center px-4 pt-16 md:px-5 md:pt-20">
        <div className="flex w-full max-w-[1400px] flex-col gap-8 py-12 md:gap-12 md:py-16 lg:gap-[72px] lg:py-[100px]">
          <section className="flex flex-col gap-3 rounded-2xl bg-[#F5F5F5] p-3 md:gap-4 md:p-4 lg:h-[630px] dark:bg-zinc-900">
            <div className="flex h-full flex-col gap-3 md:gap-4 lg:flex-row">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-[0_0_16px_rgba(22,22,22,0.06)] lg:aspect-auto lg:h-full lg:w-1/2 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <Image
                  src="/landing/landing-hero-1.png"
                  alt="AI 가이드와 함께하는 개발 공부"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex flex-col justify-center gap-3 rounded-xl bg-white/72 p-6 shadow-[0_0_16px_rgba(22,22,22,0.06)] md:gap-4 md:p-8 lg:h-full lg:w-1/2 lg:p-10 dark:bg-white/8 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <div className="relative size-12 md:size-14 lg:size-16">
                  <Image src="/landing/icon-flag.svg" alt="" fill className="dark:invert" />
                </div>

                <h1 className="text-2xl leading-tight font-semibold tracking-tight text-[#161616] md:text-3xl lg:text-[36px] dark:text-[#F5F5F5]">
                  험난한 개발 공부,
                  <br />
                  AI 가이드와 함께하세요
                </h1>

                <p className="text-sm leading-relaxed tracking-tight text-[rgba(22,22,22,0.72)] md:text-base lg:text-lg dark:text-[rgba(245,245,245,0.72)]">
                  개발 공부, 어디서부터 시작해야 할 지 막막하시죠?
                  <span className="hidden md:inline">
                    <br />
                    <br />
                  </span>
                  <span className="md:hidden"> </span>
                  오마카셈의 AI 튜터가 나만을 위해 엄선한 코스를 즐겨보세요. 실제로 수행 가능한 테스크를 통해 점진적으로
                  발전할 수 있는 커리큘럼을 제공합니다.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl bg-[#F5F5F5] p-3 md:gap-4 md:p-4 lg:h-[630px] dark:bg-zinc-900">
            <div className="flex flex-1 flex-col gap-3 md:gap-4 lg:flex-row">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-[0_0_16px_rgba(22,22,22,0.06)] lg:aspect-auto lg:h-full lg:w-1/2 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <Image src="/landing/landing-hero-2.png" alt="탄탄한 커리큘럼" fill className="object-cover" priority />
              </div>

              <div className="flex flex-col justify-center gap-3 rounded-xl bg-white/72 p-6 shadow-[0_0_16px_rgba(22,22,22,0.06)] md:gap-4 md:p-8 lg:h-full lg:w-1/2 lg:p-10 dark:bg-white/8 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <div className="relative size-12 md:size-14 lg:size-16">
                  <Image src="/landing/icon-donut.svg" alt="" fill className="dark:invert" />
                </div>

                <h2 className="text-2xl leading-tight font-semibold tracking-tight text-[#161616] md:text-3xl lg:text-[36px] dark:text-[#F5F5F5]">
                  Epic, Story, Task
                  <br />
                  탄탄한 커리큘럼을 경험하세요
                </h2>

                <p className="text-sm leading-relaxed tracking-tight text-[rgba(22,22,22,0.72)] md:text-base lg:text-lg dark:text-[rgba(245,245,245,0.72)]">
                  오마카쌤의 AI Agent는 검증 가능한 작은 목표부터 시작해, 한 단계씩 성취할 수 있도록 Epic – Story – Task
                  구조의 커리큘럼을 설계합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              <div className="relative flex flex-col gap-1 overflow-hidden rounded-xl p-5 shadow-[0_0_16px_rgba(22,22,22,0.06)] md:p-6 lg:p-7 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <Image src="/landing/landing-epic-bg.png" alt="" fill className="object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-white/72 dark:bg-zinc-900/80" />
                <div className="relative z-10 flex items-center gap-2">
                  <div className="relative size-7 md:size-8 lg:size-9">
                    <Image src="/landing/icon-kid-star.svg" alt="" fill className="dark:invert" />
                  </div>
                  <span className="text-2xl leading-tight font-medium tracking-tight text-[#161616] md:text-[26px] lg:text-[28px] dark:text-[#F5F5F5]">
                    Epic
                  </span>
                </div>
                <p className="relative z-10 text-sm leading-relaxed tracking-tight text-[rgba(22,22,22,0.72)] md:text-[15px] dark:text-[rgba(245,245,245,0.72)]">
                  큰 청크를 배울 수 있는 학습의 단원
                </p>
                <p className="relative z-10 text-xs leading-relaxed tracking-tight text-[rgba(22,22,22,0.56)] md:text-[13px] dark:text-[rgba(245,245,245,0.56)]">
                  예) LLM 연결해서 워크플로우를 만들기
                </p>
              </div>

              <div className="relative flex flex-col gap-1 overflow-hidden rounded-xl p-5 shadow-[0_0_16px_rgba(22,22,22,0.06)] md:p-6 lg:p-7 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <Image
                  src="/landing/landing-story-bg-1b9a3f.png"
                  alt=""
                  fill
                  className="object-cover"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-white/72 dark:bg-zinc-900/80" />
                <div className="relative z-10 flex items-center gap-2">
                  <div className="relative size-7 md:size-8 lg:size-9">
                    <Image src="/landing/icon-auto-stories.svg" alt="" fill className="dark:invert" />
                  </div>
                  <span className="text-2xl leading-tight font-medium tracking-tight text-[#161616] md:text-[26px] lg:text-[28px] dark:text-[#F5F5F5]">
                    Story
                  </span>
                </div>
                <p className="relative z-10 text-sm leading-relaxed tracking-tight text-[rgba(22,22,22,0.72)] md:text-[15px] dark:text-[rgba(245,245,245,0.72)]">
                  논리적으로 구분 가능한 학습의 단위
                </p>
                <p className="relative z-10 text-xs leading-relaxed tracking-tight text-[rgba(22,22,22,0.56)] md:text-[13px] dark:text-[rgba(245,245,245,0.56)]">
                  예) Structured Output 이해하기
                </p>
              </div>

              <div className="relative flex flex-col gap-1 overflow-hidden rounded-xl p-5 shadow-[0_0_16px_rgba(22,22,22,0.06)] md:p-6 lg:p-7 dark:shadow-[0_0_16px_rgba(0,0,0,0.3)]">
                <Image src="/landing/landing-task-bg.png" alt="" fill className="object-cover" aria-hidden="true" />
                <div className="absolute inset-0 bg-white/72 dark:bg-zinc-900/80" />
                <div className="relative z-10 flex items-center gap-2">
                  <div className="relative size-7 md:size-8 lg:size-9">
                    <Image src="/landing/icon-assignment.svg" alt="" fill className="dark:invert" />
                  </div>
                  <span className="text-2xl leading-tight font-medium tracking-tight text-[#161616] md:text-[26px] lg:text-[28px] dark:text-[#F5F5F5]">
                    Task
                  </span>
                </div>
                <p className="relative z-10 text-sm leading-relaxed tracking-tight text-[rgba(22,22,22,0.72)] md:text-[15px] dark:text-[rgba(245,245,245,0.72)]">
                  명확한 피드백이 제공되는 액션의 단위
                </p>
                <p className="relative z-10 text-xs leading-relaxed tracking-tight text-[rgba(22,22,22,0.56)] md:text-[13px] dark:text-[rgba(245,245,245,0.56)]">
                  예) Pydantic 모델로 인터페이스를 만드세요
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section className="border-t border-zinc-200 bg-zinc-950 py-16 md:py-20 lg:py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-5">
          <h2 className="mb-3 text-2xl font-bold text-white md:mb-4 md:text-3xl">나만의 AI 학습 오마카세</h2>
          <p className="mb-6 text-sm leading-relaxed text-zinc-400 md:mb-8 md:text-base">
            개념을 쪼개서, 소화해낼 수 있는 실습 단위로.
            <br />
            답을 알려주지 않고, 답을 찾아가게 하는 24/7 상주하는 AI Tutor.
          </p>
          <Button href="/onboarding" color="white" className="px-6 py-2.5 md:px-8 md:py-3">
            무료로 시작하기
          </Button>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white py-8 md:py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 md:px-5">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:gap-4">
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="text-base font-bold text-zinc-950 md:text-lg dark:text-white">오마카쌤</span>
            </div>
            <p className="text-xs text-zinc-500 md:text-sm dark:text-zinc-400">
              © 2026 Omakasem. 실습과 피드백 기반 개발 학습.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
