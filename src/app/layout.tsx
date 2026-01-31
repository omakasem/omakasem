import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: {
    template: '%s - 오마카쌤',
    default: '오마카쌤 | AI 맞춤형 개발자 교육 플랫폼',
  },
  description: 'AI가 설계하는 맞춤형 커리큘럼으로 실무 중심의 개발 역량을 키워보세요. GitHub 기반 과제 제출과 AI 코드 리뷰로 실력을 검증받으세요.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="ko"
        className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
      >
        <head>
          <link rel="preconnect" href="https://rsms.me/" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
