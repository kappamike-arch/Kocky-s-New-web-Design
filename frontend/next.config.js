/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // External image sources
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Staging environment images
      {
        protocol: 'https',
        hostname: 'staging.kockys.com',
        pathname: '/uploads/**',
      },
      // Production environment images (for future use)
      {
        protocol: 'https',
        hostname: 'kockys.com',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    // Legacy environment variables (deprecated - use centralized config)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://staging.kockys.com/api',
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL || '/uploads',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};

module.exports = nextConfig;
