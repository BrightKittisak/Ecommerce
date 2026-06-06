import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (path: string) => readFileSync(path, 'utf8')

test('localizes screen-reader-only labels in shared primitives', () => {
  const carouselSource = readSource('components/ui/carousel.tsx')
  const dialogSource = readSource('components/ui/dialog.tsx')
  const sheetSource = readSource('components/ui/sheet.tsx')
  const sidebarSource = readSource('components/shared/header/sidebar.tsx')

  assert.equal(carouselSource.includes('Previous slide'), false)
  assert.equal(carouselSource.includes('Next slide'), false)
  assert.equal(dialogSource.includes('>Close<'), false)
  assert.equal(sheetSource.includes('>Close<'), false)
  assert.equal(sidebarSource.includes('>Close<'), false)

  assert.equal(carouselSource.includes('สไลด์ก่อนหน้า'), true)
  assert.equal(carouselSource.includes('สไลด์ถัดไป'), true)
  assert.equal(dialogSource.includes('>ปิด<'), true)
  assert.equal(sheetSource.includes('>ปิด<'), true)
  assert.equal(sidebarSource.includes('>ปิด<'), true)
})
