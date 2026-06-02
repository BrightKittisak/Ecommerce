import { formatPayPalAmount } from './paypal-capture-verification'
import {
  getPayPalApiBaseUrl,
  getPayPalAppSecret,
  getPayPalClientId,
} from './paypal-config'
import { CURRENCY_CODE } from './utils'

type PayPalAccessTokenResponse = {
  access_token: string
}

type PayPalOrderResponse = {
  id: string
}

type PayPalCaptureResponse = {
  id?: string
  status?: string
  payer?: {
    email_address?: string
  }
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string
        status?: string
        amount?: {
          currency_code?: string
          value?: string
        }
      }>
    }
  }>
}

export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken()
    const base = getPayPalApiBaseUrl()
    const url = `${base}/v2/checkout/orders`
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: CURRENCY_CODE,
              value: formatPayPalAmount(price),
            },
          },
        ],
      }),
    })
    return handleResponse<PayPalOrderResponse>(response)
  },
  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken()
    const base = getPayPalApiBaseUrl()
    const url = `${base}/v2/checkout/orders/${orderId}/capture`
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return handleResponse<PayPalCaptureResponse>(response)
  },
}

async function generateAccessToken() {
  const auth = Buffer.from(
    `${getPayPalClientId()}:${getPayPalAppSecret()}`
  ).toString('base64')
  const base = getPayPalApiBaseUrl()
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const jsonData = await handleResponse<PayPalAccessTokenResponse>(response)
  return jsonData.access_token
}

async function handleResponse<T = unknown>(response: Response): Promise<T> {
  if (response.status === 200 || response.status === 201) {
    return (await response.json()) as T
  }

  const errorMessage = (await response.text()) || response.statusText
  throw new Error(errorMessage)
}
