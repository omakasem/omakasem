import { Button } from '@/components/button'
import { Logo } from './logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold text-zinc-950 dark:text-white">오마카쌤</span>
          </div>
          <div className="flex items-center gap-4">
            <Button href="/onboarding" color="dark/zinc">
              시작하기
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-500"></span>
            AI 기반 맞춤형 개발자 교육 플랫폼
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
            당신만을 위한
            <br />
            <span className="bg-gradient-to-r from-zinc-600 to-zinc-400 bg-clip-text text-transparent">
              빌더 여정
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            AI가 분석하는 맞춤형 커리큘럼으로 실무 중심의 개발 역량을 키워보세요.
            GitHub 기반 과제 제출과 AI 코드 리뷰로 실력을 검증받으세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/onboarding" color="zinc" className="px-8 py-3">
              무료로 시작하기
            </Button>
            <Button href="/dashboard" outline className="px-8 py-3">
              대시보드 보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-950 dark:text-white">
              왜 오마카쌤인가요?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              개발자를 위한, 개발자에 의한 교육 플랫폼
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-500/10">
                <svg className="h-6 w-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                AI 맞춤형 커리큘럼
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                당신의 목표와 현재 수준을 분석하여 최적의 학습 경로를 설계합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-500/10">
                <svg className="h-6 w-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                GitHub 기반 과제
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                실제 개발 환경과 동일하게 GitHub 커밋으로 과제를 제출하고 관리합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-500/10">
                <svg className="h-6 w-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                AI 코드 리뷰
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                제출한 코드를 AI가 분석하고 개선점과 피드백을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-950 dark:text-white">
              어떻게 진행되나요?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              간단한 4단계로 나만의 학습 여정을 시작하세요
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: '01', title: '목표 설정', desc: '만들고 싶은 것과 학습 목표를 알려주세요' },
              { step: '02', title: 'AI 분석', desc: 'AI가 최적의 학습 경로를 설계합니다' },
              { step: '03', title: '과제 수행', desc: 'GitHub으로 과제를 제출하고 피드백을 받으세요' },
              { step: '04', title: '성장 확인', desc: '대시보드에서 학습 진행 상황을 확인하세요' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-950 dark:bg-zinc-800 dark:text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-zinc-950 py-24 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            지금 바로 시작하세요
          </h2>
          <p className="mb-8 text-zinc-400">
            GitHub 계정만 있으면 무료로 시작할 수 있습니다
          </p>
          <Button href="/onboarding" color="white" className="px-8 py-3">
            GitHub으로 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Logo size={28} />
              <span className="text-lg font-bold text-zinc-950 dark:text-white">오마카쌤</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © 2026 Omakasem. AI-Powered Developer Education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
