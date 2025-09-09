# Brunch Menu Sync Fix

## Problem
The frontend brunch page (http://72.167.227.205:3003/brunch) shows hardcoded items that don't exist in the backend database, causing a disconnect between the frontend and admin panel.

## Root Cause
1. Frontend uses hardcoded mock data instead of API calls
2. Database may be missing brunch items
3. API endpoints may not be working correctly

## Solution Steps

### Step 1: Fix Database and Seed Brunch Items
```bash
cd /home/stagingkockys/public_html/current/backend
node fix-brunch-sync.js
```

### Step 2: Restart Backend Server
```bash
chmod +x restart-backend.sh
./restart-backend.sh
```

### Step 3: Test API Endpoint
```bash
curl -s http://72.167.227.205:5001/api/menu/brunch | jq .
```

### Step 4: Verify Frontend is Updated
The frontend brunch page has been updated to:
- Fetch data from API instead of using mock data
- Handle loading states
- Map backend categories to frontend categories
- Display items in correct sections (Breakfast, Lunch, Drinks)

## Expected Results

### Database
- 9 brunch items properly seeded
- All items have correct categories, prices, and metadata
- Items are available for editing in admin panel

### API
- GET /api/menu/brunch returns all brunch items
- Items are properly formatted with success: true

### Frontend
- Loads brunch items from API
- Displays items in correct sections
- Shows loading states
- Handles errors gracefully

### Admin Panel
- Can view all brunch items at http://72.167.227.205:4000/menu-management?type=BRUNCH
- Can edit existing items
- Can add new brunch items
- Media uploads work correctly

## Files Modified

### Backend
- `fix-brunch-sync.js` - Comprehensive fix script
- `restart-backend.sh` - Server restart script
- `src/seed-brunch-items.ts` - Updated with proper TypeScript types

### Frontend
- `src/app/brunch/page.tsx` - Updated to fetch from API instead of mock data

## Testing Checklist

- [ ] Database has 9 brunch items
- [ ] API endpoint returns brunch items
- [ ] Frontend loads items from API
- [ ] Admin panel shows all brunch items
- [ ] Can edit items in admin panel
- [ ] Changes reflect on frontend
- [ ] Media uploads work
- [ ] Items display in correct sections

## Troubleshooting

If issues persist:
1. Check PM2 status: `pm2 status`
2. Check backend logs: `pm2 logs kockys-backend`
3. Verify database connection: `node check-brunch.js`
4. Test API directly: `node test-api.js`



