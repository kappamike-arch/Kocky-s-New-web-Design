# Admin Panel Stability Guide

## Overview
This guide ensures the Next.js admin panel at `staging.kockys.com/admin` never breaks from MIME type issues again.

## ✅ Implemented Solutions

### 1. Optimized Nginx Configuration
- **Location**: `/etc/nginx/conf.d/staging-kockys.conf`
- **Features**:
  - Correct MIME types for all static assets
  - Immutable caching for hashed assets (`max-age=31536000, immutable`)
  - Security headers (`X-Content-Type-Options: nosniff`)
  - Proper charset declarations

### 2. MIME Type Mappings
| File Type | Extension | MIME Type | Cache Strategy |
|-----------|-----------|-----------|----------------|
| JavaScript | `.js`, `.mjs` | `application/javascript; charset=utf-8` | Immutable (1 year) |
| CSS | `.css` | `text/css; charset=utf-8` | Immutable (1 year) |
| JSON | `.json` | `application/json; charset=utf-8` | Moderate (1 hour) |
| WOFF2 | `.woff2` | `font/woff2` | Immutable (1 year) |
| WOFF | `.woff` | `font/woff` | Immutable (1 year) |
| TTF | `.ttf` | `font/ttf` | Immutable (1 year) |
| SVG | `.svg` | `image/svg+xml; charset=utf-8` | Moderate (1 day) |

### 3. Deployment Scripts

#### `deploy-admin-panel.sh`
- **Purpose**: Complete deployment with validation
- **Features**:
  - Clean build process
  - Dependency verification
  - Build output validation
  - Automatic validation testing
  - PM2 process management

#### `validate-admin-panel.sh`
- **Purpose**: Pre-deployment validation
- **Features**:
  - MIME type verification
  - Static asset accessibility
  - Cache header validation
  - Comprehensive health checks

#### `monitor-admin-panel.sh`
- **Purpose**: Ongoing health monitoring
- **Features**:
  - Real-time status checks
  - Performance monitoring
  - MIME type validation
  - System health reporting

## 🚀 Usage

### Deploy Admin Panel
```bash
bash /home/stagingkockys/deploy-admin-panel.sh
```

### Validate Deployment
```bash
bash /home/stagingkockys/validate-admin-panel.sh
```

### Monitor Health
```bash
bash /home/stagingkockys/monitor-admin-panel.sh
```

### Manual PM2 Commands
```bash
pm2 status admin          # Check status
pm2 logs admin --lines 50 # View logs
pm2 restart admin         # Restart process
```

## 🔧 Troubleshooting

### Common Issues

#### 1. MIME Type Errors
**Symptoms**: Browser console shows "Refused to execute script" errors
**Solution**: Run validation script and redeploy if needed
```bash
bash /home/stagingkockys/validate-admin-panel.sh
```

#### 2. Static Assets 404
**Symptoms**: JavaScript/CSS files return 404
**Solution**: Check nginx configuration and restart
```bash
nginx -t && systemctl reload nginx
```

#### 3. Admin Panel Not Loading
**Symptoms**: Page shows "Initializing..." indefinitely
**Solution**: Check PM2 status and restart if needed
```bash
pm2 status admin
pm2 restart admin
```

### Emergency Recovery
```bash
# Stop all processes
pm2 stop admin

# Clean rebuild
cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/admin-panel"
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Restart
pm2 start admin

# Validate
bash /home/stagingkockys/validate-admin-panel.sh
```

## 📊 Monitoring

### Health Check Endpoints
- **Main Page**: `https://staging.kockys.com/admin/`
- **Static Assets**: `https://staging.kockys.com/admin/_next/static/`
- **JavaScript**: `https://staging.kockys.com/admin/_next/static/chunks/`
- **CSS**: `https://staging.kockys.com/admin/_next/static/css/`

### Expected Headers
```http
Content-Type: application/javascript; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
X-Content-Type-Options: nosniff
Vary: Accept-Encoding
```

## 🔄 Maintenance Schedule

### Daily
- Run health monitor: `bash /home/stagingkockys/monitor-admin-panel.sh`

### Weekly
- Check PM2 logs for errors: `pm2 logs admin --lines 100`
- Verify static asset delivery

### Before Major Deployments
- Run full validation: `bash /home/stagingkockys/validate-admin-panel.sh`
- Test all critical admin panel functions

## 🚀 Future Enhancements

### CDN Integration (Optional)
For even better performance, consider:
1. **Cloudflare**: Free CDN with automatic caching
2. **AWS S3 + CloudFront**: Enterprise-grade static asset delivery
3. **Vercel**: Next.js-optimized hosting platform

### Implementation Steps for CDN:
1. Upload static assets to CDN
2. Update `assetPrefix` in `next.config.js`
3. Configure CDN with proper MIME types
4. Update nginx to proxy to CDN

## 📝 Notes

- All scripts are located in `/home/stagingkockys/`
- Nginx configuration is in `/etc/nginx/conf.d/staging-kockys.conf`
- Admin panel source is in the Kocky's project directory
- PM2 manages the Node.js process on port 4000
- Nginx proxies `/admin` requests to `127.0.0.1:4000`

## ✅ Success Criteria

The admin panel is considered stable when:
- ✅ All static assets return 200 OK
- ✅ MIME types are correct for all file types
- ✅ Cache headers include `immutable` for hashed assets
- ✅ No browser console errors
- ✅ Admin panel loads completely without "Initializing..." stuck state
- ✅ All navigation and functionality works properly
