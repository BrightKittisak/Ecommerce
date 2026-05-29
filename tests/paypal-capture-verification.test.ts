import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatPayPalAmount,
  verifyPayPalCapture,
} from '../lib/paypal-capture-verification'

const validCaptureData = {
  id: 'PAYPAL-ORDER-1',
  status: 'COMPLETED',
  payer: {
    email_address: 'buyer@example.com',
  },
  purchase_units: [
    {
      payments: {
        captures: [
          {
            id: 'CAPTURE-1',
            status: 'COMPLETED',
            amount: {
              currency_code: 'THB',
              value: '120.50',
            },
          },
        ],
      },
    },
  ],
}

test('formats PayPal amounts with two decimal places', () => {
  assert.equal(formatPayPalAmount(120), '120.00')
  assert.equal(formatPayPalAmount(120.5), '120.50')
  assert.equal(formatPayPalAmount(120.555), '120.56')
})

test('accepts a completed PayPal capture that matches the order facts', () => {
  const verifiedCapture = verifyPayPalCapture({
    captureData: validCaptureData,
    expectedOrderId: 'PAYPAL-ORDER-1',
    expectedTotalPrice: 120.5,
  })

  assert.deepEqual(verifiedCapture, {
    captureId: 'CAPTURE-1',
    status: 'COMPLETED',
    payerEmail: 'buyer@example.com',
    pricePaid: '120.50',
  })
})

test('rejects captures for a different PayPal order id', () => {
  assert.throws(
    () =>
      verifyPayPalCapture({
        captureData: validCaptureData,
        expectedOrderId: 'PAYPAL-ORDER-2',
        expectedTotalPrice: 120.5,
      }),
    /Invalid PayPal capture/
  )
})

test('rejects captures with a mismatched amount', () => {
  assert.throws(
    () =>
      verifyPayPalCapture({
        captureData: validCaptureData,
        expectedOrderId: 'PAYPAL-ORDER-1',
        expectedTotalPrice: 121,
      }),
    /Invalid PayPal capture/
  )
})

test('rejects captures with a mismatched currency', () => {
  assert.throws(
    () =>
      verifyPayPalCapture({
        captureData: validCaptureData,
        expectedOrderId: 'PAYPAL-ORDER-1',
        expectedTotalPrice: 120.5,
        expectedCurrencyCode: 'USD',
      }),
    /Invalid PayPal capture/
  )
})

test('rejects captures that are not completed', () => {
  assert.throws(
    () =>
      verifyPayPalCapture({
        captureData: {
          ...validCaptureData,
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    ...validCaptureData.purchase_units[0].payments
                      .captures[0],
                    status: 'PENDING',
                  },
                ],
              },
            },
          ],
        },
        expectedOrderId: 'PAYPAL-ORDER-1',
        expectedTotalPrice: 120.5,
      }),
    /Invalid PayPal capture/
  )
})
