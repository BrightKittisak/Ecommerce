import type { ProductDTO } from './dtos'
import {
  type ProductRecord,
  toProductDTO,
} from './serializers'

const MAX_RELATED_PRODUCTS = 24

type BrowsingHistoryQuery =
  | {
      listType: 'history'
      productIds: string[]
      categories: string[]
    }
  | {
      listType: 'related'
      productIds: string[]
      categories: string[]
    }

export type BrowsingHistoryProductDeps = {
  findBrowsingHistoryProducts(input: {
    filter: Record<string, unknown>
    limit: number
  }): Promise<ProductRecord[]>
}

export async function getBrowsingHistoryProducts({
  query,
  deps,
}: {
  query: BrowsingHistoryQuery
  deps: BrowsingHistoryProductDeps
}): Promise<ProductDTO[]> {
  const filter =
    query.listType === 'history'
      ? {
          _id: { $in: query.productIds },
        }
      : { category: { $in: query.categories }, _id: { $nin: query.productIds } }

  const products = await deps.findBrowsingHistoryProducts({
    filter,
    limit:
      query.listType === 'history'
        ? query.productIds.length
        : MAX_RELATED_PRODUCTS,
  })

  if (query.listType !== 'history') {
    return products.map((product) => toProductDTO(product))
  }

  return products
    .sort(
      (a, b) =>
        query.productIds.indexOf(a._id.toString()) -
        query.productIds.indexOf(b._id.toString())
    )
    .map((product) => toProductDTO(product))
}
