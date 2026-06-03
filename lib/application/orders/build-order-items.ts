import type { CreateOrderInput, OrderItem } from '../../../types'
import { round2 } from '../../utils'

type IdLike = {
  toString(): string
}

export type OrderItemProductRecord = {
  _id: string | IdLike
  name: string
  slug: string
  category: string
  images?: string[]
  price: number
  countInStock: number
  sizes?: string[]
  colors?: string[]
}

export type BuildOrderItemsDeps = {
  findPublishedProductsForOrderItems(
    productIds: string[]
  ): Promise<OrderItemProductRecord[]>
}

export async function buildOrderItemsFromRequest({
  items,
  deps,
}: {
  items: CreateOrderInput['items']
  deps: BuildOrderItemsDeps
}): Promise<OrderItem[]> {
  const productIds = [...new Set(items.map((item) => item.product))]
  const products = await deps.findPublishedProductsForOrderItems(productIds)
  const productById = new Map(
    products.map((product) => [String(product._id), product])
  )

  return items.map((item) => {
    const product = productById.get(item.product)

    if (!product) {
      throw new Error('ไม่พบสินค้าที่ต้องการสั่งซื้อ')
    }

    if (item.quantity > product.countInStock) {
      throw new Error(`สินค้า ${product.name} มีในสต็อกไม่เพียงพอ`)
    }

    const sizes = product.sizes ?? []
    if (item.size && sizes.length > 0 && !sizes.includes(item.size)) {
      throw new Error(`ไซซ์ ${item.size} ของสินค้า ${product.name} ไม่ถูกต้อง`)
    }

    const colors = product.colors ?? []
    if (item.color && colors.length > 0 && !colors.includes(item.color)) {
      throw new Error(`สี ${item.color} ของสินค้า ${product.name} ไม่ถูกต้อง`)
    }

    const primaryImage = product.images?.[0]
    if (!primaryImage) {
      throw new Error(`สินค้า ${product.name} ไม่มีรูปภาพสำหรับสร้างคำสั่งซื้อ`)
    }

    return {
      clientId: item.clientId,
      product: String(product._id),
      name: product.name,
      slug: product.slug,
      category: product.category,
      quantity: item.quantity,
      countInStock: product.countInStock,
      image: primaryImage,
      price: round2(product.price),
      size: item.size,
      color: item.color,
    }
  })
}
