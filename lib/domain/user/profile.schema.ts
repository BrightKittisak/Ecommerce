import { z } from 'zod'

const UserName = z
  .string()
  .min(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  .max(50, { message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' })

export const UserNameSchema = z.object({
  name: UserName,
})
