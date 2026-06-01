import { APP_NAME } from './constants'

export type HealthStatus = {
  ok: true
  service: string
  timestamp: string
}

export function createHealthStatus(now = new Date()): HealthStatus {
  return {
    ok: true,
    service: APP_NAME,
    timestamp: now.toISOString(),
  }
}
