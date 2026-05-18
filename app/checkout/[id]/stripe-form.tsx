import {
    LinkAuthenticationElement,
    PaymentElement,
    useElements,
    useStripe,
  } from '@stripe/react-stripe-js'
  import { FormEvent, useState } from 'react'
  
  import { Button } from '@/components/ui/button'
  import ProductPrice from '@/components/shared/product/product-price'
  import { SERVER_URL } from '@/lib/constants'
  
  export default function StripeForm({
    priceInCents,
    orderId,
  }: {
    priceInCents: number
    orderId: string
  }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>()
    const [email, setEmail] = useState<string>()
  
    async function handleSubmit(e: FormEvent) {
      e.preventDefault()
  
      if (stripe == null || elements == null || email == null) return
  
      setIsLoading(true)
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${SERVER_URL}/checkout/${orderId}/stripe-payment-success`,
        },
      })

      if (!error) {
        setIsLoading(false)
        return
      }

      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
      }

      setIsLoading(false)
    }
  
    return (
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='text-xl'>ชำระเงินผ่าน Stripe</div>
        {errorMessage && <div className='text-destructive'>{errorMessage}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
        </div>
        <Button
          className='w-full'
          size='lg'
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading ? (
            'กำลังชำระเงิน...'
          ) : (
            <div>
              ชำระเงิน - <ProductPrice price={priceInCents / 100} plain />
            </div>
          )}
        </Button>
      </form>
    )
  }
