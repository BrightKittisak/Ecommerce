import { z } from 'zod'

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อผู้รับ'),
  street: z.string().min(1, 'กรุณากรอกที่อยู่'),
  city: z.string().min(1, 'กรุณากรอกอำเภอหรือเขต'),
  postalCode: z.string().min(1, 'กรุณากรอกรหัสไปรษณีย์'),
  province: z.string().min(1, 'กรุณากรอกจังหวัด'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  country: z.string().min(1, 'กรุณากรอกประเทศ'),
})
