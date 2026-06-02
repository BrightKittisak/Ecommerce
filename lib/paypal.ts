import { formatPayPalAmount } from './paypal-capture-verification'
import { CURRENCY_CODE } from './utils'

const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

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
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_APP_SECRET).toString(
    'base64'
  )
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
