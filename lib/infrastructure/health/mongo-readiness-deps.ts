import type { ReadinessDeps } from '@/lib/application/health/readiness'
import { connectToDatabase } from '@/lib/db'

export const mongoReadinessDeps: ReadinessDeps = {
  async checkDatabase() {
    const mongoose = await connectToDatabase()
    const database = mongoose.connection.db

    if (!database) {
      throw new Error('MongoDB connection is not ready')
    }

    await database.command({ ping: 1 }, { timeoutMS: 1000 })
  },
}
