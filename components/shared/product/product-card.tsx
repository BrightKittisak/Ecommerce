import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { IProduct } from '@/lib/db/models/product.model'
import { translateCategory } from '@/lib/i18n'
import { formatNumber, generateId, round2 } from '@/lib/utils'

import AddToCart from './add-to-cart'
import ImageHover from './image-hover'
import ProductPrice from './product-price'
import Rating from './rating'

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
}: {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
  hideAddToCart?: boolean
}) => {
  const ProductImage = () => (
    <Link href={`/product/${product.slug}`}>
      <div className='relative h-56 overflow-hidden rounded-[1.4rem] bg-secondary/50'>
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className='relative h-56'>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes='(max-width: 768px) 90vw, (max-width: 1200px) 40vw, 20vw'
              className='object-contain p-5 transition-transform duration-500 hover:scale-105'
            />
          </div>
        )}
      </div>
    </Link>
  )

  const ProductDetails = () => (
    <div className='flex-1 space-y-3'>
      <div className='flex items-center justify-between gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground'>
        <p>{product.brand}</p>
        <p>{translateCategory(product.category)}</p>
      </div>
      <Link
        href={`/product/${product.slug}`}
        className='overflow-hidden text-left text-base font-semibold text-foreground text-ellipsis'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {product.name}
      </Link>
      <div className='flex justify-start gap-2'>
        <Rating rating={product.avgRating} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>

      <ProductPrice
        isDeal={product.tags.includes('todays-deal')}
        price={product.price}
        listPrice={product.listPrice}
        forListing
      />
    </div>
  )

  const AddButton = () => (
    <div className='w-full text-center'>
      <AddToCart
        minimal
        item={{
          clientId: generateId(),
          product: product._id,
          size: product.sizes[0],
          color: product.colors[0],
          countInStock: product.countInStock,
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: round2(product.price),
          quantity: 1,
          image: product.images[0],
        }}
      />
    </div>
  )

  return hideBorder ? (
    <div className='flex flex-col'>
      <ProductImage />
      {!hideDetails && (
        <>
          <div className='flex-1 p-3 text-center'>
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card className='flex h-full flex-col overflow-hidden border-border/60 bg-card/90 shadow-[0_24px_80px_-48px_rgba(47,32,21,0.65)] transition-transform duration-300 hover:-translate-y-1'>
      <CardHeader className='p-3'>
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className='flex-1 p-4 pt-1'>
            <ProductDetails />
          </CardContent>
          <CardFooter className='p-4 pt-0'>
            {!hideAddToCart && <AddButton />}
          </CardFooter>
        </>
      )}
    </Card>
  )
}

export default ProductCard
