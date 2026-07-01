export const RATE_LIMITED_MESSAGE =
  'ส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง'

export class RateLimitError extends Error {
  constructor() {
    super(RATE_LIMITED_MESSAGE)
    this.name = 'RateLimitError'
  }
}
