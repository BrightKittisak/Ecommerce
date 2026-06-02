export function serializeForClient<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T
}
