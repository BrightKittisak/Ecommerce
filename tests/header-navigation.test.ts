import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('does not render duplicate desktop header links', () => {
  const source = readFileSync('components/shared/header/index.tsx', 'utf8')
  const renderedDesktopNavigation = source.slice(
    source.indexOf('<div className='),
    source.indexOf('<HeaderDropdown')
  )

  assert.equal(
    renderedDesktopNavigation.match(/href='\/page\/customer-service'/g)
      ?.length ?? 0,
    0
  )
  assert.equal(source.includes("href: '/page/customer-service'"), true)
})

test('primes header categories from the server cache', () => {
  const headerSource = readFileSync('components/shared/header/index.tsx', 'utf8')
  const searchSource = readFileSync('components/shared/header/search.tsx', 'utf8')
  const sidebarSource = readFileSync('components/shared/header/sidebar.tsx', 'utf8')
  const hookSource = readFileSync('hooks/use-catalog-categories.ts', 'utf8')

  assert.equal(
    headerSource.includes(
      "import { getAllCategories } from '@/lib/actions/product.actions'"
    ),
    true
  )
  assert.equal(
    headerSource.includes('const categories = await getAllCategories()'),
    true
  )
  assert.equal(
    headerSource.includes('<Search initialCategories={categories} />'),
    true
  )
  assert.equal(
    headerSource.includes('<Sidebar initialCategories={categories} />'),
    true
  )
  assert.equal(
    searchSource.includes('useCatalogCategories(initialCategories)'),
    true
  )
  assert.equal(
    sidebarSource.includes('useCatalogCategories(initialCategories)'),
    true
  )
  assert.equal(
    hookSource.includes('if (initialCategories.length > 0) return'),
    true
  )
})
