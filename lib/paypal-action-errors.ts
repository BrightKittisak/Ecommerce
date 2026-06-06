export const PAYPAL_ACTION_ERROR_MESSAGE =
  'เกิดข้อผิดพลาดในการชำระเงินผ่าน PayPal กรุณาลองใหม่อีกครั้ง'

const isUserSafePayPalActionMessage = (message: string) =>
  message.startsWith('กรุณาเข้าสู่ระบบ') ||
  message === 'ไม่พบคำสั่งซื้อ' ||
  message === 'รายการชำระเงิน PayPal ไม่ตรงกับคำสั่งซื้อนี้' ||
  message === 'เกิดข้อผิดพลาดในการชำระเงินผ่าน PayPal'

export const getPayPalActionErrorMessage = (error: unknown) => {
  if (error instanceof Error && isUserSafePayPalActionMessage(error.message)) {
    return error.message
  }

  return PAYPAL_ACTION_ERROR_MESSAGE
}
