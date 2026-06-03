import { PAGE_SIZE } from '../../constants'
import { normalizePaginationPage } from '../../pagination'
import {
  buildProductNameSearchFilter,
  buildProductPriceFilter,
  buildProductRatingFilter,
} from '../../product-search-query'

import type { ProductDTO } from './dtos'
import { type ProductRecord, toProductDTO } from './serializers'

export type ProductListingQueryInput = {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}

export type ProductListingResult = {
  products: ProductDTO[]
  totalPages: number
  totalProducts: number
  from: number
  to: number
}

export type ProductListingQueryDeps = {
  findProducts(input: {
    conditions: Record<string, unknown>
    order: Record<string, 1 | -1>
    skip: number
    limit: number
  }): Promise<ProductRecord[]>
  countProducts(conditions: Record<string, unknown>): Promise<number>
}

function buildProductSortOrder(sort?: string): Record<string, 1 | -1> {
  if (sort === 'best-selling') return { numSales: -1 }
  if (sort === 'price-low-to-high') return { price: 1 }
  if (sort === 'price-high-to-low') return { price: -1 }
  if (sort === 'avg-customer-review') return { avgRating: -1 }

  return { _id: -1 }
}

function buildProductListingConditions({
  query,
  category,
  tag,
  price,
  rating,
}: ProductListingQueryInput): Record<string, unknown> {
  return {
    isPublished: true,
    ...buildProductNameSearchFilter(query),
    ...(tag && tag !== 'all' ? { tags: tag } : {}),
    ...(category && category !== 'all' ? { category } : {}),
    ...buildProductPriceFilter(price),
    ...buildProductRatingFilter(rating),
  }
}

export async function getProductListing({
  input,
  deps,
}: {
  input: ProductListingQueryInput
  deps: ProductListingQueryDeps
}): Promise<ProductListingResult> {
  const limit = input.limit || PAGE_SIZE
  const currentPage = normalizePaginationPage(input.page)
  const skip = limit * (currentPage - 1)
  const conditions = buildProductListingConditions(input)
  const order = buildProductSortOrder(input.sort)
  const [products, countProducts] = await Promise.all([
    deps.findProducts({
      conditions,
      order,
      skip,
      limit,
    }),
    deps.countProducts(conditions),
  ])

  return {
    products: products.map((product) => toProductDTO(product)),
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: skip + 1,
    to: skip + products.length,
  }
}
