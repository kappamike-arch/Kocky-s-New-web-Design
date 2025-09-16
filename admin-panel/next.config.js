/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  trailingSlash: true,            // fix redirect loop with Nginx
  // assetPrefix is not usually needed; uncomment only if _next assets 404
  // assetPrefix: '/admin',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://staging.kockys.com/api',
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
