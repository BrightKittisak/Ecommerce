import { z } from 'zod'

import { AVAILABLE_DELIVERY_DATES, AVAILABLE_PAYMENT_METHODS } from '../../constants'
import { ShippingAddressSchema } from './shipping-address.schema'

const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'รหัส MongoDB ไม่ถูกต้อง' })

const availablePaymentMethodNames = AVAILABLE_PAYMENT_METHODS.map(
  (method) => method.name
)

export const CreateOrderItemSchema = z
  .object({
    clientId: z.string().min(1, 'กรุณาระบุ clientId'),
    product: MongoId,
    quantity: z
      .number()
      .int()
      .positive('จำนวนสินค้าต้องมากกว่า 0'),
    size: z.string().optional(),
    color: z.string().optional(),
  })
  .strict()

export const CreateOrderSchema = z
  .object({
    items: z
      .array(CreateOrderItemSchema)
      .min(1, 'คำสั่งซื้อต้องมีสินค้าอย่างน้อย 1 รายการ'),
    shippingAddress: ShippingAddressSchema,
    paymentMethod: z
      .string()
      .min(1, 'กรุณาเลือกวิธีชำระเงิน')
      .refine((method) => availablePaymentMethodNames.includes(method), {
        message: 'วิธีชำระเงินไม่ถูกต้อง',
      }),
    deliveryDateIndex: z
      .number()
      .int()
      .min(0)
      .max(AVAILABLE_DELIVERY_DATES.length - 1)
      .optional(),
  })
  .strict()
