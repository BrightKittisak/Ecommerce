import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('critical auth and order paths avoid identity non-null assertions', () => {
  const authSource = readFileSync('auth.ts', 'utf8')
  const orderSource = readFileSync('lib/actions/order.actions.ts', 'utf8')

  assert.equal(authSource.includes('user.email!'), false)
  assert.equal(orderSource.includes('session.user.id!'), false)
  assert.equal(
    orderSource.includes("if (!session?.user?.id) throw new Error"),
    true
  )
})
