const MAX_PRODUCT_IDS = 24
const MAX_CATEGORIES = 12
const MONGO_ID_PATTERN = /^[0-9a-fA-F]{24}$/

export type BrowsingHistoryListType = 'history' | 'related'

export type BrowsingHistoryQuery = {
  listType: BrowsingHistoryListType
  productIds: string[]
  categories: string[]
}

const parseCommaSeparatedValues = (value: string | null) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const uniqueValues = (values: string[]) => [...new Set(values)]

export function parseBrowsingHistoryQuery(
  searchParams: URLSearchParams
): BrowsingHistoryQuery | null {
  const listType =
    searchParams.get('type') === 'related' ? 'related' : 'history'
  const productIds = uniqueValues(
    parseCommaSeparatedValues(searchParams.get('ids')).filter((id) =>
      MONGO_ID_PATTERN.test(id)
    )
  ).slice(0, MAX_PRODUCT_IDS)
  const categories = uniqueValues(
    parseCommaSeparatedValues(searchParams.get('categories'))
  ).slice(0, MAX_CATEGORIES)

  if (productIds.length === 0 || categories.length === 0) {
    return null
  }

  return {
    listType,
    productIds,
    categories,
  }
}
