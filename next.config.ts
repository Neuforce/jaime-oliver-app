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
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'hgtvhome.sndimg.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.epicurious.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'wilmax.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.manufactum.de',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'image.makewebeasy.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn11.bigcommerce.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
      },
      {
        protocol: 'https',
        hostname: 'lancastercastiron.com',
      },
      {
        protocol: 'https',
        hostname: 'images.thdstatic.com',
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