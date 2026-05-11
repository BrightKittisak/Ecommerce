import mongoose from 'mongoose'

import { configureMongoDns } from './configure-dns'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null }

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) throw new Error('ไม่พบตัวแปรแวดล้อม MONGODB_URI')

  configureMongoDns()

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI)

  cached.conn = await cached.promise

  return cached.conn
}
