import { serializeLogError } from './logger'

export const PAYPAL_API_ERROR_MESSAGE =
  'เกิดข้อผิดพลาดในการเชื่อมต่อ PayPal กรุณาลองใหม่อีกครั้ง'

export const createPayPalApiError = () => new Error(PAYPAL_API_ERROR_MESSAGE)

export const getPayPalApiErrorLogMetadata = ({
  body,
  error,
  status,
  statusText,
}: {
  body?: string
  error?: unknown
  status: number
  statusText: string
}) => ({
  status,
  statusText,
  body,
  ...(error === undefined ? {} : { error: serializeLogError(error) }),
})
