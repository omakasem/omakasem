import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface GenerateWeeklySummaryParams {
  courseTitle: string
  oneLiner: string
  progress: number
  totalTasks: number
  completedTasks: number
  structure: {
    epics: {
      title: string
      description: string
      stories: { title: string; description: string }[]
    }[]
  }
}

export async function generateWeeklySummary(params: GenerateWeeklySummaryParams): Promise<string> {
  const { courseTitle, oneLiner, progress, totalTasks, completedTasks, structure } = params

  const epicsSummary = structure.epics
    .map((epic, i) => `${i + 1}. ${epic.title}: ${epic.stories.length}개 스토리`)
    .join('\n')

  const prompt = `당신은 개발자 교육 플랫폼의 AI 멘토입니다. 학생의 학습 진행 상황을 보고 짧고 격려하는 평가를 작성해주세요.

코스 정보:
- 코스명: ${courseTitle}
- 설명: ${oneLiner}
- 진행률: ${progress}% (${completedTasks}/${totalTasks} 태스크 완료)
- 커리큘럼 구조:
${epicsSummary}

요구사항:
- 한국어로 작성
- 1-2문장으로 간결하게
- 학생의 현재 진행 상황에 맞는 격려 또는 조언
- 이모지 사용 금지
- "~입니다", "~합니다" 체로 작성

예시:
- 진행률 0-20%: "첫 걸음을 내딛으셨네요. 기초를 탄탄히 다지며 꾸준히 진행해보세요."
- 진행률 20-50%: "좋은 페이스로 진행 중입니다. 이 흐름을 유지하면 곧 절반을 넘기실 수 있습니다."
- 진행률 50-80%: "절반 이상 완료하셨습니다. 마무리까지 조금만 더 힘내세요."
- 진행률 80-100%: "거의 다 완료하셨네요. 마지막 스퍼트를 올려 완주해보세요."

평가 문장만 출력하세요:`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  return textBlock?.text?.trim() || '학습을 시작해보세요.'
}
