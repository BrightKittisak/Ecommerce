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
