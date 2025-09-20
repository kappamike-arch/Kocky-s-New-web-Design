/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  typescript: {
    // Temporarily ignore build errors
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    unoptimized: true,
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
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL || 'https://staging.kockys.com',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S4RSq7o9GBZIZ8HQwLw2u67qdSjTrqKPrFOIvSJRAqvNx5SAMh6uQp2xbQQjZGhrkiwpfbqZiQeMNr0jGRcQKc700aXX6gLoe',
  },
};

module.exports = nextConfig;
