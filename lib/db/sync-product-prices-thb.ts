import { cwd } from 'process'

import { loadEnvConfig } from '@next/env'

import data from '../data'

import { connectToDatabase } from '.'
import Product from './models/product.model'

loadEnvConfig(cwd())

const main = async () => {
  try {
    await connectToDatabase(process.env.MONGODB_URI)

    const bulkOperations = data.products.map((product) => ({
      updateOne: {
        filter: { slug: product.slug },
        update: {
          $set: {
            name: product.name,
            description: product.description,
            price: product.price,
            listPrice: product.listPrice,
          },
        },
      },
    }))

    const result = await Product.bulkWrite(bulkOperations)

    console.log({
      matched: result.matchedCount,
      modified: result.modifiedCount,
      message: 'ซิงก์ราคาสินค้าในฐานข้อมูลเป็นเงินบาทเรียบร้อยแล้ว',
    })
    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('ไม่สามารถซิงก์ราคาสินค้าเป็นเงินบาทได้')
  }
}

main()
