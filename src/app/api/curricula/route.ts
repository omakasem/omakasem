import { getDb } from '@/lib/mongodb'
import type { CurriculumDocument, CurriculumListItem } from '@/lib/types'

export async function GET() {
  try {
    const db = await getDb()
    const collection = db.collection<CurriculumDocument>('curricula')

    const curricula = await collection
      .find(
        { status: { $nin: ['disabled'] } },
        {
          projection: {
            _id: 1,
            course_title: 1,
            icon: 1,
            icon_id: 1,
            git_repo: 1,
            total_tasks: 1,
            completed_tasks: 1,
            status: 1,
            updated_at: 1,
          },
        }
      )
      .sort({ updated_at: -1 })
      .toArray()

    const response: CurriculumListItem[] = curricula.map((doc) => ({
      id: doc._id.toString(),
      title: doc.course_title,
      icon: doc.icon,
      icon_id: doc.icon_id,
      git_repo: doc.git_repo,
      progress: doc.total_tasks > 0 ? Math.round((doc.completed_tasks / doc.total_tasks) * 100) : 0,
      status: doc.status,
    }))

    return Response.json(response)
  } catch (error) {
    console.error('Error fetching curricula:', error)
    const mockData: CurriculumListItem[] = [
      { id: '1', title: 'React 기초부터 실전까지', icon: '⚛️', progress: 45, status: 'active' },
      { id: '2', title: 'TypeScript 마스터', icon: '📘', progress: 80, status: 'active' },
      { id: '3', title: 'Next.js 풀스택 개발', icon: '▲', progress: 20, status: 'generating' },
    ]
    return Response.json(mockData)
  }
}
