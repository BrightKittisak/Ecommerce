import { z } from 'zod'

const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'รหัส MongoDB ไม่ถูกต้อง' })

export const ReviewInputSchema = z.object({
  product: MongoId,
  user: MongoId,
  isVerifiedPurchase: z.boolean(),
  title: z.string().min(1, 'กรุณากรอกหัวข้อรีวิว'),
  comment: z.string().min(1, 'กรุณากรอกความคิดเห็น'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'คะแนนต้องไม่น้อยกว่า 1')
    .max(5, 'คะแนนต้องไม่เกิน 5'),
})
