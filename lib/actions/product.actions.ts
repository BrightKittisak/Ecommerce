'use server'

import { unstable_cache } from 'next/cache'

import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import {
  normalizeCatalogFacetValues,
  normalizePublishedTagLabels,
} from '@/lib/catalog-facets'
import {
  buildProductNameSearchFilter,
  buildProductPriceFilter,
  buildProductRatingFilter,
} from '@/lib/product-search-query'
import { PRODUCT_CARD_FIELDS } from '@/lib/product-query-fields'
import { serializeForClient } from '@/lib/serialization'
import { normalizePaginationPage } from '../pagination'
import { PAGE_SIZE } from '../constants'

const CATALOG_CACHE_REVALIDATE_SECONDS = 5 * 60

const getPublishedCategories = unstable_cache(
  async () => {
    await connectToDatabase()
    const categories = await Product.find({ isPublished: true }).distinct(
      'category'
    )

    return normalizeCatalogFacetValues(categories)
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
    const tags = await Product.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
      { $project: { _id: 0, uniqueTags: 1 } },
    ])

    return normalizePublishedTagLabels(tags)
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
    const products = await Product.find(
      { tags: { $in: [tag] }, isPublished: true },
      { name: 1, slug: 1, images: 1 }
    )
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .lean()

    return products.map((product) => ({
      name: product.name,
      href: `/product/${product.slug}`,
      image: product.images[0],
    })) as {
      name: string
      href: string
      image: string
    }[]
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
    const products = await Product.find({
      tags: { $in: [tag] },
      isPublished: true,
    }, PRODUCT_CARD_FIELDS)
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .lean()
    return serializeForClient(products) as IProduct[]
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
    const product = await Product.findOne({ slug, isPublished: true }).lean()
    if (!product) throw new Error('ไม่พบสินค้า')
    return serializeForClient(product) as IProduct
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
    const currentPage = normalizePaginationPage(page)
    const skipAmount = (currentPage - 1) * limit
    const conditions = {
      isPublished: true,
      category,
      _id: { $ne: productId },
    }
    const products = await Product.find(conditions, PRODUCT_CARD_FIELDS)
      .sort({ numSales: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .lean()
    const productsCount = await Product.countDocuments(conditions)
    return {
      data: serializeForClient(products) as IProduct[],
      totalPages: Math.ceil(productsCount / limit),
    }
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
      .lean(),
    Product.countDocuments(conditions),
  ])
  return {
    products: serializeForClient(products) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (currentPage - 1) + 1,
    to: limit * (currentPage - 1) + products.length,
  }
}

export async function getAllTags() {
  return getPublishedTags()
}
