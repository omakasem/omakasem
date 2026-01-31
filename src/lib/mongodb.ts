import { MongoClient, Db } from 'mongodb';

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'omakasem';

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable');
}

interface GlobalMongo {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongo: GlobalMongo | undefined;
}

const cached: GlobalMongo = global._mongo ?? { client: null, promise: null };

if (!global._mongo) {
  global._mongo = cached;
}

export async function connectToDatabase(): Promise<Db> {
  if (cached.client) {
    return cached.client.db();
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URL!);
  }

  cached.client = await cached.promise;
  return cached.client.db(MONGODB_DATABASE);
}

export async function getSessionsCollection() {
  const db = await connectToDatabase();
  return db.collection('sessions');
}

export async function getCurriculaCollection() {
  const db = await connectToDatabase();
  return db.collection('curricula');
}
