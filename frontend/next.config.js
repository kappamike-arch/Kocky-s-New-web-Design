/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'staging.kockys.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'staging.kockys.com',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'staging.kockys.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api',
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL || '/uploads',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
