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
        FRONTEND_URL: 'http://72.167.227.205:3003',
        ADMIN_URL: 'http://72.167.227.205:4000',
        BACKEND_URL: 'http://72.167.227.205:5001',
        PUBLIC_ORIGIN: 'http://72.167.227.205:3003',
        SMTP_HOST: 'smtp.office365.com',
        SMTP_PORT: 587,
        SMTP_USER: 'Mike@Kockys.com',
        SMTP_PASS: 'znzypthvyzpkfsnv',
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
        JWT_EXPIRE: '7d'
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
        NEXT_PUBLIC_API_URL: 'http://72.167.227.205:5001'
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
        NEXT_PUBLIC_API_URL: 'http://72.167.227.205:5001'
      }
    }
  ]
};
