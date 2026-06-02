const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const sortLabels = (values: string[]) =>
  [...values].sort((a, b) => a.localeCompare(b))

export function normalizeCatalogFacetValues(values: unknown) {
  if (!Array.isArray(values)) return []

  const normalized = values
    .filter(isNonEmptyString)
    .map((value) => value.trim())

  return sortLabels([...new Set(normalized)])
}

export function formatCatalogTagLabel(tag: string) {
  return tag
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function normalizePublishedTagLabels(aggregationRows: unknown) {
  if (!Array.isArray(aggregationRows)) return []

  const firstRow = aggregationRows[0]

  if (
    typeof firstRow !== 'object' ||
    firstRow === null ||
    !('uniqueTags' in firstRow)
  ) {
    return []
  }

  return normalizeCatalogFacetValues(firstRow.uniqueTags).map(formatCatalogTagLabel)
}
