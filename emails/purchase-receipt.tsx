import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { IOrder } from '@/lib/db/models/order.model'
import { SERVER_URL } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

type OrderInformationProps = {
  order: IOrder
}

PurchaseReceiptEmail.PreviewProps = {
  order: {
    _id: '123',
    isPaid: true,
    paidAt: new Date(),
    totalPrice: 100,
    itemsPrice: 100,
    taxPrice: 0,
    shippingPrice: 0,
    user: {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
    },
    shippingAddress: {
      fullName: 'สมชาย ใจดี',
      street: '123 ถนนสุขุมวิท',
      city: 'คลองเตย',
      postalCode: '10110',
      country: 'ประเทศไทย',
      phone: '0812345678',
      province: 'กรุงเทพมหานคร',
    },
    items: [
      {
        clientId: '123',
        name: 'สินค้า 1',
        image: 'https://via.placeholder.com/150',
        price: 100,
        quantity: 1,
        product: '123',
        slug: 'product-1',
        category: 'Category 1',
        countInStock: 10,
      },
    ],
    paymentMethod: 'PayPal',
    expectedDeliveryDate: new Date(),
    isDelivered: true,
  } as IOrder,
} satisfies OrderInformationProps

const dateFormatter = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' })

export default async function PurchaseReceiptEmail({
  order,
}: OrderInformationProps) {
  return (
    <Html>
      <Preview>ดูใบยืนยันคำสั่งซื้อของคุณ</Preview>
      <Tailwind>
        <Head />
        <Body className='bg-white font-sans'>
          <Container className='max-w-xl'>
            <Heading>ใบยืนยันคำสั่งซื้อ</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className='mb-0 mr-4 whitespace-nowrap text-nowrap text-gray-500'>
                    รหัสคำสั่งซื้อ
                  </Text>
                  <Text className='mt-0 mr-4'>{order._id.toString()}</Text>
                </Column>
                <Column>
                  <Text className='mb-0 mr-4 whitespace-nowrap text-nowrap text-gray-500'>
                    วันที่สั่งซื้อ
                  </Text>
                  <Text className='mt-0 mr-4'>
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className='mb-0 mr-4 whitespace-nowrap text-nowrap text-gray-500'>
                    ยอดที่ชำระ
                  </Text>
                  <Text className='mt-0 mr-4'>
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className='my-4 rounded-lg border border-solid border-gray-500 p-4 md:p-6'>
              {order.items.map((item) => (
                <Row key={item.product} className='mt-8'>
                  <Column className='w-20'>
                    <Img
                      width='80'
                      alt={item.name}
                      className='rounded'
                      src={
                        item.image.startsWith('/')
                          ? `${SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className='align-top'>
                    <Text className='mx-2 my-0'>
                      {item.name} x {item.quantity}
                    </Text>
                  </Column>
                  <Column align='right' className='align-top'>
                    <Text className='m-0'>{formatCurrency(item.price)}</Text>
                  </Column>
                </Row>
              ))}
              {[
                { name: 'ค่าสินค้า', price: order.itemsPrice },
                { name: 'ภาษี', price: order.taxPrice },
                { name: 'ค่าจัดส่ง', price: order.shippingPrice },
                { name: 'ยอดรวม', price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className='py-1'>
                  <Column align='right'>{name}:</Column>
                  <Column align='right' width={70} className='align-top'>
                    <Text className='m-0'>{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
