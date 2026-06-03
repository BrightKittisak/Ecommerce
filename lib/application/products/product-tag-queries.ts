import type { ProductDTO } from './dtos'
import {
  type ProductRecord,
  toProductDTO,
} from './serializers'

export type ProductCardLinkRecord = {
  name: string
  slug: string
  images?: string[]
}

export type ProductTagQueryDeps = {
  findProductCardLinksByTag(input: {
    tag: string
    limit: number
  }): Promise<ProductCardLinkRecord[]>
  findProductsByTag(input: {
    tag: string
    limit: number
  }): Promise<ProductRecord[]>
}

export async function getProductCardLinksByTag({
  tag,
  limit,
  deps,
}: {
  tag: string
  limit: number
  deps: ProductTagQueryDeps
}) {
  const products = await deps.findProductCardLinksByTag({ tag, limit })
  return products.map((product) => ({
    name: product.name,
    href: `/product/${product.slug}`,
    image: product.images?.[0] ?? '',
  })) as {
    name: string
    href: string
    image: string
  }[]
}

export async function getProductDTOsByTag({
  tag,
  limit,
  deps,
}: {
  tag: string
  limit: number
  deps: ProductTagQueryDeps
}): Promise<ProductDTO[]> {
  const products = await deps.findProductsByTag({ tag, limit })
  return products.map((product) => toProductDTO(product))
}
