import { clsx, type ClassValue } from 'clsx'
import qs from 'query-string'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string
  key: string
  value: string | null
}) {
  const currentUrl = qs.parse(params)

  currentUrl[key] = value

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : int
}

export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

export const CURRENCY_CODE = 'THB'
export const CURRENCY_SYMBOL = '฿'

const CURRENCY_FORMATTER = new Intl.NumberFormat('th-TH', {
  currency: CURRENCY_CODE,
  style: 'currency',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

export function formatCurrencyParts(amount: number) {
  const parts = CURRENCY_FORMATTER.formatToParts(amount)

  return {
    symbol:
      parts.find((part) => part.type === 'currency')?.value || CURRENCY_SYMBOL,
    integer: parts
      .filter((part) => part.type === 'integer' || part.type === 'group')
      .map((part) => part.value)
      .join(''),
    fraction: parts.find((part) => part.type === 'fraction')?.value || '00',
  }
}

const NUMBER_FORMATTER = new Intl.NumberFormat('th-TH')

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}

export const round2 = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100

export const generateId = () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join('')

type MongooseValidationError = {
  name: 'ValidationError'
  errors: Record<string, { message: string }>
}

type DuplicateKeyError = {
  code: 11000
  keyValue: Record<string, unknown>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isMongooseValidationError = (
  error: unknown
): error is MongooseValidationError =>
  isRecord(error) &&
  error.name === 'ValidationError' &&
  isRecord(error.errors)

const isDuplicateKeyError = (error: unknown): error is DuplicateKeyError =>
  isRecord(error) &&
  error.code === 11000 &&
  isRecord(error.keyValue)

export const formatError = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.errors
      .map((fieldError) => `${fieldError.path.join('.')}: ${fieldError.message}`)
      .join('. ')
  }

  if (isMongooseValidationError(error)) {
    return Object.values(error.errors)
      .map((fieldError) => fieldError.message)
      .join('. ')
  }

  if (isDuplicateKeyError(error)) {
    const duplicateField = Object.keys(error.keyValue)[0]
    return `${duplicateField} มีอยู่แล้วในระบบ`
  }

  if (error instanceof Error) return error.message

  if (typeof error === 'string') return error

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
}

export function calculateFutureDate(days: number) {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + days)
  return currentDate
}

export function getMonthName(yearAndMonth: string) {
  const [, monthNumber] = yearAndMonth.split('-')
  const date = new Date()
  date.setMonth(parseInt(monthNumber) - 1)
  return new Date().getMonth() === parseInt(monthNumber) - 1
    ? `${date.toLocaleString('th-TH', { month: 'long' })} (เดือนปัจจุบัน)`
    : date.toLocaleString('th-TH', { month: 'long' })
}

export function calculatePastDate(days: number) {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - days)
  return currentDate
}

export function timeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)

  const diff = midnight.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { hours, minutes }
}

export const formatDateTime = (dateString: Date | string) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'th-TH',
    dateTimeOptions
  )
  const formattedDate: string = new Date(dateString).toLocaleString(
    'th-TH',
    dateOptions
  )
  const formattedTime: string = new Date(dateString).toLocaleString(
    'th-TH',
    timeOptions
  )
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  }
}

export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`
}

export const getFilterUrl = ({
  params,
  category,
  tag,
  sort,
  price,
  rating,
  page,
}: {
  params: {
    q?: string
    category?: string
    tag?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
  }
  tag?: string
  category?: string
  sort?: string
  price?: string
  rating?: string
  page?: string
}) => {
  const newParams = { ...params }
  if (category) newParams.category = category
  if (tag) newParams.tag = toSlug(tag)
  if (price) newParams.price = price
  if (rating) newParams.rating = rating
  if (page) newParams.page = page
  if (sort) newParams.sort = sort
  return `/search?${new URLSearchParams(newParams).toString()}`
}
