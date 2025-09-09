# 🍳 Brunch Sync Fix - cPanel Instructions

## Your Domain Configuration
Based on your cPanel setup:
- **Main Domain**: `staging.kockys.com` → `/public_html`
- **API Domain**: `api.staging.kockys.com` → `/public_html/api` → `http://127.0.0.1:5001/$1`

## How to Fix Brunch Syncing

### Step 1: Access cPanel Terminal
1. Log into your cPanel
2. Go to **Advanced** → **Terminal**
3. Navigate to the backend directory:
   ```bash
   cd /home/stagingkockys/public_html/current/backend
   ```

### Step 2: Run the Fix Script
```bash
chmod +x CPANEL-FIX.sh
./CPANEL-FIX.sh
```

### Step 3: Alternative - Run Commands Manually
```bash
# Check if files exist
ls -la *.js

# Run the fix script
node test-and-fix.js

# Try to restart backend (if PM2 is available)
pm2 restart kockys-backend

# Test API endpoints
curl -s http://api.staging.kockys.com/menu/brunch
curl -s http://72.167.227.205:5001/api/menu/brunch
```

## What the Fix Will Do

1. **Check Database**: Verify brunch items exist
2. **Add Items**: Add 9 brunch items if missing:
   - Classic Benedict ($14.99)
   - Avocado Toast ($12.99)
   - Belgian Waffles ($11.99)
   - Steak & Eggs ($22.99)
   - Brunch Burger ($16.99)
   - Caesar Salad ($13.99)
   - Bottomless Mimosas ($25.00)
   - Bloody Mary ($10.00)
   - Fresh Coffee ($4.00)
3. **Test API**: Verify both domain and direct IP endpoints work
4. **Restart Server**: Attempt to restart the backend service

## Expected Results

After running the fix:

✅ **Database**: 9 brunch items properly seeded
✅ **API (Domain)**: `http://api.staging.kockys.com/menu/brunch` returns items
✅ **API (Direct)**: `http://72.167.227.205:5001/api/menu/brunch` returns items
✅ **Admin Panel**: `http://staging.kockys.com:4000/menu-management?type=BRUNCH` shows items
✅ **Frontend**: `http://staging.kockys.com:3003/brunch` loads from API

## Troubleshooting

### If Node.js is not available:
- Contact your hosting provider to install Node.js
- Or use the hosting provider's Node.js version manager

### If PM2 is not available:
- The backend may be managed by your hosting provider
- Check your hosting control panel for process management
- Or contact support to restart the backend service

### If API endpoints don't work:
- Check if the backend service is running
- Verify the domain redirect configuration in cPanel
- Check firewall settings

## Files Created

- `CPANEL-FIX.sh` - Complete cPanel fix script
- `CPANEL-INSTRUCTIONS.md` - This file
- `test-and-fix.js` - Main database fix script

## Support

If you encounter issues:
1. Check the output from running the script
2. Verify your domain configuration in cPanel
3. Contact your hosting provider if Node.js/PM2 is not available



