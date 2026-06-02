'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFilterUrl } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function ProductSortSelector({
  sortOrders,
  sort,
  params,
}: {
  sortOrders: { value: string; name: string }[]
  sort: string
  params: {
    q?: string
    category?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
  }
}) {
  const router = useRouter()
  const selectedSort = sortOrders.find((sortOrder) => sortOrder.value === sort)
  const fallbackSort = selectedSort ?? sortOrders[0]

  return (
    <Select
      onValueChange={(value) => {
        router.push(getFilterUrl({ params, sort: value }))
      }}
      value={fallbackSort?.value}
    >
      <SelectTrigger>
        <SelectValue>
          เรียงตาม: {fallbackSort?.name ?? 'ค่าเริ่มต้น'}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {sortOrders.map((sortOrder) => (
          <SelectItem key={sortOrder.value} value={sortOrder.value}>
            {sortOrder.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
