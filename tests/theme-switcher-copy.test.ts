import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('uses the localized header theme switcher instead of the legacy copy', () => {
  const headerMenuSource = readFileSync('components/shared/header/menu.tsx', 'utf8')
  const themeSwitcherSource = readFileSync(
    'components/shared/header/theme-switcher.tsx',
    'utf8'
  )

  assert.equal(existsSync('components/shared/theme-switcher.tsx'), false)
  assert.equal(headerMenuSource.includes("import ThemeSwitcher from './theme-switcher'"), true)
  assert.equal(themeSwitcherSource.includes('ธีมการแสดงผล'), true)
  assert.equal(themeSwitcherSource.includes('โหมดกลางคืน'), true)
  assert.equal(themeSwitcherSource.includes('<DropdownMenuLabel>Theme'), false)
  assert.equal(themeSwitcherSource.includes('<DropdownMenuLabel>Color'), false)
})
