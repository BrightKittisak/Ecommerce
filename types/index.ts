import {
  OrderInputSchema,
  OrderItemSchema,
} from '@/lib/domain/order/order.schema'
import { CartSchema } from '@/lib/domain/order/cart.schema'
import { ShippingAddressSchema } from '@/lib/domain/order/shipping-address.schema'
import { ProductInputSchema } from '@/lib/domain/product/product.schema'
import { ReviewInputSchema } from '@/lib/domain/review/review.schema'
import { UserNameSchema } from '@/lib/domain/user/profile.schema'
import { UserInputSchema } from '@/lib/domain/user/user.schema'
import { UserSignInSchema, UserSignUpSchema } from '@/lib/auth-validator'
import { CreateOrderItemSchema, CreateOrderSchema } from '@/lib/order-validator'
import { z } from 'zod'

export type IReviewInput = z.infer<typeof ReviewInputSchema>
export type IReviewDetails = IReviewInput & {
  _id: string
  createdAt: string
  user: {
    name: string
  }
}

export type IProductInput = z.infer<typeof ProductInputSchema>

export type Data = {
  users: IUserInput[]
  products: IProductInput[]
  reviews: {
    title: string
    rating: number
    comment: string
  }[]
  headerMenus: {
    name: string
    href: string
  }[]
  carousels: {
    image: string
    url: string
    title: string
    buttonCaption: string
    isPublished: boolean
  }[]
}
export type IOrderInput = z.infer<typeof OrderInputSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type Cart = z.infer<typeof CartSchema>
export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>

// user
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignIn = z.infer<typeof UserSignInSchema>
export type IUserSignUp = z.infer<typeof UserSignUpSchema>
export type IUserName = z.infer<typeof UserNameSchema>
