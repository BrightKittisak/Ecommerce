import { z } from 'zod'

import { ShippingAddressSchema } from './validator'

export const CreateOrderItemSchema = z.object({
  clientId: z.string().min(1, 'กรุณาระบุ clientId'),
  product: z.string().min(1, 'กรุณาระบุสินค้า'),
  quantity: z
    .number()
    .int()
    .positive('จำนวนสินค้าต้องมากกว่า 0'),
  size: z.string().optional(),
  color: z.string().optional(),
})

export const CreateOrderSchema = z.object({
  items: z
    .array(CreateOrderItemSchema)
    .min(1, 'คำสั่งซื้อต้องมีสินค้าอย่างน้อย 1 รายการ'),
  shippingAddress: ShippingAddressSchema,
  paymentMethod: z.string().min(1, 'กรุณาเลือกวิธีชำระเงิน'),
  deliveryDateIndex: z.number().int().nonnegative().optional(),
})
