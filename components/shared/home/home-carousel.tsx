'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Autoplay from 'embla-carousel-autoplay'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

export function HomeCarousel({
  items,
}: {
  items: {
    image: string
    url: string
    title: string
    buttonCaption: string
  }[]
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='page-shell mx-auto w-full'
      onMouseEnter={() => plugin.current.stop()}
      onMouseLeave={() => plugin.current.play()}
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={item.title}>
            <Link href={item.url}>
              <div className='relative -m-1 flex aspect-[16/8] items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 p-6 shadow-[0_32px_90px_-45px_rgba(31,21,14,0.7)] md:aspect-[16/6]'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover'
                  priority={index === 0}
                  sizes='(max-width: 768px) 100vw, 90vw'
                />
                <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(17,20,16,0.82),rgba(17,20,16,0.38),transparent)]' />
                <div className='absolute inset-x-6 bottom-8 z-10 max-w-xl md:bottom-1/2 md:left-16 md:translate-y-1/2'>
                  <p className='eyebrow mb-3 text-white/80'>คอลเลกชันคัดพิเศษ</p>
                  <h2 className='mb-4 max-w-lg text-4xl font-semibold leading-none text-white md:text-6xl'>
                    {item.title}
                  </h2>
                  <p className='mb-5 hidden max-w-md text-sm text-white/80 md:block'>
                    เลือกชิ้นที่ใส่ง่าย ใช้ได้จริง และช่วยให้การช้อปในแต่ละวันเร็วขึ้นแบบไม่เสียความสวยงาม
                  </p>
                  <span className='hidden rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground md:inline-flex'>
                    {item.buttonCaption}
                  </span>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className='left-4 border-white/30 bg-background/85 backdrop-blur md:left-8' />
      <CarouselNext className='right-4 border-white/30 bg-background/85 backdrop-blur md:right-8' />
    </Carousel>
  )
}
