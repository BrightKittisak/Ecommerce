import type { ProductDTO } from './dtos'
import { type ProductRecord, toProductDTO } from './serializers'

export type ProductSlugQueryDeps = {
  findPublishedProductBySlug(slug: string): Promise<ProductRecord | null>
}

export async function getPublishedProductBySlug({
  slug,
  deps,
}: {
  slug: string
  deps: ProductSlugQueryDeps
}): Promise<ProductDTO> {
  const product = await deps.findPublishedProductBySlug(slug)
  if (!product) throw new Error('ไม่พบสินค้า')

  return toProductDTO(product)
}
