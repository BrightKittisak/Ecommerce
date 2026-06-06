import { ZodError } from 'zod'

import { formatError } from './utils'

export const REVIEW_ACTION_ERROR_MESSAGE =
  'เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง'

const isLoginRequiredReviewMessage = (error: unknown) =>
  error instanceof Error &&
  error.message === 'กรุณาเข้าสู่ระบบก่อนรีวิวสินค้า'

export const getReviewActionErrorMessage = (error: unknown) => {
  if (error instanceof ZodError || isLoginRequiredReviewMessage(error)) {
    return formatError(error)
  }

  return REVIEW_ACTION_ERROR_MESSAGE
}
