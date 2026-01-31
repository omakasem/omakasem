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
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            실습과 피드백 기반 개발 학습 플랫폼
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
            개발은
            <br />
            <span className="bg-gradient-to-r from-zinc-600 to-zinc-400 bg-clip-text text-transparent">
              문제 해결의 연속
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            진정한 학습은 함수 이름을 외울 때가 아니라,
            <br className="hidden sm:block" />
            작은 문제 풀이를 쌓아갔을 때 나옵니다.
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

      {/* Problem Section - Bootcamp is Doomed */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-500">
              The Inconvenient Truth
            </p>
            <h2 className="mb-4 text-3xl font-bold text-zinc-950 sm:text-4xl dark:text-white">
              Bootcamp is Doomed
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">
              개념적 학습만으로는 개발자가 될 수 없습니다
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Problem 1 */}
            <div className="rounded-2xl border border-red-200 bg-white p-8 dark:border-red-900/50 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                개념만 배우는 강의
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                수백 시간의 영상을 봐도 실제로 코드를 짜면 막막합니다.
                따라치기와 직접 만들기는 완전히 다른 능력입니다.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="rounded-2xl border border-red-200 bg-white p-8 dark:border-red-900/50 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                처참한 취업률
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                수천만 원의 비용, 수개월의 시간을 투자해도
                소수에게만 허락된 영광. 대부분은 포기하거나 다른 길을 찾습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - 양방향 학습 */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-500">
              A Better Way
            </p>
            <h2 className="mb-4 text-3xl font-bold text-zinc-950 sm:text-4xl dark:text-white">
              양방향 학습으로의 전환
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">
              일방적으로 듣기만 하는 학습에서 벗어나,
              직접 만들고 피드백 받는 순환 구조
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                작은 문제부터 시작
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                거창한 프로젝트가 아닌, 15분이면 풀 수 있는
                작은 문제들로 실력을 쌓아갑니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                즉각적인 AI 피드백
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                코드를 제출하면 AI가 즉시 리뷰하고,
                무엇이 잘못됐는지, 어떻게 개선할 수 있는지 알려줍니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-950 dark:text-white">
                명확한 로드맵
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                "다음에 뭘 해야 하지?"라는 고민 없이,
                당신의 목표에 맞춘 맞춤형 학습 경로를 제시합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-950 dark:text-white">
              어떻게 진행되나요?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              간단한 3단계로 나만의 학습 여정을 시작하세요
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: '목표 설정', desc: '만들고 싶은 것과 현재 수준을 알려주세요' },
              { step: '02', title: '문제 풀기', desc: '작은 문제들을 풀며 실력을 쌓아가세요' },
              { step: '03', title: '피드백 받기', desc: 'AI 코드 리뷰로 빠르게 개선점을 파악하세요' },
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
            더 이상 강의만 보고 있지 마세요.
            <br className="hidden sm:block" />
            직접 만들고, 피드백 받고, 성장하세요.
          </p>
          <Button href="/onboarding" color="white" className="px-8 py-3">
            무료로 시작하기
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
              © 2026 Omakasem. 실습과 피드백 기반 개발 학습.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
