/**
 * MongoDB Seed Script for Omakasem
 *
 * Usage:
 *   bun run seed <clerk_user_id>
 *
 * Example:
 *   bun run seed user_2abc123def456
 *
 * This script populates the database with:
 * - 5 curricula (various coding courses)
 * - 15-30 tasks per curriculum
 * - 6 months of activity data for heatmap
 */

import { MongoClient, ObjectId } from 'mongodb'

// Get clerk_user_id from command line args
const clerkUserId = process.argv[2]

if (!clerkUserId) {
  console.error('Usage: bun run seed <clerk_user_id>')
  console.error('Example: bun run seed user_2abc123def456')
  process.exit(1)
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable not set')
  console.error('Run: source .env.local or export MONGODB_URI=...')
  process.exit(1)
}

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

interface Epic {
  title: string
  description: string
  stories: { title: string; description: string }[]
}

interface CurriculumSeed {
  course_title: string
  one_liner: string
  icon: string
  total_hours: number
  status: 'generating' | 'active' | 'completed'
  structure: { epics: Epic[] }
}

interface TaskSeed {
  epic_index: number
  story_index: number
  epic_title: string
  story_title: string
  title: string
  description: string
  acceptance_criteria: { description: string; weight: number }[]
  estimated_minutes: number
  status: 'pending' | 'partial' | 'passed' | 'failed'
}

// ============================================================================
// CURRICULUM DATA - Realistic Korean coding courses
// ============================================================================

