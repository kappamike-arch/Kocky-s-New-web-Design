# 📋 Deployment Checklist

## Pre-Deployment
- [ ] Backup existing site (if applicable)
- [ ] Verify server meets requirements
- [ ] Domain DNS configured
- [ ] SSL certificate ready
- [ ] Database backup created

## Server Setup
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx/Apache configured
- [ ] Firewall rules updated
- [ ] Upload directory permissions set

## Application Deployment
- [ ] Package uploaded and extracted
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Services started with PM2

## Configuration
- [ ] Web server proxy configured
- [ ] SSL certificate installed
- [ ] Environment variables verified
- [ ] Email settings tested
- [ ] Upload paths confirmed

## Testing
- [ ] Frontend loads (https://domain.com)
- [ ] Admin panel accessible (https://domain.com/admin)
- [ ] API responds (https://domain.com/api/health)
- [ ] Forms submit successfully
- [ ] Images upload properly
- [ ] Email notifications work

## Security
- [ ] Default passwords changed
- [ ] JWT secrets updated
- [ ] Database backed up
- [ ] File permissions verified
- [ ] Firewall configured
- [ ] SSL working properly

## Performance
- [ ] Gzip compression enabled
- [ ] Static assets cached
- [ ] PM2 cluster mode active
- [ ] Monitoring set up
- [ ] Backup cron job created

## Documentation
- [ ] Admin credentials saved securely
- [ ] Deployment notes documented
- [ ] Support contacts listed
- [ ] Maintenance procedures defined
