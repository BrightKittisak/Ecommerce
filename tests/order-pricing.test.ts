import assert from 'node:assert/strict'
import test from 'node:test'

import { AVAILABLE_DELIVERY_DATES } from '../lib/constants'
import { calcDeliveryDateAndPrice } from '../lib/domain/order/pricing'

const orderItem = {
  clientId: 'cart-item-1',
  product: '507f1f77bcf86cd799439011',
  name: 'Studio Bag',
  slug: 'studio-bag',
  category: 'bags',
  quantity: 2,
  countInStock: 8,
  image: '/images/studio-bag.png',
  price: 120.555,
}

const shippingAddress = {
  fullName: 'Buyer Example',
  street: '123 Test Street',
  city: 'Bangkok',
  province: 'Bangkok',
  postalCode: '10110',
  country: 'Thailand',
  phone: '0812345678',
}

test('calculates order pricing with shipping and tax', () => {
  const pricing = calcDeliveryDateAndPrice({
    items: [orderItem],
    shippingAddress,
    deliveryDateIndex: 0,
  })

  assert.equal(pricing.deliveryDateIndex, 0)
  assert.equal(pricing.itemsPrice, 241.11)
  assert.equal(pricing.shippingPrice, 420)
  assert.equal(pricing.taxPrice, 36.17)
  assert.equal(pricing.totalPrice, 697.28)
  assert.deepEqual(pricing.AVAILABLE_DELIVERY_DATES, AVAILABLE_DELIVERY_DATES)
  assert.ok(pricing.expectedDeliveryDate instanceof Date)
})

test('falls back to the slowest delivery date when the index is invalid', () => {
  const pricing = calcDeliveryDateAndPrice({
    items: [orderItem],
    shippingAddress,
    deliveryDateIndex: 999,
  })

  assert.equal(pricing.deliveryDateIndex, AVAILABLE_DELIVERY_DATES.length - 1)
  assert.equal(
    pricing.shippingPrice,
    AVAILABLE_DELIVERY_DATES[AVAILABLE_DELIVERY_DATES.length - 1].shippingPrice
  )
})

test('applies free shipping for eligible delivery options', () => {
  const pricing = calcDeliveryDateAndPrice({
    items: [{ ...orderItem, price: 600, quantity: 2 }],
    shippingAddress,
    deliveryDateIndex: AVAILABLE_DELIVERY_DATES.length - 1,
  })

  assert.equal(pricing.itemsPrice, 1200)
  assert.equal(pricing.shippingPrice, 0)
  assert.equal(pricing.taxPrice, 180)
  assert.equal(pricing.totalPrice, 1380)
})

test('calculates item total only when no shipping address is present', () => {
  const pricing = calcDeliveryDateAndPrice({
    items: [orderItem],
    deliveryDateIndex: 0,
  })

  assert.equal(pricing.itemsPrice, 241.11)
  assert.equal(pricing.shippingPrice, undefined)
  assert.equal(pricing.taxPrice, undefined)
  assert.equal(pricing.totalPrice, 241.11)
})
