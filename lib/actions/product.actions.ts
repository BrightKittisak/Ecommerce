'use server'

import { unstable_cache } from 'next/cache'

import {
  ProductRecord,
  toProductDTO,
} from '@/lib/application/products/serializers'
import { getRelatedProductsByCategoryQuery } from '@/lib/application/products/related-products-query'
import {
  getProductCardLinksByTag,
  getProductDTOsByTag,
} from '@/lib/application/products/product-tag-queries'
import { getPublishedProductBySlug } from '@/lib/application/products/product-slug-query'
import {
  getPublishedCatalogCategories,
  getPublishedCatalogTags,
} from '@/lib/application/products/catalog-facet-queries'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { productCatalogFacetDeps } from '@/lib/infrastructure/products/product-catalog-facet-deps'
import { relatedProductsQueryDeps } from '@/lib/infrastructure/products/related-products-query-deps'
import { productSlugQueryDeps } from '@/lib/infrastructure/products/product-slug-query-deps'
import { productTagQueryDeps } from '@/lib/infrastructure/products/product-tag-query-deps'
import {
  buildProductNameSearchFilter,
  buildProductPriceFilter,
  buildProductRatingFilter,
} from '@/lib/product-search-query'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'
import { normalizePaginationPage } from '../pagination'
import { PAGE_SIZE } from '../constants'

const CATALOG_CACHE_REVALIDATE_SECONDS = 5 * 60

const getPublishedCategories = unstable_cache(
  async () => {
    await connectToDatabase()
    return getPublishedCatalogCategories({ deps: productCatalogFacetDeps })
  },
  ['published-categories'],
  {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: ['catalog', 'categories'],
  }
)

const getPublishedTags = unstable_cache(
  async () => {
    await connectToDatabase()
    return getPublishedCatalogTags({ deps: productCatalogFacetDeps })
  },
  ['published-tags'],
  {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: ['catalog', 'tags'],
  }
)

const getCachedProductsForCard = unstable_cache(
  async (tag: string, limit: number) => {
    await connectToDatabase()
    return getProductCardLinksByTag({
      tag,
      limit,
      deps: productTagQueryDeps,
    })
  },
  ['products-for-card'],
  {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: ['catalog', 'products'],
  }
)

const getCachedProductsByTag = unstable_cache(
  async (tag: string, limit: number) => {
    await connectToDatabase()
    return getProductDTOsByTag({
      tag,
      limit,
      deps: productTagQueryDeps,
    })
  },
  ['products-by-tag'],
  {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: ['catalog', 'products'],
  }
)

const getCachedProductBySlug = unstable_cache(
  async (slug: string) => {
    await connectToDatabase()
    return getPublishedProductBySlug({ slug, deps: productSlugQueryDeps })
  },
  ['product-by-slug'],
  {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: ['catalog', 'products'],
  }
)

const getCachedRelatedProductsByCategory = unstable_cache(
  async ({
    category,
    productId,
    limit,
    page,
  }: {
    category: string
    productId: string
    limit: number
    page: number
  }) => {
    await connectToDatabase()
    return getRelatedProductsByCategoryQuery({
      input: {
        category,
        productId,
        limit,
        page,
      },
      deps: relatedProductsQueryDeps,
    })
  },
  ['related-products-by-category'],
  {
    revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
    tags: ['catalog', 'products'],
  }
)

export async function getAllCategories() {
  return getPublishedCategories()
}

export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  return getCachedProductsForCard(tag, limit)
}

export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  return getCachedProductsByTag(tag, limit)
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  return getCachedProductBySlug(slug)
}

// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = PAGE_SIZE,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  return getCachedRelatedProductsByCategory({
    category,
    productId,
    limit,
    page,
  })
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}) {
  limit = limit || PAGE_SIZE
  const currentPage = normalizePaginationPage(page)
  await connectToDatabase()

  const queryFilter = buildProductNameSearchFilter(query)
  const categoryFilter = category && category !== 'all' ? { category } : {}
  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const ratingFilter = buildProductRatingFilter(rating)
  const priceFilter = buildProductPriceFilter(price)
  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const isPublished = { isPublished: true }
  const conditions = {
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  }
  const [products, countProducts] = await Promise.all([
    Product.find(conditions, PRODUCT_CARD_FIELDS)
      .sort(order)
      .skip(limit * (currentPage - 1))
      .limit(limit)
      .lean<ProductRecord[]>(),
    Product.countDocuments(conditions),
  ])
  return {
    products: products.map((product) => toProductDTO(product)),
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (currentPage - 1) + 1,
    to: limit * (currentPage - 1) + products.length,
  }
}

export async function getAllTags() {
  return getPublishedTags()
}
