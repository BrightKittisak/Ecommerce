import { ChevronDown, SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { translateCategory } from '@/lib/i18n'
import { getAllCategories } from '@/lib/actions/product.actions'
import { APP_NAME } from '@/lib/constants'

export default async function Search() {
  const categories = await getAllCategories()

  return (
    <form
      action='/search'
      method='GET'
      className='flex h-12 items-stretch overflow-hidden rounded-full border border-border/60 bg-card shadow-[0_16px_50px_-36px_rgba(60,42,29,0.65)]'
    >
      <div className='relative hidden sm:block'>
        <select
          name='category'
          defaultValue='all'
          className='h-full appearance-none border-r border-border/70 bg-secondary px-4 pr-10 text-[13px] font-medium text-foreground focus:outline-none sm:text-sm'
        >
          <option value='all'>ทุกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {translateCategory(category)}
            </option>
          ))}
        </select>
        <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      </div>
      <Input
        className='h-full flex-1 rounded-none border-0 bg-transparent px-5 text-[15px] shadow-none focus-visible:ring-0 placeholder:text-sm placeholder:text-muted-foreground focus-visible:ring-offset-0 sm:text-base'
        placeholder={`ค้นหาสินค้าใน ${APP_NAME}`}
        name='q'
        type='search'
      />
      <button
        type='submit'
        className='mr-1 my-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.02]'
        aria-label='ค้นหาสินค้า'
      >
        <SearchIcon className='h-5 w-5' />
      </button>
    </form>
  )
}
