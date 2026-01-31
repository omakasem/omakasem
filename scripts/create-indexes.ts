/**
 * Usage: bun run scripts/create-indexes.ts
 */

import type { Collection, CreateIndexesOptions, Db, IndexSpecification } from 'mongodb'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI or MONGODB_URL environment variable not set')
  process.exit(1)
}

const DB_NAME = process.env.MONGODB_DATABASE || 'omakasem'

interface IndexDef {
  key: IndexSpecification
  name: string
  sparse?: boolean
  unique?: boolean
}

async function createIndexSafe(collection: Collection, index: IndexDef): Promise<boolean> {
  try {
    const options: CreateIndexesOptions = { name: index.name }
    if (index.sparse) options.sparse = true
    if (index.unique) options.unique = true

    await collection.createIndex(index.key, options)
    console.log(`   ✅ ${index.name}`)
    return true
  } catch (error: unknown) {
    const mongoError = error as { code?: number }
    if (mongoError.code === 85 || mongoError.code === 86) {
      console.log(`   ⏭️  ${index.name} (equivalent index exists)`)
      return true
    }
    console.error(`   ❌ ${index.name}: ${error}`)
    return false
  }
}

async function createCollectionIndexes(db: Db, collName: string, indexes: IndexDef[]): Promise<void> {
  console.log(`\n📦 ${collName}:`)
  const collection = db.collection(collName)

  const collections = await db.listCollections({ name: collName }).toArray()
  if (collections.length === 0) {
    console.log(`   ⚠️  Collection does not exist yet (will be created on first insert)`)
    return
  }

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
      const collections = await db.listCollections({ name: collName }).toArray()
      if (collections.length === 0) {
        console.log(`\n${collName}: (not created yet)`)
        continue
      }
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
