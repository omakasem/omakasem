'use client'

import type { Suggestion } from '@/components/feedback'
import { FeedbackPanelV2 } from '@/components/feedback'

const mockSuggestions: Suggestion[] = [
  {
    category: 'security',
    title: '하드코딩된 민감한 헤더 정보 노출',
    description:
      'User-Agent와 기타 브라우저 헤더가 하드코딩되어 있어 탐지 위험이 높습니다. 동적으로 생성하거나 설정 파일에서 관리해야 합니다.',
    priority: 'high',
    rationale: '',
  },
  {
    category: 'code_quality',
    title: '취약한 HTML 파싱 로직',
    description:
      '문자열 split()을 사용한 HTML 파싱은 매우 취약합니다.\nDOM 파서나 정규식을 사용하여 더 안정적인 파싱을 구현해야 합니다.',
    priority: 'high',
    rationale: '',
  },
  {
    category: 'architecture',
    title: '에러 핸들링 부재',
    description:
      '네트워크 요청 실패, 파일 쓰기 실패, 파싱 실패 등에 대한 에러 처리가 전혀 없습니다.\ntry-catch 블록과 적절한 에러 핸들링을 추가해야 합니다.',
    priority: 'high',
    rationale: '',
  },
  {
    category: 'code_quality',
    title: '테스트에서 실제 API 호출',
    description: '테스트가 실제 API를 호출하고 있어 불안정하고 느립니다.\n모킹을 사용하여 테스트를 격리해야 합니다.',
    priority: 'medium',
    rationale: '',
  },
  {
    category: 'security',
    title: '환경변수에서 민감한 데이터 노출',
    description:
      'USERNAME, PASSWORD, TOKEN 등의 민감한 정보가 환경변수에서 직접 노출됩니다. 암호화하거나 보안 저장소를 사용해야 합니다.',
    priority: 'medium',
    rationale: '',
  },
  {
    category: 'security',
    title: '환경변수에서 민감한 데이터 노출',
    description:
      'USERNAME, PASSWORD, TOKEN 등의 민감한 정보가 환경변수에서 직접 노출됩니다. 암호화하거나 보안 저장소를 사용해야 합니다.',
    priority: 'medium',
    rationale: '',
  },
]

export default function FeedbackTestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8">
      <div className="w-full max-w-md">
        <FeedbackPanelV2
          taskTitle="Thread API 만들기"
          suggestions={mockSuggestions}
          onClose={() => console.log('close')}
          onPrevious={() => console.log('prev')}
          onNext={() => console.log('next')}
        />
      </div>
    </div>
  )
}
