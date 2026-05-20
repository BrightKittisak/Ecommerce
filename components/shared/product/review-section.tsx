import { IProduct } from '@/lib/db/models/product.model'
import ReviewList from '@/app/(root)/product/[slug]/review-list'

export default function ReviewSection({
  product,
  userId,
}: {
  product: IProduct
  userId?: string
}) {
  return <ReviewList product={product} userId={userId} />
}
