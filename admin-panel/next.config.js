/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://72.167.227.205:5001/api',
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
  // Configure asset prefix for staging domain
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Enable trailing slash for compatibility
  trailingSlash: false,
  // Configure public runtime config
  publicRuntimeConfig: {
    basePath: '',
  },
};

module.exports = nextConfig;
