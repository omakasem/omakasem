import { Db, MongoClient } from 'mongodb'

const DB_NAME = process.env.MONGODB_DATABASE || 'omakasem'

interface MongoClientCache {
  client: MongoClient | null
  promise: Promise<MongoClient> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: MongoClientCache | undefined
}

const cached: MongoClientCache = global._mongoClientPromise || {
  client: null,
  promise: null,
}

if (!global._mongoClientPromise) {
  global._mongoClientPromise = cached
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.client) {
    return { client: cached.client, db: cached.client.db(DB_NAME) }
  }

  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI or MONGODB_URL environment variable')
  }

  if (!cached.promise) {
    const options = {
      directConnection: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }

    cached.promise = MongoClient.connect(MONGODB_URI, options).then((client) => {
      cached.client = client
      return client
    })
  }

  const client = await cached.promise
  return { client, db: client.db(DB_NAME) }
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export async function getSessionsCollection() {
  const db = await getDb()
  return db.collection('sessions')
}

export async function getCurriculaCollection() {
  const db = await getDb()
  return db.collection('curricula')
}
