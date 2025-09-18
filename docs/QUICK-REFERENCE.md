# 🚀 Quick Reference Guide

## Essential Commands

### Service Management
```bash
# Start all services
./scripts/start.sh

# Stop all services
./scripts/stop.sh

# Restart services
pm2 restart all

# View status
pm2 status

# View logs
pm2 logs
```

### Database Operations
```bash
# Run migrations
cd backend && npx prisma migrate deploy

# Create backup
./scripts/backup.sh

# Reset database
cd backend && npx prisma migrate reset
```

### Troubleshooting
```bash
# Health check
./scripts/health-check.sh

# Check specific service
pm2 logs kockys-backend
pm2 logs kockys-frontend
pm2 logs kockys-admin

# Restart specific service
pm2 restart kockys-backend
```

## Common Issues & Solutions

### 502 Bad Gateway
1. Check PM2 status: `pm2 status`
2. Restart services: `pm2 restart all`
3. Check logs: `pm2 logs`

### Database Locked
1. Stop all services: `pm2 stop all`
2. Remove lock: `rm backend/prisma/kockys.db-journal`
3. Start services: `pm2 start all`

### Images Not Loading
1. Check permissions: `ls -la backend/uploads`
2. Fix permissions: `chmod -R 755 backend/uploads`
3. Check nginx config for /uploads location

### Email Not Sending
1. Verify SMTP settings in .env
2. Test with admin panel email test
3. Check firewall for port 587

## URLs & Endpoints

- Main Site: https://yourdomain.com
- Admin Panel: https://yourdomain.com/admin
- API Base: https://yourdomain.com/api
- Health Check: https://yourdomain.com/api/health
- Uploads: https://yourdomain.com/uploads

## Default Ports

- Backend API: 5001
- Frontend: 3003
- Admin Panel: 4000
