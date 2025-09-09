# 🍳 Brunch Sync Fix - API Key Version

## Using Your API Key

If you have an API key/token, you can use it to fix the brunch syncing issue.

## How to Use

### Option 1: Set API Key as Environment Variable
```bash
export API_KEY="your_api_key_here"
node API-KEY-FIX.js
```

### Option 2: Edit the Script
1. Open `API-KEY-FIX.js`
2. Replace `'YOUR_API_KEY_HERE'` with your actual API key
3. Run: `node API-KEY-FIX.js`

### Option 3: Pass API Key as Parameter
```bash
API_KEY="your_api_key_here" node API-KEY-FIX.js
```

## What the Script Does

1. **Database Check**: Checks if brunch items exist
2. **Add Items**: Adds 9 brunch items if missing
3. **API Test**: Tests the backend API endpoint
4. **Admin Panel Test**: Tests admin panel accessibility
5. **Frontend Test**: Tests frontend accessibility

## Expected Output

```
🍳 KOCKY'S BRUNCH SYNC FIX - API KEY VERSION
==============================================
🔍 Step 1: Checking database...
📊 Database has 0 brunch items
📝 Step 2: Adding brunch items to database...
✅ Added: Classic Benedict
✅ Added: Avocado Toast
... (continues for all items)
🎉 All 9 brunch items added to database!

🧪 Step 3: Testing API endpoint...
✅ API returned 9 brunch items

🔍 Step 4: Testing admin panel...
✅ Admin panel accessible (Status: 200)

🔍 Step 5: Testing frontend...
✅ Frontend accessible (Status: 200)
```

## After Running

Check these URLs:
- **Admin Panel**: http://72.167.227.205:4000/menu-management?type=BRUNCH
- **Frontend**: http://72.167.227.205:3003/brunch
- **API**: http://72.167.227.205:5001/api/menu/brunch

## Troubleshooting

If you get authentication errors:
1. Make sure your API key is correct
2. Check if the API key has the right permissions
3. Verify the API key format (Bearer token, etc.)

## Files Created

- `API-KEY-FIX.js` - Main fix script with API key support
- `API-KEY-INSTRUCTIONS.md` - This file



