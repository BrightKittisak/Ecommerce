import { z } from 'zod'

import { ReviewInputSchema } from '../review/review.schema'
import { formatNumberWithDecimal } from '../../utils'

const Price = (field: string) =>
  z.coerce.number().refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
    `${field} ต้องมีทศนิยม 2 ตำแหน่ง เช่น 49.99`
  )

export const ProductInputSchema = z.object({
  name: z.string().min(3, 'ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร'),
  slug: z.string().min(3, 'Slug ต้องมีอย่างน้อย 3 ตัวอักษร'),
  category: z.string().min(1, 'กรุณาระบุหมวดหมู่'),
  images: z.array(z.string()).min(1, 'สินค้าต้องมีรูปอย่างน้อย 1 รูป'),
  brand: z.string().min(1, 'กรุณาระบุแบรนด์'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียดสินค้า'),
  isPublished: z.boolean(),
  price: Price('ราคา'),
  listPrice: Price('ราคาป้าย'),
  countInStock: z.coerce
    .number()
    .int()
    .nonnegative('จำนวนสินค้าในสต็อกต้องเป็น 0 หรือมากกว่า'),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  avgRating: z.coerce
    .number()
    .min(0, 'คะแนนเฉลี่ยต้องไม่น้อยกว่า 0')
    .max(5, 'คะแนนเฉลี่ยต้องไม่เกิน 5'),
  numReviews: z.coerce
    .number()
    .int()
    .nonnegative('จำนวนรีวิวต้องเป็น 0 หรือมากกว่า'),
  ratingDistribution: z
    .array(z.object({ rating: z.number(), count: z.number() }))
    .max(5),
  reviews: z.array(ReviewInputSchema).default([]),
  numSales: z.coerce
    .number()
    .int()
    .nonnegative('จำนวนยอดขายต้องเป็น 0 หรือมากกว่า'),
})
