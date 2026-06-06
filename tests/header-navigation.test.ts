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
