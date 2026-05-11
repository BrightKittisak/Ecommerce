import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import {
  getAllCategories,
  getProductsByTag,
  getProductsForCard,
} from '@/lib/actions/product.actions'
import data from '@/lib/data'
import { toSlug } from '@/lib/utils'

export default async function HomePage() {
  const categories = (await getAllCategories()).slice(0, 4)
  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
    limit: 4,
  })
  const featureds = await getProductsForCard({
    tag: 'featured',
    limit: 4,
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
    limit: 4,
  })
  const cards = [
    {
      title: 'หมวดหมู่ที่น่าค้นหา',
      link: {
        text: 'ดูทั้งหมด',
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: 'ของเข้าใหม่ที่ไม่ควรพลาด',
      items: newArrivals,
      link: {
        text: 'ดูทั้งหมด',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'สินค้าขายดีประจำร้าน',
      items: bestSellers,
      link: {
        text: 'ดูทั้งหมด',
        href: '/search?tag=best-seller',
      },
    },
    {
      title: 'คอลเลกชันแนะนำ',
      items: featureds,
      link: {
        text: 'เลือกซื้อเลย',
        href: '/search?tag=featured',
      },
    },
  ]

  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })

  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className='page-shell mt-6 space-y-6'>
        <section className='section-shell grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8'>
          <div className='space-y-7'>
            <p className='eyebrow'>ช้อปง่ายขึ้นในทุกวัน</p>
            <h1 className='max-w-2xl text-[1.75rem] font-semibold leading-[1.95] tracking-[-0.02em] sm:text-[2.15rem] lg:text-[2.2rem]'>
              หน้าร้านที่ดูละมุนขึ้น ค้นหาง่ายขึ้น และช่วยให้ตัดสินใจซื้อได้มั่นใจขึ้น
            </h1>
            <p className='body-lg max-w-2xl'>
              เลือกดูเสื้อผ้า รองเท้า และแอ็กเซสซอรีได้ใน flow ที่เป็นระเบียบขึ้น รองรับทั้งภาษาไทยและธีมกลางวันกลางคืนแบบสบายตา
            </p>
          </div>
          <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
            {[
              'ดีไซน์ใหม่ช่วยดันสินค้าเด่นขึ้นและอ่านข้อมูลง่ายขึ้น',
              'เส้นทางไป checkout สั้นลง พร้อมตัวเลือกชำระเงินยืดหยุ่น',
              'ย้อนดูสินค้าที่เคยเปิดและสำรวจหมวดหมู่ได้สะดวกกว่าเดิม',
            ].map((item) => (
              <div
                key={item}
                className='rounded-[1.5rem] border border-border/60 bg-secondary/60 px-4 py-4 text-sm leading-7 font-medium text-foreground/80 sm:text-[15px]'
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <HomeCard cards={cards} />

        <Card className='section-shell w-full border-border/60'>
          <CardContent className='items-center gap-3 p-5 md:p-6'>
            <ProductSlider title='ดีลประจำวันนี้' products={todaysDeals} />
          </CardContent>
        </Card>
      </div>
      <div className='page-shell py-8'>
        <BrowsingHistoryList />
      </div>
    </>
  )
}
