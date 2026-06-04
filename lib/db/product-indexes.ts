export const PRODUCT_INDEXES = [
  { isPublished: 1, slug: 1 },
  { isPublished: 1, category: 1 },
  { isPublished: 1, tags: 1, createdAt: -1 },
  { isPublished: 1, category: 1, numSales: -1 },
  { isPublished: 1, price: 1 },
  { isPublished: 1, avgRating: -1 },
  { isPublished: 1, numSales: -1 },
  { isPublished: 1, _id: -1 },
  { countInStock: 1 },
] as const
