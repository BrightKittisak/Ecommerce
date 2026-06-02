export type ProductRatingDistributionDTO = {
  rating: number
  count: number
}

export type ProductDTO = {
  _id: string
  name: string
  slug: string
  category: string
  images: string[]
  brand: string
  description?: string
  price: number
  listPrice: number
  countInStock: number
  tags: string[]
  colors: string[]
  sizes: string[]
  avgRating: number
  numReviews: number
  ratingDistribution: ProductRatingDistributionDTO[]
  numSales?: number
  isPublished?: boolean
  createdAt?: string
  updatedAt?: string
}
