# Cache Clearing Instructions

## Browser Cache Clear (REQUIRED)

### Method 1: Developer Console
1. Go to http://72.167.227.205:3003//brunch
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run these commands:
```javascript
localStorage.clear();
sessionStorage.clear();
caches.keys().then(names => names.forEach(name => caches.delete(name)));
window.location.reload(true);
```

### Method 2: Hard Refresh
- Press **Ctrl+Shift+R** (Windows/Linux)
- Press **Cmd+Shift+R** (Mac)

### Method 3: Incognito/Private Mode
- Open http://72.167.227.205:3003//brunch in an incognito/private window

## Expected Result
After clearing cache:
- ✅ Logo should load correctly
- ✅ No broken image icon
- ✅ Console shows successful API calls

## If Still Broken
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify logo URL: http://localhost:5001/uploads/logos/logo-brunch-1756441267536-97596542.png