const CURRICULA: CurriculumSeed[] = [
  {
    course_title: 'React 완전 정복: 제로부터 프로덕션까지',
    one_liner: 'React의 기초부터 고급 패턴, 성능 최적화까지 마스터하는 12주 과정',
    icon: '⚛️',
    total_hours: 120,
    status: 'active',
    structure: {
      epics: [
        {
          title: 'Week 1-2: React 기초',
          description: 'JSX, 컴포넌트, Props, State의 기본 개념을 학습합니다.',
          stories: [
            { title: '환경 설정', description: 'Node.js, npm, Vite로 React 프로젝트 시작하기' },
            { title: 'JSX 마스터', description: 'JSX 문법과 표현식 활용법' },
            { title: '컴포넌트 기초', description: '함수형 컴포넌트와 Props 전달' },
          ],
        },
        {
          title: 'Week 3-4: 상태 관리',
          description: 'useState, useReducer, Context API를 활용한 상태 관리',
          stories: [
            { title: 'useState 심화', description: '복잡한 상태 로직 다루기' },
            { title: 'useReducer 패턴', description: '대규모 상태 관리 전략' },
            { title: 'Context API', description: '전역 상태 관리와 성능 고려사항' },
          ],
        },
        {
          title: 'Week 5-6: Hooks 심화',
          description: 'useEffect, useMemo, useCallback 등 핵심 Hooks 마스터',
          stories: [
            { title: 'useEffect 완벽 가이드', description: '사이드 이펙트와 클린업 함수' },
            { title: '성능 최적화 Hooks', description: 'useMemo와 useCallback 실전 활용' },
            { title: '커스텀 Hooks', description: '재사용 가능한 로직 추출하기' },
          ],
        },
        {
          title: 'Week 7-8: 라우팅과 데이터 페칭',
          description: 'React Router와 TanStack Query로 실전 앱 구축',
          stories: [
            { title: 'React Router v6', description: '동적 라우팅과 중첩 라우트' },
            { title: 'TanStack Query 기초', description: '서버 상태 관리의 새로운 패러다임' },
            { title: '무한 스크롤 구현', description: '페이지네이션과 무한 스크롤' },
          ],
        },
      ],
    },
  },
  {
    course_title: 'TypeScript 마스터 클래스',
    one_liner: 'JavaScript 개발자를 위한 TypeScript 완벽 가이드',
    icon: '📘',
    total_hours: 80,
    status: 'active',
    structure: {
      epics: [
        {
          title: 'Week 1: TypeScript 입문',
          description: '타입 시스템의 기초와 기본 타입들',
          stories: [
            { title: '타입 기초', description: 'string, number, boolean, array, object' },
            { title: '타입 추론', description: 'TypeScript의 강력한 타입 추론 이해하기' },
            { title: '유니온과 인터섹션', description: '타입 조합의 기초' },
          ],
        },
        {
          title: 'Week 2-3: 고급 타입',
          description: '제네릭, 유틸리티 타입, 조건부 타입',
          stories: [
            { title: '제네릭 마스터', description: '재사용 가능한 타입 정의' },
            { title: '유틸리티 타입', description: 'Partial, Pick, Omit, Record 활용' },
            { title: '조건부 타입', description: 'extends와 infer 키워드' },
          ],
        },
        {
          title: 'Week 4: 실전 프로젝트',
          description: 'React + TypeScript 프로젝트 구축',
          stories: [
            { title: 'React 타입 정의', description: 'Props, Events, Refs 타입 지정' },
            { title: 'API 타입 안전성', description: 'fetch와 axios 타입 처리' },
            { title: '에러 핸들링', description: '타입 가드와 사용자 정의 타입 가드' },
          ],
        },
      ],
    },
  },
  {
    course_title: 'Node.js 백엔드 개발 실전',
    one_liner: 'Express부터 NestJS까지, 프로덕션 레벨 백엔드 구축',
    icon: '🟢',
    total_hours: 100,
    status: 'active',
    structure: {
      epics: [
        {
          title: 'Week 1-2: Node.js 기초',
          description: 'Node.js 런타임과 비동기 프로그래밍',
          stories: [
            { title: 'Node.js 아키텍처', description: '이벤트 루프와 비동기 I/O' },
            { title: '모듈 시스템', description: 'CommonJS와 ES Modules' },
            { title: 'npm 에코시스템', description: '패키지 관리와 보안' },
          ],
        },
        {
          title: 'Week 3-4: Express.js',
          description: 'RESTful API 설계와 구현',
          stories: [
            { title: 'REST API 설계', description: '리소스 중심 API 디자인' },
            { title: '미들웨어 패턴', description: '인증, 로깅, 에러 핸들링' },
            { title: '데이터 검증', description: 'Zod와 express-validator 활용' },
          ],
        },
        {
          title: 'Week 5-6: 데이터베이스',
          description: 'MongoDB와 PostgreSQL 실전 활용',
          stories: [
            { title: 'MongoDB 기초', description: 'Document 모델과 쿼리' },
            { title: 'Mongoose ODM', description: '스키마 정의와 관계 설정' },
            { title: 'PostgreSQL 입문', description: 'SQL과 Prisma ORM' },
          ],
        },
      ],
    },
  },
  {
    course_title: 'Next.js 15 풀스택 개발',
    one_liner: 'App Router, Server Components, Server Actions으로 모던 웹 앱 구축',
    icon: '▲',
    total_hours: 90,
    status: 'completed',
    structure: {
      epics: [
        {
          title: 'Week 1: Next.js 기초',
          description: 'App Router와 파일 기반 라우팅',
          stories: [
            { title: '프로젝트 구조', description: 'app 디렉토리와 라우팅 컨벤션' },
            { title: 'Server vs Client', description: '서버 컴포넌트와 클라이언트 컴포넌트' },
            { title: '레이아웃과 템플릿', description: '공유 UI와 중첩 레이아웃' },
          ],
        },
        {
          title: 'Week 2-3: 데이터 페칭',
          description: 'Server Components에서의 데이터 로딩',
          stories: [
            { title: 'async/await 컴포넌트', description: '서버에서 직접 데이터 fetch' },
            { title: '캐싱 전략', description: 'revalidate와 cache 옵션' },
            { title: 'Streaming과 Suspense', description: '점진적 렌더링' },
          ],
        },
        {
          title: 'Week 4: Server Actions',
          description: '폼 처리와 뮤테이션',
          stories: [
            { title: 'Server Actions 기초', description: 'use server 지시어와 폼 처리' },
            { title: '낙관적 업데이트', description: 'useOptimistic 훅 활용' },
            { title: '에러 처리', description: 'error.tsx와 not-found.tsx' },
          ],
        },
      ],
    },
  },
  {
    course_title: 'Python 데이터 사이언스 입문',
    one_liner: 'pandas, numpy, matplotlib로 시작하는 데이터 분석',
    icon: '🐍',
    total_hours: 60,
    status: 'generating',
    structure: {
      epics: [
        {
          title: 'Week 1: Python 기초 복습',
          description: '데이터 사이언스를 위한 Python 핵심',
          stories: [
            { title: '리스트 컴프리헨션', description: '효율적인 데이터 처리' },
            { title: '딕셔너리와 집합', description: '데이터 구조 활용' },
            { title: '함수와 람다', description: '재사용 가능한 코드 작성' },
          ],
        },
        {
          title: 'Week 2-3: pandas 마스터',
          description: 'DataFrame으로 데이터 조작하기',
          stories: [
            { title: 'DataFrame 기초', description: '생성, 인덱싱, 슬라이싱' },
            { title: '데이터 클리닝', description: '결측치, 중복, 이상치 처리' },
            { title: '그룹핑과 집계', description: 'groupby와 pivot_table' },
          ],
        },
      ],
    },
  },
]

