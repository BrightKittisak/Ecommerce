'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import {
  CART_ADD_BUTTON_LABEL,
  getCartClientErrorMessage,
} from '@/lib/cart-client-copy'
import { toast } from 'sonner'
import { OrderItem } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddToCart({
  item,
  minimal = false,
}: {
  item: OrderItem
  minimal?: boolean
}) {
  const router = useRouter()
  const { addItem } = useCartStore()
  const [quantity, setQuantity] = useState(1)

  return minimal ? (
    <Button
      className='rounded-full w-auto'
      onClick={async () => {
        try {
          await addItem(item, 1)
          toast('เพิ่มลงตะกร้าแล้ว', {
            action: (
              <Button onClick={() => router.push('/cart')}>
                ไปที่ตะกร้า
              </Button>
            ),
          })
        } catch {
          toast.error(getCartClientErrorMessage())
        }
      }}
    >
      {CART_ADD_BUTTON_LABEL}
    </Button>
  ) : (
    <div className='w-full space-y-2'>
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger>
          <SelectValue>จำนวน: {quantity}</SelectValue>
        </SelectTrigger>
        <SelectContent position='popper'>
          {Array.from({ length: item.countInStock }).map((_, i) => (
            <SelectItem key={i + 1} value={`${i + 1}`}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className='rounded-full w-full'
        type='button'
        onClick={async () => {
          try {
            const itemId = await addItem(item, quantity)
            router.push(`/cart/${itemId}`)
          } catch {
            toast.error(getCartClientErrorMessage())
          }
        }}
      >
        เพิ่มลงตะกร้า
      </Button>

      <Button
        variant='secondary'
        onClick={async () => {
          try {
            await addItem(item, quantity)
            router.push(`/checkout`)
          } catch {
            toast.error(getCartClientErrorMessage())
          }
        }}
        className='w-full rounded-full '
      >
        ซื้อเลย
      </Button>
    </div>
  )
}
