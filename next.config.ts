import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

const getConfig = async (): Promise<NextConfig> => {
  if (process.env.ANALYZE === 'true') {
    const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer');
    return withBundleAnalyzer({
      analyzerMode: 'json',
      openAnalyzer: false,
    })(nextConfig);
  }
  return nextConfig;
};

export default getConfig;