// ============================================================================
// TASK GENERATOR - Creates realistic tasks for each curriculum
// ============================================================================

function generateTasksForCurriculum(curriculum: CurriculumSeed, curriculumId: ObjectId): TaskSeed[] {
  const tasks: TaskSeed[] = []

  curriculum.structure.epics.forEach((epic, epicIndex) => {
    epic.stories.forEach((story, storyIndex) => {
      // Generate 2-4 tasks per story
      const taskCount = 2 + Math.floor(Math.random() * 3)

      for (let i = 0; i < taskCount; i++) {
        const taskTemplates = getTaskTemplates(story.title, curriculum.course_title)
        const template = taskTemplates[i % taskTemplates.length]

        // Determine status based on curriculum status and position
        let status: 'pending' | 'partial' | 'passed' | 'failed' = 'pending'
        if (curriculum.status === 'completed') {
          status = 'passed'
        } else if (curriculum.status === 'active') {
          // First epic mostly completed, second partially, rest pending
          if (epicIndex === 0) {
            status = Math.random() > 0.1 ? 'passed' : 'partial'
          } else if (epicIndex === 1) {
            const rand = Math.random()
            if (rand < 0.4) status = 'passed'
            else if (rand < 0.6) status = 'partial'
            else if (rand < 0.7) status = 'failed'
            else status = 'pending'
          }
        }

        tasks.push({
          epic_index: epicIndex,
          story_index: storyIndex,
          epic_title: epic.title,
          story_title: story.title,
          title: template.title,
          description: template.description,
          acceptance_criteria: template.acceptance_criteria,
          estimated_minutes: 30 + Math.floor(Math.random() * 60),
          status,
        })
      }
    })
  })

  return tasks
}

