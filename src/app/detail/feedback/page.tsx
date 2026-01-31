'use client'

import type { Suggestion } from '@/components/feedback'
import { FeedbackLayout } from '@/components/feedback'

const mockSuggestions: Suggestion[] = [
  {
    category: 'security',
    title: '하드코딩된 민감한 헤더 정보 노출',
    description:
      'User-Agent와 기타 브라우저 헤더가 하드코딩되어 있어 탐지 위험이 높습니다. 동적으로 생성하거나 설정 파일에서 관리해야 합니다.',
    file: 'fetch-dynamic-data/index.deno.ts',
    line: 8,
    priority: 'high',
    rationale: '하드코딩된 헤더는 봇 탐지 시스템에 의해 쉽게 식별될 수 있으며, 스크래핑 차단의 원인이 될 수 있습니다.',
  },
  {
    category: 'code_quality',
    title: '취약한 HTML 파싱 로직',
    description:
      '문자열 split()을 사용한 HTML 파싱은 매우 취약합니다.\nDOM 파서나 정규식을 사용하여 더 안정적인 파싱을 구현해야 합니다.',
    file: 'fetch-dynamic-data/index.deno.ts',
    line: 30,
    priority: 'high',
    rationale: 'DOM 구조 변경 시 파싱이 실패할 수 있습니다.',
  },
  {
    category: 'architecture',
    title: '에러 핸들링 부재',
    description:
      '네트워크 요청 실패, 파일 쓰기 실패, 파싱 실패 등에 대한 에러 처리가 전혀 없습니다.\ntry-catch 블록과 적절한 에러 핸들링을 추가해야 합니다.',
    file: 'fetch-dynamic-data/index.deno.ts',
    line: 6,
    priority: 'high',
    rationale: '에러 발생 시 프로그램이 비정상 종료될 수 있습니다.',
  },
  {
    category: 'code_quality',
    title: '테스트에서 실제 API 호출',
    description: '테스트가 실제 API를 호출하고 있어 불안정하고 느립니다.\n모킹을 사용하여 테스트를 격리해야 합니다.',
    file: 'threads-api/src/threads-api.ts',
    line: 15,
    priority: 'medium',
    rationale: '외부 API 의존성으로 인해 테스트가 불안정해집니다.',
  },
  {
    category: 'security',
    title: '환경변수에서 민감한 데이터 노출',
    description:
      'USERNAME, PASSWORD, TOKEN 등의 민감한 정보가 환경변수에서 직접 노출됩니다. 암호화하거나 보안 저장소를 사용해야 합니다.',
    file: 'threads-api/src/constants.ts',
    line: 1,
    priority: 'medium',
    rationale: '민감한 정보가 노출될 위험이 있습니다.',
  },
]

export default function FeedbackTestPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F5F5] p-4 dark:bg-black">
      <div className="h-full w-full max-w-6xl">
        <FeedbackLayout
          taskTitle="Thread API 만들기"
          repoUrl="https://github.com/junhoyeo/threads-api"
          suggestions={mockSuggestions}
          onClose={() => console.log('close')}
        />
      </div>
    </div>
  )
}
