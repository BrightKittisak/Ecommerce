import { ZodError } from 'zod'

import { formatError } from './utils'

export const ORDER_ACTION_ERROR_MESSAGE =
  'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง'

const SAFE_ORDER_MESSAGE_PREFIXES = [
  'กรุณาเข้าสู่ระบบ',
  'ไม่พบสินค้า',
  'สินค้า',
  'ไซซ์',
  'สี',
]

const isSafeOrderDomainError = (error: unknown) =>
  error instanceof Error &&
  SAFE_ORDER_MESSAGE_PREFIXES.some((prefix) =>
    error.message.startsWith(prefix)
  )

export const getOrderActionErrorMessage = (error: unknown) => {
  if (error instanceof ZodError || isSafeOrderDomainError(error)) {
    return formatError(error)
  }

  return ORDER_ACTION_ERROR_MESSAGE
}
