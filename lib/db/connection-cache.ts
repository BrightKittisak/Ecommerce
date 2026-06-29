export type ConnectionCache<T> = {
  conn: T | null
  promise: Promise<T> | null
}

export async function resolveCachedConnection<T>(
  cache: ConnectionCache<T>,
  connect: () => Promise<T>
): Promise<T> {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = connect()
  }

  const pendingConnection = cache.promise

  try {
    const connection = await pendingConnection
    cache.conn = connection
    return connection
  } catch (error) {
    if (cache.promise === pendingConnection) {
      cache.promise = null
    }
    throw error
  }
}
