/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  trailingSlash: true,            // fix redirect loop with Nginx
  // assetPrefix is not usually needed; uncomment only if _next assets 404
  // assetPrefix: '/admin',
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
    NEXT_PUBLIC_ADMIN_SECRET: process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin-secret-key-change-this',
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
