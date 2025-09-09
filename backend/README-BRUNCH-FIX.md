# 🍳 Kocky's Brunch Sync Fix

## Problem
The admin panel shows "No items in this section" for brunch items, while the frontend displays hardcoded brunch items that don't exist in the database.

## Solution
This fix will:
1. Add 9 brunch items to the database
2. Restart the backend server
3. Test the API endpoint
4. Enable proper syncing between frontend and admin panel

## How to Run the Fix

### Option 1: Run the Shell Script (Recommended)
```bash
cd /home/stagingkockys/public_html/current/backend
chmod +x run-brunch-fix.sh
./run-brunch-fix.sh
```

### Option 2: Run Commands Manually
```bash
cd /home/stagingkockys/public_html/current/backend
node quick-fix.js
pm2 restart kockys-backend
sleep 5
curl -s http://72.167.227.205:5001/api/menu/brunch
```

### Option 3: Run the Batch File (Windows)
```bash
cd /home/stagingkockys/public_html/current/backend
./FIX-BRUNCH.bat
```

## What Gets Added to Database

The following 9 brunch items will be added:

### Breakfast Items
- Classic Benedict ($14.99) - Featured
- Avocado Toast ($12.99) - Vegetarian
- Belgian Waffles ($11.99) - Vegetarian
- Steak & Eggs ($22.99) - Featured

### Lunch Items
- Brunch Burger ($16.99)
- Caesar Salad ($13.99) - Gluten-Free Option

### Drinks
- Bottomless Mimosas ($25.00) - Featured
- Bloody Mary ($10.00)
- Fresh Coffee ($4.00) - Unlimited Refills

## Expected Results

After running the fix:

✅ **Database**: 9 brunch items properly seeded
✅ **Admin Panel**: All items visible at `/menu-management?type=BRUNCH`
✅ **Frontend**: Loads items from API instead of hardcoded data
✅ **API**: Returns all brunch items at `/api/menu/brunch`

## Troubleshooting

If the fix doesn't work:

1. Check PM2 status: `pm2 status`
2. Check backend logs: `pm2 logs kockys-backend`
3. Verify database: `node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.menuItem.findMany({where: {menuType: 'BRUNCH'}}).then(items => console.log('Brunch items:', items.length)).finally(() => prisma.\$disconnect());"`

## Files Created

- `quick-fix.js` - Main database seeding script
- `run-brunch-fix.sh` - Complete fix script
- `FIX-BRUNCH.bat` - Windows batch file
- `EXECUTE-THESE-COMMANDS.txt` - Step-by-step instructions

## Support

If you encounter any issues, please share:
1. The output from running the script
2. Any error messages
3. The current state of the admin panel and frontend



