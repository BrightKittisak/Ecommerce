import { z } from 'zod'

const UserName = z
  .string()
  .min(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  .max(50, { message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' })

const Email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'กรุณากรอกอีเมล')
  .email('อีเมลไม่ถูกต้อง')

const StrongPassword = z
  .string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร')
  .refine((value) => /[a-z]/.test(value), {
    message: 'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์เล็กอย่างน้อย 1 ตัว',
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: 'รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่อย่างน้อย 1 ตัว',
  })
  .refine((value) => /\d/.test(value), {
    message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว',
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว',
  })

const ExistingPassword = z
  .string()
  .min(1, 'กรุณากรอกรหัสผ่าน')
  .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร')

export const UserSignInSchema = z.object({
  email: Email,
  password: ExistingPassword,
})

export const UserSignUpSchema = z
  .object({
    name: UserName,
    email: Email,
    password: StrongPassword,
    confirmPassword: StrongPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })
