import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardFooter } from '@/components/ui/card'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Card
          key={card.title}
          className='group flex h-full flex-col overflow-hidden border-border/60 bg-card/85 shadow-[0_24px_70px_-42px_rgba(49,34,21,0.55)] transition-transform duration-300 hover:-translate-y-1'
        >
          <CardContent className='flex-1 p-5'>
            <p className='eyebrow mb-3'>แนะนำสำหรับคุณ</p>
            <h3 className='h3-title mb-5'>{card.title}</h3>
            <div className='grid grid-cols-2 gap-4'>
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='rounded-2xl border border-border/60 bg-secondary/50 p-3 transition-colors hover:bg-secondary'
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    className='mx-auto aspect-square h-auto max-w-full object-scale-down'
                    height={120}
                    width={120}
                    sizes='(max-width: 1024px) 40vw, 12vw'
                  />
                  <p className='mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium text-foreground/90 sm:text-base'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className='pt-0'>
              <Link href={card.link.href} className='mt-2 text-sm font-semibold text-primary sm:text-[15px]'>
                {card.link.text}
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
