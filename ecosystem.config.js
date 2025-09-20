module.exports = {
  apps: [
    {
      name: 'kockys-backend',
      script: './dist/server.js',
      cwd: '/home/stagingkockys/public_html/current/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        DATABASE_URL: 'file:/home/stagingkockys/public_html/current/backend/prisma/dev.db',
        FRONTEND_URL: 'https://staging.kockys.com',
        ADMIN_URL: 'https://staging.kockys.com/admin',
        BACKEND_URL: 'https://staging.kockys.com/api',
        BACKEND_PUBLIC_URL: 'https://staging.kockys.com/api',
        PUBLIC_ORIGIN: 'https://staging.kockys.com',
        ALLOWED_ORIGINS: '["https://staging.kockys.com"]',
        SMTP_HOST: 'smtp.office365.com',
        SMTP_PORT: 587,
        SMTP_USER: 'Mike@Kockys.com',
        SMTP_PASS: 'znzypthvyzpkfsnv',
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
        JWT_EXPIRE: '7d',
        STRIPE_SECRET_KEY: 'sk_test_51S4RSq7o9GBZIZ8HXoCue3I6aEsFmBjBfFLwXwCqvLR5F5adUNqHHHu5grt62dxxfALYeU0GQqSNUAuzgZLxlTNX00cAdGlbxu',
        STRIPE_WEBHOOK_SECRET: 'whsec_gkmcELkt6g4Qf1Hs5qjUSrLoYtzbGhuL',
        STRIPE_PUBLISHABLE_KEY: 'pk_test_51S4RSq7o9GBZIZ8HQwLw2u67qdSjTrqKPrFOIvSJRAqvNx5SAMh6uQp2xbQQjZGhrkiwpfbqZiQeMNr0jGRcQKc700aXX6gLoe',
        APP_BASE_URL: 'https://staging.kockys.com'
      }
    },
    {
      name: 'kockys-admin',
      script: 'npm',
      args: 'start',
      cwd: '/home/stagingkockys/public_html/current/admin-panel',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        NEXT_PUBLIC_API_URL: 'https://staging.kockys.com/api'
      }
    },
    {
      name: 'kockys-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/stagingkockys/public_html/current/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        NEXT_PUBLIC_API_URL: 'https://staging.kockys.com/api'
      }
    },
    {
      name: 'kockys-prisma-studio',
      script: 'npx',
      args: 'prisma studio --port 5555 --hostname 0.0.0.0',
      cwd: '/home/stagingkockys/public_html/current/backend',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'file:/home/stagingkockys/public_html/current/backend/prisma/dev.db'
      }
    }
  ]
};
