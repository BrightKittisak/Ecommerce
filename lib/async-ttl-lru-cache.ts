type AsyncCacheEntry<Value> = {
  expiresAt: number
  value: Promise<Value>
}

export function createAsyncTtlLruCache<Key, Value>({
  maxEntries,
  now = Date.now,
  ttlMs,
}: {
  maxEntries: number
  now?: () => number
  ttlMs: number
}) {
  if (!Number.isSafeInteger(maxEntries) || maxEntries <= 0) {
    throw new RangeError('maxEntries must be a positive safe integer')
  }
  if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
    throw new RangeError('ttlMs must be a positive safe integer')
  }

  const entries = new Map<Key, AsyncCacheEntry<Value>>()

  const deleteOldestEntries = () => {
    while (entries.size > maxEntries) {
      const oldestKey = entries.keys().next().value
      if (oldestKey === undefined) return
      entries.delete(oldestKey)
    }
  }

  return {
    clear() {
      entries.clear()
    },
    get size() {
      return entries.size
    },
    getOrCreate(key: Key, load: () => Promise<Value>) {
      const currentTime = now()
      const existing = entries.get(key)

      if (existing && existing.expiresAt > currentTime) {
        entries.delete(key)
        entries.set(key, existing)
        return existing.value
      }

      if (existing) entries.delete(key)

      const value = Promise.resolve().then(load)
      entries.set(key, {
        expiresAt: currentTime + ttlMs,
        value,
      })
      deleteOldestEntries()

      void value.catch(() => {
        if (entries.get(key)?.value === value) entries.delete(key)
      })

      return value
    },
  }
}
