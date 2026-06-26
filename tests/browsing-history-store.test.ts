import assert from 'node:assert/strict'
import test from 'node:test'

import { updateBrowsingHistoryProducts } from '../hooks/use-browsing-history'

test('adds a browsed product to the front of browsing history', () => {
  const products = updateBrowsingHistoryProducts(
    [{ id: 'older-product', category: 'Shoes' }],
    { id: 'new-product', category: 'Bags' }
  )

  assert.deepEqual(products, [
    { id: 'new-product', category: 'Bags' },
    { id: 'older-product', category: 'Shoes' },
  ])
})

test('moves an existing browsed product to the front without mutating input', () => {
  const existingProducts = [
    { id: 'first-product', category: 'Shoes' },
    { id: 'second-product', category: 'Bags' },
  ]

  const products = updateBrowsingHistoryProducts(existingProducts, {
    id: 'second-product',
    category: 'Bags',
  })

  assert.deepEqual(products, [
    { id: 'second-product', category: 'Bags' },
    { id: 'first-product', category: 'Shoes' },
  ])
  assert.deepEqual(existingProducts, [
    { id: 'first-product', category: 'Shoes' },
    { id: 'second-product', category: 'Bags' },
  ])
})

test('caps browsing history to the latest ten products', () => {
  const existingProducts = Array.from({ length: 10 }, (_, index) => ({
    id: `product-${index}`,
    category: 'Shoes',
  }))

  const products = updateBrowsingHistoryProducts(existingProducts, {
    id: 'new-product',
    category: 'Bags',
  })

  assert.equal(products.length, 10)
  assert.equal(products[0].id, 'new-product')
  assert.equal(products.at(-1)?.id, 'product-8')
})
