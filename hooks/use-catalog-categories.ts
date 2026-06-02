'use client'

import { useEffect, useState } from 'react'

export default function useCatalogCategories() {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const response = await fetch('/api/catalog/categories', {
          signal: controller.signal,
        })

        if (!response.ok) return

        const data: unknown = await response.json()

        if (Array.isArray(data)) {
          setCategories(
            data.filter((category): category is string =>
              typeof category === 'string'
            )
          )
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  return categories
}
