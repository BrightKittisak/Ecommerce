import mongoose from 'mongoose'

import { configureMongoDns } from './configure-dns'
import {
  resolveCachedConnection,
  type ConnectionCache,
} from './connection-cache'

type MongooseCache = ConnectionCache<typeof mongoose>

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache
}

const cached = globalForMongoose.mongoose || { conn: null, promise: null }
globalForMongoose.mongoose = cached

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) throw new Error('ไม่พบตัวแปรแวดล้อม MONGODB_URI')

  configureMongoDns()

  return resolveCachedConnection(cached, () => mongoose.connect(MONGODB_URI))
}
