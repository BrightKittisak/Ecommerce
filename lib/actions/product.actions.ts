'use server'

import { unstable_cache } from 'next/cache'

import { getProductListing } from '@/lib/application/products/product-listing-query'
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
import { productCatalogFacetDeps } from '@/lib/infrastructure/products/product-catalog-facet-deps'
import { productListingQueryDeps } from '@/lib/infrastructure/products/product-listing-query-deps'
import { relatedProductsQueryDeps } from '@/lib/infrastructure/products/related-products-query-deps'
import { productSlugQueryDeps } from '@/lib/infrastructure/products/product-slug-query-deps'
import { productTagQueryDeps } from '@/lib/infrastructure/products/product-tag-query-deps'
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
  await connectToDatabase()
  return getProductListing({
    input: {
      query,
      category,
      tag,
      limit,
      page,
      price,
      rating,
      sort,
    },
    deps: productListingQueryDeps,
  })
}

export async function getAllTags() {
  return getPublishedTags()
}
