const MAX_PRODUCT_SEARCH_QUERY_LENGTH = 80

export function normalizeProductSearchQuery(query: string) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery || trimmedQuery === 'all') return null

  return trimmedQuery.slice(0, MAX_PRODUCT_SEARCH_QUERY_LENGTH)
}

export function escapeRegexLiteral(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildProductNameSearchFilter(query: string) {
  const normalizedQuery = normalizeProductSearchQuery(query)

  if (!normalizedQuery) return {}

  return {
    name: {
      $regex: escapeRegexLiteral(normalizedQuery),
      $options: 'i',
    },
  }
}

export function buildProductRatingFilter(rating?: string) {
  if (!rating || rating === 'all') return {}

  const minimumRating = Number(rating)

  if (
    !Number.isFinite(minimumRating) ||
    minimumRating < 1 ||
    minimumRating > 5
  ) {
    return {}
  }

  return {
    avgRating: {
      $gte: minimumRating,
    },
  }
}

export function buildProductPriceFilter(price?: string) {
  if (!price || price === 'all') return {}

  const priceRange = price.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/)
  if (!priceRange) return {}

  const [, minimumPriceValue, maximumPriceValue] = priceRange
  const minimumPrice = Number(minimumPriceValue)
  const maximumPrice = Number(maximumPriceValue)

  if (
    !Number.isFinite(minimumPrice) ||
    !Number.isFinite(maximumPrice) ||
    minimumPrice < 0 ||
    maximumPrice < minimumPrice
  ) {
    return {}
  }

  return {
    price: {
      $gte: minimumPrice,
      $lte: maximumPrice,
    },
  }
}