function getTaskTemplates(
  storyTitle: string,
  courseTitle: string
): { title: string; description: string; acceptance_criteria: { description: string; weight: number }[] }[] {
  // Generate contextual task templates based on story
  const baseTemplates = [
    {
      title: `${storyTitle} 실습 과제 1`,
      description: `${storyTitle}에서 배운 개념을 실제 코드로 구현해보세요.`,
      acceptance_criteria: [
        { description: '코드가 정상적으로 실행되어야 합니다', weight: 0.3 },
        { description: '요구사항을 모두 충족해야 합니다', weight: 0.4 },
        { description: '코드 품질과 가독성이 좋아야 합니다', weight: 0.3 },
      ],
    },
    {
      title: `${storyTitle} 심화 과제`,
      description: `${storyTitle}의 고급 개념을 활용한 프로젝트를 완성하세요.`,
      acceptance_criteria: [
        { description: '기본 기능이 구현되어야 합니다', weight: 0.25 },
        { description: '엣지 케이스를 처리해야 합니다', weight: 0.25 },
        { description: '테스트 코드가 포함되어야 합니다', weight: 0.25 },
        { description: '문서화가 되어있어야 합니다', weight: 0.25 },
      ],
    },
    {
      title: `${storyTitle} 퀴즈`,
      description: `${storyTitle}에 대한 이해도를 점검하는 퀴즈입니다.`,
      acceptance_criteria: [
        { description: '모든 문제에 답변해야 합니다', weight: 0.5 },
        { description: '70% 이상 정답이어야 합니다', weight: 0.5 },
      ],
    },
    {
      title: `${storyTitle} 미니 프로젝트`,
      description: `${storyTitle}에서 배운 내용을 종합하는 미니 프로젝트입니다.`,
      acceptance_criteria: [
        { description: '프로젝트가 정상 작동해야 합니다', weight: 0.35 },
        { description: '코드가 깔끔하고 구조화되어 있어야 합니다', weight: 0.35 },
        { description: 'README가 작성되어 있어야 합니다', weight: 0.3 },
      ],
    },
  ]

  return baseTemplates
}

// ============================================================================
// ACTIVITY GENERATOR - Creates realistic heatmap data
// ============================================================================

