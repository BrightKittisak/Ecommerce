import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
]

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

const getConfig = async (): Promise<NextConfig> => {
  if (process.env.ANALYZE === 'true') {
    const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer')
    return withBundleAnalyzer({
      analyzerMode: 'json',
      openAnalyzer: false,
    })(nextConfig)
  }
  return nextConfig
}

export default getConfig
