const DEFAULT_MAX_PAGE = 1000

export function normalizePaginationPage(
  page: unknown,
  { maxPage = DEFAULT_MAX_PAGE }: { maxPage?: number } = {}
) {
  const numericPage =
    typeof page === 'number'
      ? page
      : typeof page === 'string'
        ? Number(page)
        : 1

  if (!Number.isFinite(numericPage) || !Number.isInteger(numericPage)) {
    return 1
  }

  return Math.min(Math.max(numericPage, 1), maxPage)
}
