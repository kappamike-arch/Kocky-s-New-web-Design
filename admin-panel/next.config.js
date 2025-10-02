/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  trailingSlash: true,            // fix redirect loop with Nginx
  outputFileTracingRoot: '/home/stagingkockys/public_html/current/admin-panel',
  // assetPrefix is not usually needed; uncomment only if _next assets 404
  // assetPrefix: '/admin',
  // Fix WebSocket HMR for staging domain
  allowedDevOrigins: ['staging.kockys.com'],
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Fix font loading issues
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'react-hot-toast'],
  },
  // WebSocket configuration for HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
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
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api',
    NEXT_PUBLIC_ADMIN_SECRET: process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin-secret-key-change-this',
  },
  // Add headers to fix Content Security Policy issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' http://127.0.0.1:5001 https://staging.kockys.com http://localhost:5001; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
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
