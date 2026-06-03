import type { OrderItem, ShippingAddress } from '../../../types'
import { AVAILABLE_DELIVERY_DATES } from '../../constants'
import { calculateFutureDate, round2 } from '../../utils'

export type OrderPricingInput = {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}

export type OrderPricingResult = {
  AVAILABLE_DELIVERY_DATES: typeof AVAILABLE_DELIVERY_DATES
  deliveryDateIndex: number
  expectedDeliveryDate: Date
  itemsPrice: number
  shippingPrice?: number
  taxPrice?: number
  totalPrice: number
}

export const calcDeliveryDateAndPrice = ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: OrderPricingInput): OrderPricingResult => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )
  const fallbackDeliveryDateIndex = AVAILABLE_DELIVERY_DATES.length - 1
  const normalizedDeliveryDateIndex =
    typeof deliveryDateIndex === 'number' &&
    Number.isInteger(deliveryDateIndex) &&
    deliveryDateIndex >= 0 &&
    deliveryDateIndex < AVAILABLE_DELIVERY_DATES.length
      ? deliveryDateIndex
      : fallbackDeliveryDateIndex

  const deliveryDate = AVAILABLE_DELIVERY_DATES[normalizedDeliveryDateIndex]
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
          itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice
  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  )

  return {
    AVAILABLE_DELIVERY_DATES,
    deliveryDateIndex: normalizedDeliveryDateIndex,
    expectedDeliveryDate: calculateFutureDate(deliveryDate.daysToDeliver),
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}
