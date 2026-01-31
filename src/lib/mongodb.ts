import { Db, MongoClient } from 'mongodb'

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
    return { client: cached.client, db: cached.client.db() }
  }

  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  if (!cached.promise) {
    const options = {}

    cached.promise = MongoClient.connect(MONGODB_URI, options).then((client) => {
      cached.client = client
      return client
    })
  }

  const client = await cached.promise
  return { client, db: client.db() }
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}
