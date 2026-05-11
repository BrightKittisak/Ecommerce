import { z } from 'zod'

import { CURRENCY_CODE, formatNumberWithDecimal } from './utils'

const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'รหัส MongoDB ไม่ถูกต้อง' })

const Price = (field: string) =>
  z.coerce.number().refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
    `${field} ต้องมีทศนิยม 2 ตำแหน่ง เช่น 49.99`
  )

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

export const OrderItemSchema = z.object({
  clientId: z.string().min(1, 'กรุณาระบุ clientId'),
  product: z.string().min(1, 'กรุณาระบุสินค้า'),
  name: z.string().min(1, 'กรุณาระบุชื่อสินค้า'),
  slug: z.string().min(1, 'กรุณาระบุ slug'),
  category: z.string().min(1, 'กรุณาระบุหมวดหมู่'),
  quantity: z.number().int().nonnegative('จำนวนสินค้าต้องเป็น 0 หรือมากกว่า'),
  countInStock: z
    .number()
    .int()
    .nonnegative('จำนวนสินค้าในสต็อกต้องเป็น 0 หรือมากกว่า'),
  image: z.string().min(1, 'กรุณาระบุรูปสินค้า'),
  price: Price('ราคา'),
  size: z.string().optional(),
  color: z.string().optional(),
})

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อผู้รับ'),
  street: z.string().min(1, 'กรุณากรอกที่อยู่'),
  city: z.string().min(1, 'กรุณากรอกอำเภอหรือเขต'),
  postalCode: z.string().min(1, 'กรุณากรอกรหัสไปรษณีย์'),
  province: z.string().min(1, 'กรุณากรอกจังหวัด'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  country: z.string().min(1, 'กรุณากรอกประเทศ'),
})

export const OrderInputSchema = z.object({
  user: z.union([
    MongoId,
    z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  ]),
  items: z.array(OrderItemSchema).min(1, 'คำสั่งซื้อต้องมีสินค้าอย่างน้อย 1 รายการ'),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1, 'กรุณาเลือกวิธีชำระเงิน'),
  paymentResult: z
    .object({
      id: z.string(),
      status: z.string(),
      email_address: z.string(),
      pricePaid: z.string(),
    })
    .optional(),
  itemsPrice: Price('ค่าสินค้า'),
  shippingPrice: Price('ค่าจัดส่ง'),
  taxPrice: Price('ภาษี'),
  totalPrice: Price('ยอดรวม'),
  currencyCode: z.string().default(CURRENCY_CODE),
  expectedDeliveryDate: z
    .date()
    .refine((value) => value > new Date(), 'วันที่คาดว่าจะจัดส่งต้องเป็นวันในอนาคต'),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional(),
  isPaid: z.boolean().default(false),
  paidAt: z.date().optional(),
})

export const CartSchema = z.object({
  items: z.array(OrderItemSchema).min(1, 'คำสั่งซื้อต้องมีสินค้าอย่างน้อย 1 รายการ'),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  shippingPrice: z.optional(z.number()),
  totalPrice: z.number(),
  paymentMethod: z.optional(z.string()),
  deliveryDateIndex: z.optional(z.number()),
  expectedDeliveryDate: z.optional(z.date()),
  shippingAddress: z.optional(ShippingAddressSchema),
})

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

export const UserSignInSchema = z.object({
  email: Email,
  password: Password,
})

export const UserSignUpSchema = UserSignInSchema.extend({
  name: UserName,
  confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'ยืนยันรหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
})

export const UserNameSchema = z.object({
  name: UserName,
})
