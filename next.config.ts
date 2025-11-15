import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.jamieoliver.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.jamieoliver.com',
      },
    ],
  },
  webpack: (config) => {
    // Handle WebSocket in development
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

export default nextConfig