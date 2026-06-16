import { z } from 'zod'

import { OrderItemSchema } from './order.schema'
import { ShippingAddressSchema } from './shipping-address.schema'

export const CartSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, 'คำสั่งซื้อต้องมีสินค้าอย่างน้อย 1 รายการ'),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  shippingPrice: z.optional(z.number()),
  totalPrice: z.number(),
  paymentMethod: z.optional(z.string()),
  deliveryDateIndex: z.optional(z.number()),
  expectedDeliveryDate: z.optional(z.date()),
  shippingAddress: z.optional(ShippingAddressSchema),
})
