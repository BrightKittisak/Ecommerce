export type ReviewUserDTO = {
  name: string
}

export type ReviewDetailsDTO = {
  _id: string
  title: string
  comment: string
  rating: number
  isVerifiedPurchase: boolean
  createdAt: string
  user: ReviewUserDTO | null
}

export type ReviewDTO = {
  _id: string
  product: string
  user: string
  title: string
  comment: string
  rating: number
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt: string
}
