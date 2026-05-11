import { cwd } from 'process'

import { loadEnvConfig } from '@next/env'

import { connectToDatabase } from '.'
import Order from './models/order.model'
import { CURRENCY_CODE, round2 } from '../utils'

loadEnvConfig(cwd())

const USD_TO_THB_RATE = 32.26

const formatPricePaid = (pricePaid?: string) => {
  if (!pricePaid) return pricePaid

  const parsedPrice = Number(pricePaid)
  if (Number.isNaN(parsedPrice)) return pricePaid

  return round2(parsedPrice * USD_TO_THB_RATE).toFixed(2)
}

const main = async () => {
  try {
    await connectToDatabase(process.env.MONGODB_URI)

    const legacyOrders = await Order.find({
      $or: [
        { currencyCode: { $exists: false } },
        { currencyCode: { $ne: CURRENCY_CODE } },
      ],
    })

    if (legacyOrders.length === 0) {
      console.log({
        matched: 0,
        modified: 0,
        message: 'ไม่พบคำสั่งซื้อเก่าที่ต้องแปลงเป็นเงินบาท',
      })
      process.exit(0)
    }

    const bulkOperations = legacyOrders.map((order) => ({
      updateOne: {
        filter: { _id: order._id },
        update: {
          $set: {
            currencyCode: CURRENCY_CODE,
            items: order.items.map((item) => ({
              ...item,
              price: round2(item.price * USD_TO_THB_RATE),
            })),
            itemsPrice: round2(order.itemsPrice * USD_TO_THB_RATE),
            shippingPrice: round2(order.shippingPrice * USD_TO_THB_RATE),
            taxPrice: round2(order.taxPrice * USD_TO_THB_RATE),
            totalPrice: round2(order.totalPrice * USD_TO_THB_RATE),
            paymentResult: order.paymentResult
              ? {
                  ...order.paymentResult,
                  pricePaid: formatPricePaid(order.paymentResult.pricePaid),
                }
              : undefined,
          },
        },
      },
    }))

    const result = await Order.bulkWrite(bulkOperations)

    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
      message: 'ซิงก์คำสั่งซื้อเก่าเป็นเงินบาทเรียบร้อยแล้ว',
    })
    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('ไม่สามารถซิงก์คำสั่งซื้อเก่าเป็นเงินบาทได้')
  }
}

main()
