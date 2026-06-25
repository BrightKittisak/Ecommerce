import { z } from 'zod'

const UserName = z
  .string()
  .min(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  .max(50, { message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' })
const Email = z.string().min(1, 'กรุณากรอกอีเมล').email('อีเมลไม่ถูกต้อง')
const Password = z.string().min(3, 'รหัสผ่านต้องมีอย่างน้อย 3 ตัวอักษร')
const UserRole = z.string().min(1, 'กรุณาระบุสิทธิ์ผู้ใช้')

export const UserInputSchema = z.object({
  name: UserName,
  email: Email,
  image: z.string().optional(),
  emailVerified: z.boolean(),
  role: UserRole,
  password: Password,
  paymentMethod: z.string().min(1, 'กรุณาเลือกวิธีชำระเงิน'),
  address: z.object({
    fullName: z.string().min(1, 'กรุณากรอกชื่อผู้รับ'),
    street: z.string().min(1, 'กรุณากรอกที่อยู่'),
    city: z.string().min(1, 'กรุณากรอกอำเภอหรือเขต'),
    province: z.string().min(1, 'กรุณากรอกจังหวัด'),
    postalCode: z.string().min(1, 'กรุณากรอกรหัสไปรษณีย์'),
    country: z.string().min(1, 'กรุณากรอกประเทศ'),
    phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  }),
})
