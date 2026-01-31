/**
 * Usage: bun run scripts/create-indexes.ts
 */

import { Collection, Db, IndexDescription, MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI or MONGODB_URL environment variable not set')
  process.exit(1)
}

const DB_NAME = process.env.MONGODB_DATABASE || 'omakasem'

async function createIndexSafe(collection: Collection, index: IndexDescription): Promise<boolean> {
  try {
    await collection.createIndex(index.key, {
      name: index.name,
      background: true,
      sparse: index.sparse,
      unique: index.unique,
    })
    console.log(`   ✅ ${index.name}`)
    return true
  } catch (error: unknown) {
    const mongoError = error as { code?: number; codeName?: string }
    if (mongoError.code === 85) {
      console.log(`   ⏭️  ${index.name} (equivalent index exists)`)
      return true
    }
    console.error(`   ❌ ${index.name}: ${mongoError}`)
    return false
  }
}

async function createCollectionIndexes(db: Db, collName: string, indexes: IndexDescription[]): Promise<void> {
  console.log(`\n📦 ${collName}:`)
  const collection = db.collection(collName)
  for (const index of indexes) {
    await createIndexSafe(collection, index)
  }
}

async function createIndexes() {
  console.log('🔌 Connecting to MongoDB...')
  const client = await MongoClient.connect(MONGODB_URI as string)
  const db = client.db(DB_NAME)
  console.log(`✅ Connected to database: ${DB_NAME}`)

  try {
    await createCollectionIndexes(db, 'curricula', [
      { key: { clerk_user_id: 1, updated_at: -1 }, name: 'idx_curricula_user_updated' },
      { key: { session_id: 1 }, name: 'idx_curricula_session', sparse: true },
      { key: { status: 1 }, name: 'idx_curricula_status' },
    ])

    await createCollectionIndexes(db, 'tasks', [
      { key: { curriculum_id: 1, epic_index: 1, story_index: 1 }, name: 'idx_tasks_curriculum_ordering' },
      { key: { curriculum_id: 1, status: 1 }, name: 'idx_tasks_curriculum_status' },
    ])

    await createCollectionIndexes(db, 'activities', [
      { key: { clerk_user_id: 1, date: -1 }, name: 'idx_activities_user_date' },
      { key: { date: 1 }, name: 'idx_activities_date' },
    ])

    await createCollectionIndexes(db, 'sessions', [
      { key: { sessionId: 1 }, name: 'idx_sessions_sessionId', unique: true },
      { key: { userId: 1, createdAt: -1 }, name: 'idx_sessions_user_created' },
      { key: { status: 1 }, name: 'idx_sessions_status' },
    ])

    console.log('\n📋 Current indexes:')
    for (const collName of ['curricula', 'tasks', 'activities', 'sessions']) {
      const indexes = await db.collection(collName).indexes()
      console.log(`\n${collName}:`)
      for (const idx of indexes) {
        console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`)
      }
    }

    console.log('\n✅ Index setup complete!')
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createIndexes()
