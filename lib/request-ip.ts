type RequestHeaders = Pick<Headers, 'get'>

export const getClientIpFromHeaders = (headers: RequestHeaders) => {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown'

  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

export const getClientIp = (request: Request) =>
  getClientIpFromHeaders(request.headers)
