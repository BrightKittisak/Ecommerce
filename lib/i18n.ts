const categoryTranslations: Record<string, string> = {
  'T-Shirts': 'เสื้อยืด',
  Jeans: 'กางเกงยีนส์',
  'Wrist Watches': 'นาฬิกาข้อมือ',
  Shoes: 'รองเท้า',
}

const colorTranslations: Record<string, string> = {
  Black: 'ดำ',
  Blue: 'น้ำเงิน',
  Brown: 'น้ำตาล',
  Beige: 'เบจ',
  Green: 'เขียว',
  Grey: 'เทา',
  Gray: 'เทา',
  Navy: 'กรมท่า',
  Red: 'แดง',
  Sliver: 'เงิน',
  Silver: 'เงิน',
  White: 'ขาว',
  Yellow: 'เหลือง',
}

const tagTranslations: Record<string, string> = {
  'new-arrival': 'ของเข้าใหม่',
  'best-seller': 'ขายดี',
  featured: 'สินค้าแนะนำ',
  'todays-deal': 'ดีลวันนี้',
  'New Arrival': 'ของเข้าใหม่',
  'Best Seller': 'ขายดี',
  Featured: 'สินค้าแนะนำ',
  "Today's Deal": 'ดีลวันนี้',
}

const paymentMethodTranslations: Record<string, string> = {
  'Cash On Delivery': 'เก็บเงินปลายทาง',
  PayPal: 'PayPal',
  Stripe: 'บัตรเครดิต / เดบิต (Stripe)',
}

export const translateCategory = (value: string) =>
  categoryTranslations[value] ?? value

export const translateColor = (value?: string) =>
  value ? colorTranslations[value] ?? value : '-'

export const translateTag = (value: string) => tagTranslations[value] ?? value

export const translatePaymentMethod = (value?: string) =>
  value ? paymentMethodTranslations[value] ?? value : 'ยังไม่ได้เลือก'
