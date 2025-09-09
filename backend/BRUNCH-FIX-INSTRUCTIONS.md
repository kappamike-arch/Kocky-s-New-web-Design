# 🍳 Brunch Sync Fix - cPanel/WHM Instructions

## Problem
- Frontend shows hardcoded brunch items
- Admin panel shows "No items in this section"
- Database is missing brunch items

## Solution
Run these commands in your cPanel Terminal or WHM Terminal

## Step-by-Step Instructions

### Option 1: cPanel Terminal
1. Log into cPanel
2. Go to **Advanced** → **Terminal**
3. Run these commands:

```bash
cd /home/stagingkockys/public_html/current/backend
node test-and-fix.js
pm2 restart kockys-backend
```

### Option 2: WHM Terminal
1. Log into WHM
2. Go to **Server Configuration** → **Terminal**
3. Run these commands:

```bash
su - stagingkockys
cd /home/stagingkockys/public_html/current/backend
node test-and-fix.js
pm2 restart kockys-backend
```

## What the Script Does

The `test-and-fix.js` script will:
1. Check if brunch items exist in database
2. Add 9 brunch items if missing:
   - Classic Benedict ($14.99)
   - Avocado Toast ($12.99)
   - Belgian Waffles ($11.99)
   - Steak & Eggs ($22.99)
   - Brunch Burger ($16.99)
   - Caesar Salad ($13.99)
   - Bottomless Mimosas ($25.00)
   - Bloody Mary ($10.00)
   - Fresh Coffee ($4.00)
3. Test the API endpoint
4. Provide status updates

## Expected Output

You should see:
```
🔍 Testing current state...
📊 Database has 0 brunch items
📝 Adding brunch items to database...
✅ Added: Classic Benedict
✅ Added: Avocado Toast
... (continues for all items)
🎉 All 9 brunch items added to database!
🧪 Testing API endpoint...
✅ API returned 9 brunch items
```

## After Running

Check these URLs:
- **Admin Panel**: http://72.167.227.205:4000/menu-management?type=BRUNCH
- **Frontend**: http://72.167.227.205:3003/brunch

## Troubleshooting

If you get errors:
1. Make sure you're in the correct directory: `/home/stagingkockys/public_html/current/backend`
2. Check if Node.js is installed: `node -v`
3. Check if PM2 is running: `pm2 status`
4. Check backend logs: `pm2 logs kockys-backend`

## Files Created

- `test-and-fix.js` - Main fix script
- `FIX-BRUNCH-NOW.sh` - Shell script version
- `quick-fix.js` - Simple database fix
- `BRUNCH-FIX-INSTRUCTIONS.md` - This file



