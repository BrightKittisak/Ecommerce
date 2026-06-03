import { normalizePaginationPage } from '../../pagination'

import type { ProductDTO } from './dtos'
import { type ProductRecord, toProductDTO } from './serializers'

export type RelatedProductsByCategoryInput = {
  category: string
  productId: string
  limit: number
  page: number
}

export type RelatedProductsByCategoryResult = {
  data: ProductDTO[]
  totalPages: number
}

export type RelatedProductsQueryDeps = {
  findRelatedProductsByCategory(input: {
    conditions: Record<string, unknown>
    skip: number
    limit: number
  }): Promise<ProductRecord[]>
  countRelatedProductsByCategory(
    conditions: Record<string, unknown>
  ): Promise<number>
}

export async function getRelatedProductsByCategoryQuery({
  input,
  deps,
}: {
  input: RelatedProductsByCategoryInput
  deps: RelatedProductsQueryDeps
}): Promise<RelatedProductsByCategoryResult> {
  const currentPage = normalizePaginationPage(input.page)
  const skip = (currentPage - 1) * input.limit
  const conditions = {
    isPublished: true,
    category: input.category,
    _id: { $ne: input.productId },
  }

  const [products, productsCount] = await Promise.all([
    deps.findRelatedProductsByCategory({
      conditions,
      skip,
      limit: input.limit,
    }),
    deps.countRelatedProductsByCategory(conditions),
  ])

  return {
    data: products.map((product) => toProductDTO(product)),
    totalPages: Math.ceil(productsCount / input.limit),
  }
}
