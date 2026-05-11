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

const brandTranslations: Record<string, string> = {
  Generic: 'แบรนด์ทั่วไป',
}

const sizeTranslations: Record<string, string> = {
  XS: 'XS (เล็กพิเศษ)',
  S: 'S (เล็ก)',
  M: 'M (มาตรฐาน)',
  L: 'L (ใหญ่)',
  XL: 'XL (เอ็กซ์แอล)',
  XXL: 'XXL (2XL)',
  '2XL': '2XL',
  '3XL': '3XL',
}

export const translateCategory = (value: string) =>
  categoryTranslations[value] ?? value

export const translateColor = (value?: string) =>
  value ? colorTranslations[value] ?? value : '-'

export const translateTag = (value: string) => tagTranslations[value] ?? value

export const translatePaymentMethod = (value?: string) =>
  value ? paymentMethodTranslations[value] ?? value : 'ยังไม่ได้เลือก'

export const translateBrand = (value?: string) => {
  if (!value) return '-'
  const normalized = value.trim()
  return brandTranslations[normalized] ?? normalized
}

export const translateSize = (value?: string) => {
  if (!value) return '-'
  const normalized = value.trim()
  return sizeTranslations[normalized.toUpperCase()] ?? normalized
}

export const formatVariantSummary = ({
  color,
  size,
}: {
  color?: string
  size?: string
}) => {
  const parts = [translateColor(color), translateSize(size)].filter(
    (value) => value && value !== '-'
  )

  return parts.length > 0 ? parts.join(' • ') : '-'
}
