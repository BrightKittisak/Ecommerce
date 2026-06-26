import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BrowsingHistoryProduct = { id: string; category: string }

type BrowsingHistory = {
  products: BrowsingHistoryProduct[]
  addItem: (product: BrowsingHistoryProduct) => void
  clear: () => void
}

const initialProductsState = {
  products: [],
}

export function updateBrowsingHistoryProducts(
  products: BrowsingHistoryProduct[],
  product: BrowsingHistoryProduct
) {
  return [
    product,
    ...products.filter((existingProduct) => existingProduct.id !== product.id),
  ].slice(0, 10)
}

export const browsingHistoryStore = create<BrowsingHistory>()(
  persist(
    (set) => ({
      ...initialProductsState,
      addItem: (product) => {
        set((state) => ({
          products: updateBrowsingHistoryProducts(state.products, product),
        }))
      },
      clear: () => {
        set({ products: [] })
      },
    }),
    {
      name: 'browsingHistoryStore',
    }
  )
)

export default function useBrowsingHistory() {
  return browsingHistoryStore()
}
