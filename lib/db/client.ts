import { MongoClient, ServerApiVersion } from 'mongodb'

import { configureMongoDns } from './configure-dns'

// This approach is adapted from the official Next.js MongoDB example,
// but delayed so builds do not fail before env vars are configured.

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

type GlobalMongo = typeof globalThis & {
  _mongoClient?: MongoClient
}

export default function getMongoClient() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('ไม่พบตัวแปรแวดล้อม MONGODB_URI')
  }

  const globalWithMongo = global as GlobalMongo

  configureMongoDns()

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClient) {
      globalWithMongo._mongoClient = new MongoClient(uri, options)
    }

    return globalWithMongo._mongoClient
  }

  return new MongoClient(uri, options)
}
