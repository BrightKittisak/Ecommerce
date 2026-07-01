import { ZodError } from 'zod'

import { formatError } from './utils'
import { RateLimitError } from './rate-limit-error'

export const USER_ACTION_ERROR_MESSAGE =
  'เกิดข้อผิดพลาดในการจัดการบัญชีผู้ใช้ กรุณาลองใหม่อีกครั้ง'

type DuplicateKeyError = {
  code: 11000
  keyValue: Record<string, unknown>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isDuplicateKeyError = (error: unknown): error is DuplicateKeyError =>
  isRecord(error) &&
  error.code === 11000 &&
  isRecord(error.keyValue)

const isSafeUserActionError = (error: unknown) =>
  error instanceof ZodError ||
  error instanceof RateLimitError ||
  isDuplicateKeyError(error)

export const getUserActionErrorMessage = (error: unknown) =>
  isSafeUserActionError(error) ? formatError(error) : USER_ACTION_ERROR_MESSAGE
