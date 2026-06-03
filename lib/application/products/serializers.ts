import { serializeTypedForClient } from '../../serialization'

import type { ProductDTO, ProductRatingDistributionDTO } from './dtos'

type IdLike = {
  toString(): string
}

export type ProductRecord = {
  _id: string | IdLike
  name: string
  slug: string
  category: string
  images?: string[]
  brand: string
  description?: string
  price: number
  listPrice: number
  countInStock: number
  tags?: string[]
  colors?: string[]
  sizes?: string[]
  avgRating: number
  numReviews: number
  ratingDistribution?: ProductRatingDistributionDTO[]
  numSales?: number
  isPublished?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const toId = (value: string | IdLike) => value.toString()

export const toProductDTO = (product: ProductRecord): ProductDTO => {
  return serializeTypedForClient({
    _id: toId(product._id),
    name: product.name,
    slug: product.slug,
    category: product.category,
    images: product.images ?? [],
    brand: product.brand,
    description: product.description,
    price: product.price,
    listPrice: product.listPrice,
    countInStock: product.countInStock,
    tags: product.tags ?? [],
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    avgRating: product.avgRating,
    numReviews: product.numReviews,
    ratingDistribution: product.ratingDistribution ?? [],
    numSales: product.numSales,
    isPublished: product.isPublished,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  })
}
