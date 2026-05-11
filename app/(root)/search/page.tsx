import Link from 'next/link'

import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile'
import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import Rating from '@/components/shared/product/rating'
import { Button } from '@/components/ui/button'
import {
  getAllCategories,
  getAllProducts,
  getAllTags,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { translateCategory, translateTag } from '@/lib/i18n'
import { getFilterUrl, toSlug } from '@/lib/utils'

const sortOrders = [
  { value: 'price-low-to-high', name: 'ราคาต่ำไปสูง' },
  { value: 'price-high-to-low', name: 'ราคาสูงไปต่ำ' },
  { value: 'newest-arrivals', name: 'มาใหม่ล่าสุด' },
  { value: 'avg-customer-review', name: 'คะแนนรีวิวเฉลี่ย' },
  { value: 'best-selling', name: 'ขายดีที่สุด' },
]

const prices = [
  {
    name: '$1 ถึง $20',
    value: '1-20',
  },
  {
    name: '$21 ถึง $50',
    value: '21-50',
  },
  {
    name: '$51 ถึง $1000',
    value: '51-1000',
  },
]

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
  } = searchParams

  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    tag !== 'all' ||
    rating !== 'all' ||
    price !== 'all'
  ) {
    return {
      title: `ค้นหา ${q !== 'all' ? q : ''}
          ${category !== 'all' ? ` : หมวด ${translateCategory(category)}` : ''}
          ${tag !== 'all' ? ` : แท็ก ${translateTag(tag)}` : ''}
          ${price !== 'all' ? ` : ราคา ${price}` : ''}
          ${rating !== 'all' ? ` : คะแนน ${rating}` : ''}`,
    }
  } else {
    return {
      title: 'ค้นหาสินค้า',
    }
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams

  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams

  const params = { q, category, tag, price, rating, sort, page }

  const categories = await getAllCategories()
  const tags = await getAllTags()
  const data = await getAllProducts({
    category,
    tag,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
  })

  return (
    <div className='space-y-4'>
      <div className='section-shell flex-between flex-col gap-3 px-5 py-4 md:flex-row'>
        <div className='flex items-center'>
          {data.totalProducts === 0
            ? 'ไม่พบ'
            : `${data.from}-${data.to} of ${data.totalProducts}`}{' '}
          รายการ
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          rating !== 'all' ||
          price !== 'all'
            ? ` สำหรับ `
            : null}
          {q !== 'all' && q !== '' && '"' + q + '"'}
          {category !== 'all' &&
            category !== '' &&
            `  หมวด: ` + translateCategory(category)}
          {tag !== 'all' && tag !== '' && `   แท็ก: ` + translateTag(tag)}
          {price !== 'all' && `    ราคา: ` + price}
          {rating !== 'all' && `   คะแนน: ` + rating + ` ดาวขึ้นไป`}
          &nbsp;
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          rating !== 'all' ||
          price !== 'all' ? (
            <Button variant={'link'} asChild>
              <Link href='/search'>ล้างตัวกรอง</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-5'>
        <CollapsibleOnMobile title='ตัวกรอง'>
          <div className='section-shell space-y-4 p-5'>
            <div>
              <div className='font-bold'>หมวดหมู่</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      ('all' === category || '' === category) && 'text-primary'
                    }`}
                    href={getFilterUrl({ category: 'all', params })}
                  >
                    ทั้งหมด
                  </Link>
                </li>
                {categories.map((c: string) => (
                  <li key={c}>
                    <Link
                    className={`${c === category && 'text-primary'}`}
                    href={getFilterUrl({ category: c, params })}
                  >
                      {translateCategory(c)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className='font-bold'>ราคา</div>
              <ul>
                <li>
                  <Link
                    className={`${'all' === price && 'text-primary'}`}
                    href={getFilterUrl({ price: 'all', params })}
                  >
                    ทั้งหมด
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link
                      href={getFilterUrl({ price: p.value, params })}
                      className={`${p.value === price && 'text-primary'}`}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className='font-bold'>คะแนนรีวิว</div>
              <ul>
                <li>
                  <Link
                    href={getFilterUrl({ rating: 'all', params })}
                    className={`${'all' === rating && 'text-primary'}`}
                  >
                    ทั้งหมด
                  </Link>
                </li>

                <li>
                  <Link
                    href={getFilterUrl({ rating: '4', params })}
                    className={`${'4' === rating && 'text-primary'}`}
                  >
                    <div className='flex'>
                      <Rating size={4} rating={4} /> ขึ้นไป
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className='font-bold'>แท็ก</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      ('all' === tag || '' === tag) && 'text-primary'
                    }`}
                    href={getFilterUrl({ tag: 'all', params })}
                  >
                    ทั้งหมด
                  </Link>
                </li>
                {tags.map((t: string) => (
                  <li key={t}>
                    <Link
                      className={`${toSlug(t) === tag && 'text-primary'}`}
                      href={getFilterUrl({ tag: t, params })}
                    >
                      {translateTag(t)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleOnMobile>

        <div className='section-shell space-y-4 p-5 md:col-span-4'>
          <div className='border-b border-border/60 pb-4'>
            <div className='font-bold text-xl'>ผลการค้นหา</div>
            <div>กดเข้าแต่ละสินค้าเพื่อดูตัวเลือกการซื้อเพิ่มเติม</div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {data.products.length === 0 && <div>ไม่พบสินค้าที่ตรงกับเงื่อนไข</div>}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}
