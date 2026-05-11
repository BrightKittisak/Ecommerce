import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { auth } from '@/auth'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import AddToCart from '@/components/shared/product/add-to-cart'
import ProductGallery from '@/components/shared/product/product-gallery'
import ProductPrice from '@/components/shared/product/product-price'
import ProductSlider from '@/components/shared/product/product-slider'
import RatingSummary from '@/components/shared/product/rating-summary'
import SelectVariant from '@/components/shared/product/select-variant'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'
import { translateCategory } from '@/lib/i18n'
import { generateId, round2 } from '@/lib/utils'

import ReviewList from './review-list'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const product = await getProductBySlug(params.slug)
  if (!product) {
    return { title: 'ไม่พบสินค้า' }
  }
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string; color: string; size: string }>
}) {
  const searchParams = await props.searchParams
  const { page, color, size } = searchParams
  const params = await props.params
  const { slug } = params

  const product = await getProductBySlug(slug)
  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(page || '1'),
  })

  const session = await auth()

  return (
    <div>
      <AddToBrowsingHistory id={product._id} category={product.category} />
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          <div className='col-span-2'>
            <ProductGallery images={product.images} />
          </div>

          <div className='col-span-2 flex w-full flex-col gap-2 md:p-5'>
            <div className='flex flex-col gap-3'>
              <p className='rounded-full bg-secondary/70 px-3 py-2 text-sm text-muted-foreground'>
                แบรนด์ {product.brand} • {translateCategory(product.category)}
              </p>
              <h1 className='text-lg font-bold lg:text-xl'>{product.name}</h1>
              <div className='flex items-center gap-2'>
                <RatingSummary
                  avgRating={product.avgRating}
                  numReviews={product.numReviews}
                  asPopover
                  ratingDistribution={product.ratingDistribution}
                />
              </div>
              <Separator />
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <div className='flex gap-3'>
                  <ProductPrice
                    price={product.price}
                    listPrice={product.listPrice}
                    isDeal={product.tags.includes('todays-deal')}
                    forListing={false}
                  />
                </div>
              </div>
            </div>
            <div>
              <SelectVariant
                product={product}
                size={size || product.sizes[0]}
                color={color || product.colors[0]}
              />
            </div>
            <Separator className='my-2' />
            <div className='flex flex-col gap-2'>
              <p className='text-lg font-bold text-foreground'>
                รายละเอียดสินค้า:
              </p>
              <p className='text-sm leading-7 text-muted-foreground lg:text-base'>
                {product.description}
              </p>
            </div>
          </div>
          <div>
            <Card className='border-border/60 bg-card/90'>
              <CardContent className='flex flex-col gap-4 p-4'>
                <ProductPrice price={product.price} />

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className='font-bold text-destructive'>
                    เหลือในสต็อกอีกเพียง {product.countInStock} ชิ้น ควรสั่งซื้อเร็ว
                    ๆ นี้
                  </div>
                )}
                {product.countInStock !== 0 ? (
                  <div className='text-xl text-green-700'>พร้อมส่ง</div>
                ) : (
                  <div className='text-xl text-destructive'>สินค้าหมด</div>
                )}
                {product.countInStock !== 0 && (
                  <div className='flex items-center justify-center'>
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product._id,
                        countInStock: product.countInStock,
                        name: product.name,
                        slug: product.slug,
                        category: product.category,
                        price: round2(product.price),
                        quantity: 1,
                        image: product.images[0],
                        size: size || product.sizes[0],
                        color: color || product.colors[0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className='mt-10'>
        <h2 className='h2-bold mb-2' id='reviews'>
          รีวิวจากลูกค้า
        </h2>
        <ReviewList product={product} userId={session?.user.id} />
      </section>

      <section className='mt-10'>
        <ProductSlider
          products={relatedProducts.data}
          title={`สินค้าขายดีในหมวด ${translateCategory(product.category)}`}
        />
      </section>
      <section>
        <BrowsingHistoryList className='mt-10' />
      </section>
    </div>
  )
}
