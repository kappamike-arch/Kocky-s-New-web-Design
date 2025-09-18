# 🍔 Kocky's Bar & Grill - Production Deployment Package

## 📋 Package Contents

This deployment package contains everything needed to deploy Kocky's Bar & Grill website to production.

### Directory Structure
```
kockys-deploy-YYYYMMDD-HHMMSS/
├── backend/              # Express.js API server
│   ├── dist/            # Compiled TypeScript code
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Source code
│   └── uploads/         # User uploaded files
├── frontend/            # Next.js customer-facing website
│   ├── .next/          # Production build
│   ├── public/         # Static assets
│   └── src/            # Source code
├── admin-panel/         # Next.js admin dashboard
│   ├── .next/          # Production build
│   ├── public/         # Static assets
│   └── src/            # Source code
├── config/              # Configuration files
│   ├── .env.production  # Environment template
│   ├── ecosystem.config.js # PM2 configuration
│   ├── nginx.conf       # Nginx configuration
│   └── .htaccess        # Apache configuration
├── scripts/             # Deployment scripts
│   ├── install.sh       # Installation script
│   ├── start.sh         # Startup script
│   ├── stop.sh          # Stop script
│   ├── backup.sh        # Backup script
│   └── health-check.sh  # Health check script
├── docs/                # Documentation
└── README.md           # This file
```

## 🚀 Quick Start Deployment

### 1. Prerequisites
- Node.js 18+ and npm 8+
- PM2 (will be installed automatically)
- Nginx or Apache web server
- SSL certificate
- Domain name configured

### 2. Upload Package
Upload the deployment package to your server:
```bash
scp kockys-deploy-YYYYMMDD-HHMMSS.tar.gz user@server:/var/www/
ssh user@server
cd /var/www
tar -xzf kockys-deploy-YYYYMMDD-HHMMSS.tar.gz
cd kockys-deploy-YYYYMMDD-HHMMSS
```

### 3. Install Dependencies
```bash
chmod +x scripts/*.sh
./scripts/install.sh
```

### 4. Configure Environment
Edit the `.env` file with your production values:
```bash
nano .env
```

Key settings to update:
- Domain URLs
- JWT secrets (generate random strings)
- Email credentials
- Database path
- Upload path

### 5. Start Services
```bash
./scripts/start.sh
```

### 6. Configure Web Server

#### For Nginx:
```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/kockys
sudo ln -s /etc/nginx/sites-available/kockys /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### For Apache:
```bash
sudo cp config/.htaccess /var/www/html/
sudo a2enmod proxy proxy_http headers expires deflate
sudo systemctl reload apache2
```

### 7. SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🔧 Configuration

### Environment Variables
See `.env.production` for all available options. Critical variables:

- `NODE_ENV=production`
- `DATABASE_URL` - Path to SQLite database
- `JWT_SECRET` - Random 64-character string
- `EMAIL_*` - SMTP configuration
- `*_URL` - Your domain URLs

### Ports
- Backend API: 5001
- Frontend: 3003
- Admin Panel: 4000

## 📱 Post-Deployment

### 1. Create Admin User
Access the admin panel at `https://yourdomain.com/admin` and create the first admin user.

### 2. Configure Email
Test email sending from the admin panel settings.

### 3. Upload Content
- Logo images
- Menu items
- Gallery photos
- Service information

### 4. Test Features
- [ ] Homepage loads correctly
- [ ] Menu displays with images
- [ ] Reservation form works
- [ ] Quote generator functions
- [ ] Email notifications send
- [ ] Admin panel accessible

## 🛠️ Maintenance

### Daily Backups
Set up automated backups:
```bash
crontab -e
# Add: 0 2 * * * /var/www/kockys/scripts/backup.sh
```

### Health Monitoring
```bash
./scripts/health-check.sh
```

### View Logs
```bash
pm2 logs
```

### Update Content
All content updates can be done through the admin panel at:
`https://yourdomain.com/admin`

## 🆘 Troubleshooting

### Services Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Restart services
pm2 restart all
```

### Database Issues
```bash
cd backend
npx prisma migrate deploy
npx prisma db push
```

### Permission Issues
```bash
chmod -R 755 backend/uploads
chown -R www-data:www-data backend/uploads
```

### 502 Bad Gateway
- Check if all services are running: `pm2 status`
- Verify Nginx/Apache configuration
- Check firewall rules

## 📞 Support Resources

### Health Check Endpoints
- API Health: `https://yourdomain.com/api/health`
- Frontend: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin`

### Default Credentials
- Admin Email: admin@kockysbar.com
- Password: Set on first login

### Technology Stack
- Backend: Node.js, Express, TypeScript, Prisma
- Frontend: Next.js 14, React, TypeScript
- Admin: Next.js 14, React, TypeScript
- Database: SQLite with Prisma ORM
- Process Manager: PM2
- Web Server: Nginx/Apache

## 🎉 Deployment Complete!

Your Kocky's Bar & Grill website is now ready for production use. Remember to:
1. Change all default passwords
2. Set up regular backups
3. Monitor server resources
4. Keep dependencies updated

For additional support, refer to the documentation in the `docs/` directory.
