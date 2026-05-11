'use client'

import { IProduct } from '@/lib/db/models/product.model'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

import ProductCard from './product-card'

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string
  products: IProduct[]
  hideDetails?: boolean
}) {
  return (
    <div className='w-full'>
      <div className='mb-5 flex items-end justify-between gap-4'>
        <div>
          <p className='eyebrow mb-2'>คัดมาให้ดูต่อได้เลย</p>
          <h2 className='h2-bold'>{title}</h2>
        </div>
      </div>
      <Carousel
        opts={{
          align: 'start',
        }}
        className='w-full'
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.slug}
              className={
                hideDetails
                  ? 'md:basis-1/4 lg:basis-1/6'
                  : 'md:basis-1/3 lg:basis-1/5'
              }
            >
              <ProductCard
                hideDetails={hideDetails}
                hideAddToCart
                hideBorder
                product={product}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-2 border-border/60 bg-card/90' />
        <CarouselNext className='right-2 border-border/60 bg-card/90' />
      </Carousel>
    </div>
  )
}
