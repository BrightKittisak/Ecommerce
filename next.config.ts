import type { NextConfig } from 'next'

import { securityHeaders } from './lib/security-headers'

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