function generateActivityData(clerkUserId: string, curriculumIds: ObjectId[]): {
  clerk_user_id: string
  curriculum_id?: ObjectId
  type: 'task_completed' | 'submission' | 'login' | 'study'
  date: string
  count: number
  created_at: Date
}[] {
  const activities: {
    clerk_user_id: string
    curriculum_id?: ObjectId
    type: 'task_completed' | 'submission' | 'login' | 'study'
    date: string
    count: number
    created_at: Date
  }[] = []

  const today = new Date()
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Generate activity for each day in the last 6 months
  for (let d = new Date(sixMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Base probability of activity (higher on weekdays)
    let activityProbability = isWeekend ? 0.3 : 0.7

    // Reduce activity probability for older dates
    const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo > 90) activityProbability *= 0.6
    else if (daysAgo > 30) activityProbability *= 0.8

    // Random "streak" periods with high activity
    const weekNumber = Math.floor(daysAgo / 7)
    if (weekNumber % 4 === 0 || weekNumber % 4 === 1) {
      activityProbability = Math.min(0.95, activityProbability * 1.5)
    }

    if (Math.random() < activityProbability) {
      // Determine number of activities (1-8)
      const activityCount = 1 + Math.floor(Math.random() * Math.random() * 8)

      const types: ('task_completed' | 'submission' | 'login' | 'study')[] = [
        'task_completed',
        'submission',
        'login',
        'study',
      ]
      const type = types[Math.floor(Math.random() * types.length)]

      activities.push({
        clerk_user_id: clerkUserId,
        curriculum_id: curriculumIds[Math.floor(Math.random() * curriculumIds.length)],
        type,
        date: dateStr,
        count: activityCount,
        created_at: new Date(dateStr),
      })
    }
  }

  return activities
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seed() {
  console.log('🌱 Starting database seed...')
  console.log(`   User ID: ${clerkUserId}`)
  console.log('')

  const client = new MongoClient(MONGODB_URI!)
  await client.connect()
  console.log('✅ Connected to MongoDB')

  const db = client.db()

  try {
    // Clear existing data for this user
    console.log('\n🧹 Clearing existing data for user...')
    await db.collection('curricula').deleteMany({ clerk_user_id: clerkUserId })
    await db.collection('tasks').deleteMany({
      curriculum_id: {
        $in: (await db.collection('curricula').find({ clerk_user_id: clerkUserId }).toArray()).map((c) => c._id),
      },
    })
    await db.collection('activities').deleteMany({ clerk_user_id: clerkUserId })
    console.log('   Cleared curricula, tasks, and activities')

    // Insert curricula
    console.log('\n📚 Creating curricula...')
    const curriculumIds: ObjectId[] = []

    for (const curriculum of CURRICULA) {
      const now = new Date()
      const curriculumDoc = {
        _id: new ObjectId(),
        session_id: `seed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        course_title: curriculum.course_title,
        one_liner: curriculum.one_liner,
        student_id: null,
        clerk_user_id: clerkUserId,
        status: curriculum.status,
        total_hours: curriculum.total_hours,
        total_tasks: 0, // Will be updated after tasks are created
        completed_tasks: 0, // Will be updated after tasks are created
        icon: curriculum.icon,
        structure: curriculum.structure,
        created_at: now,
        updated_at: now,
      }

      await db.collection('curricula').insertOne(curriculumDoc)
      curriculumIds.push(curriculumDoc._id)
      console.log(`   ✅ ${curriculum.icon} ${curriculum.course_title}`)
    }

    // Insert tasks for each curriculum
    console.log('\n📝 Creating tasks...')
    let totalTasks = 0
    let totalCompleted = 0

    for (let i = 0; i < CURRICULA.length; i++) {
      const curriculum = CURRICULA[i]
      const curriculumId = curriculumIds[i]

      const tasks = generateTasksForCurriculum(curriculum, curriculumId)
      const now = new Date()

      const taskDocs = tasks.map((task) => ({
        _id: new ObjectId(),
        curriculum_id: curriculumId,
        epic_index: task.epic_index,
        story_index: task.story_index,
        epic_title: task.epic_title,
        story_title: task.story_title,
        title: task.title,
        description: task.description,
        acceptance_criteria: task.acceptance_criteria,
        estimated_minutes: task.estimated_minutes,
        status: task.status,
        grade_result: task.status === 'passed' || task.status === 'partial' || task.status === 'failed'
          ? {
              grade_job_id: `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              score: task.status === 'passed' ? 85 + Math.floor(Math.random() * 15) : task.status === 'partial' ? 50 + Math.floor(Math.random() * 20) : 20 + Math.floor(Math.random() * 30),
              percentage: task.status === 'passed' ? 85 + Math.floor(Math.random() * 15) : task.status === 'partial' ? 50 + Math.floor(Math.random() * 20) : 20 + Math.floor(Math.random() * 30),
              grade: task.status === 'passed' ? 'A' : task.status === 'partial' ? 'C' : 'F',
              criteria_results: [],
              repo_url: 'https://github.com/test-user/test-repo',
              graded_at: now.toISOString(),
            }
          : null,
        created_at: now,
        updated_at: now,
      }))

      if (taskDocs.length > 0) {
        await db.collection('tasks').insertMany(taskDocs)
      }

      const passedCount = tasks.filter((t) => t.status === 'passed').length

      // Update curriculum with task counts
      await db.collection('curricula').updateOne(
        { _id: curriculumId },
        {
          $set: {
            total_tasks: tasks.length,
            completed_tasks: passedCount,
          },
        }
      )

      totalTasks += tasks.length
      totalCompleted += passedCount
      console.log(`   ✅ ${curriculum.icon} ${tasks.length} tasks (${passedCount} completed)`)
    }

    // Insert activities
    console.log('\n📊 Creating activity data (6 months)...')
    const activities = generateActivityData(clerkUserId, curriculumIds)

    if (activities.length > 0) {
      await db.collection('activities').insertMany(activities)
    }

    console.log(`   ✅ ${activities.length} activity records created`)

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('🎉 SEED COMPLETE!')
    console.log('='.repeat(50))
    console.log(`   📚 Curricula: ${CURRICULA.length}`)
    console.log(`   📝 Tasks: ${totalTasks} (${totalCompleted} completed)`)
    console.log(`   📊 Activities: ${activities.length}`)
    console.log(`   👤 User: ${clerkUserId}`)
    console.log('')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

// Run the seed
seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
