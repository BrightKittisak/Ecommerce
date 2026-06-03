import assert from 'node:assert/strict'
import test from 'node:test'

import { buildOrderItemsFromRequest } from '../lib/application/orders/build-order-items'

const idLike = (value: string) => ({
  toString: () => value,
})

const productRecord = (overrides = {}) => ({
  _id: idLike('507f1f77bcf86cd799439011'),
  name: 'Studio Bag',
  slug: 'studio-bag',
  category: 'bags',
  images: ['/images/studio-bag.png'],
  price: 129.995,
  countInStock: 5,
  sizes: ['M', 'L'],
  colors: ['Black', 'Tan'],
  ...overrides,
})

const orderItem = {
  clientId: 'cart-item-1',
  product: '507f1f77bcf86cd799439011',
  quantity: 2,
  size: 'M',
  color: 'Black',
}

test('builds server-authoritative order items from published products', async () => {
  let requestedProductIds: string[] | undefined

  const items = await buildOrderItemsFromRequest({
    items: [orderItem, { ...orderItem, clientId: 'cart-item-2' }],
    deps: {
      findPublishedProductsForOrderItems: async (productIds) => {
        requestedProductIds = productIds
        return [productRecord()]
      },
    },
  })

  assert.deepEqual(requestedProductIds, ['507f1f77bcf86cd799439011'])
  assert.deepEqual(items, [
    {
      clientId: 'cart-item-1',
      product: '507f1f77bcf86cd799439011',
      name: 'Studio Bag',
      slug: 'studio-bag',
      category: 'bags',
      quantity: 2,
      countInStock: 5,
      image: '/images/studio-bag.png',
      price: 130,
      size: 'M',
      color: 'Black',
    },
    {
      clientId: 'cart-item-2',
      product: '507f1f77bcf86cd799439011',
      name: 'Studio Bag',
      slug: 'studio-bag',
      category: 'bags',
      quantity: 2,
      countInStock: 5,
      image: '/images/studio-bag.png',
      price: 130,
      size: 'M',
      color: 'Black',
    },
  ])
})

test('rejects missing or insufficient-stock order item products', async () => {
  await assert.rejects(
    buildOrderItemsFromRequest({
      items: [orderItem],
      deps: {
        findPublishedProductsForOrderItems: async () => [],
      },
    }),
    /ไม่พบสินค้า/
  )

  await assert.rejects(
    buildOrderItemsFromRequest({
      items: [{ ...orderItem, quantity: 6 }],
      deps: {
        findPublishedProductsForOrderItems: async () => [productRecord()],
      },
    }),
    /สต็อกไม่เพียงพอ/
  )
})

test('rejects invalid product variants and products without images', async () => {
  await assert.rejects(
    buildOrderItemsFromRequest({
      items: [{ ...orderItem, size: 'XL' }],
      deps: {
        findPublishedProductsForOrderItems: async () => [productRecord()],
      },
    }),
    /ไซซ์ XL/
  )

  await assert.rejects(
    buildOrderItemsFromRequest({
      items: [{ ...orderItem, color: 'Red' }],
      deps: {
        findPublishedProductsForOrderItems: async () => [productRecord()],
      },
    }),
    /สี Red/
  )

  await assert.rejects(
    buildOrderItemsFromRequest({
      items: [orderItem],
      deps: {
        findPublishedProductsForOrderItems: async () => [
          productRecord({ images: [] }),
        ],
      },
    }),
    /ไม่มีรูปภาพ/
  )
})
