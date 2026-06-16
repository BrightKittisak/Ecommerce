import { z } from 'zod'

import { CURRENCY_CODE, formatNumberWithDecimal } from '../../utils'
import { ShippingAddressSchema } from './shipping-address.schema'

const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'รหัส MongoDB ไม่ถูกต้อง' })

const Price = (field: string) =>
  z.coerce.number().refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
    `${field} ต้องมีทศนิยม 2 ตำแหน่ง เช่น 49.99`
  )

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

export const OrderInputSchema = z.object({
  user: z.union([
    MongoId,
    z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  ]),
  items: z
    .array(OrderItemSchema)
    .min(1, 'คำสั่งซื้อต้องมีสินค้าอย่างน้อย 1 รายการ'),
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
    .refine(
      (value) => value > new Date(),
      'วันที่คาดว่าจะจัดส่งต้องเป็นวันในอนาคต'
    ),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional(),
  isPaid: z.boolean().default(false),
  paidAt: z.date().optional(),
})
