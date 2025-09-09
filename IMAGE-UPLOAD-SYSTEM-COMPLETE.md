# Image Upload System - Complete Configuration

## Overview
The image upload and preview system is now fully configured and hardcoded to always work correctly. All image URLs are centrally managed and point to the backend server (port 5001) where static files are served.

## Server Configuration
- **Backend Server**: `http://localhost:5001` - Handles all API requests and serves static files
- **Frontend Server**: `http://72.167.227.205:3003/` - Customer-facing website
- **Admin Panel**: `http://localhost:4000` - Content management system

## Image Storage Locations
All uploaded images are stored in:
- `/uploads/logos/` - Hero section logos for each page
- `/uploads/menu-items/` - Menu item images
- `/uploads/gallery/` - Gallery images

## Configuration File
All server URLs are centralized in:
```
admin-panel/src/config/server.ts
```

This file contains:
- Server URL constants
- `getImageUrl()` helper function - automatically prepends backend URL to relative paths
- `cleanHtmlEntities()` helper - cleans any HTML entity encoding

## How It Works

### 1. Image Upload Flow
```
Admin Panel → Upload Image → Backend API → Save to /uploads/ → Store path in DB
```

### 2. Image Display Flow
```
Component → getImageUrl(path) → Returns http://localhost:5001/uploads/... → Display Image
```

### 3. Automatic URL Handling
The `getImageUrl()` function handles all URL types:
- **Relative paths** (e.g., `/uploads/logos/logo.png`) → Prepends backend URL
- **Absolute URLs** (e.g., `http://...`) → Returns as-is
- **Data URLs** (e.g., `data:image/png;base64,...`) → Returns as-is
- **Empty/null** → Returns empty string

## Updated Components

### Admin Panel
1. **Hero Settings** (`hero-settings/page.tsx`)
   - Logo upload for each page
   - Preview with backend URL
   
2. **Menu Management** (`menu-management/page.tsx`)
   - Menu item image uploads
   - Thumbnail previews
   
3. **Media Page** (`media/page.tsx`)
   - Gallery image management

### Frontend
1. **HeroSection** (`components/sections/HeroSection.tsx`)
   - Displays uploaded logos from backend
   - Fallback to default if no logo

2. **Menu Pages** (`menu/page.tsx`, `happy-hour/page.tsx`, `brunch/page.tsx`)
   - Display menu item images from backend

## Testing Image Uploads

### 1. Upload a Logo
```bash
# Via Admin Panel UI
1. Go to http://localhost:4000/hero-settings
2. Select a page tab (Home, Menu, Brunch, etc.)
3. Click "Upload Logo for [Page]"
4. Select an image file
5. Click "Save Page"
```

### 2. Upload a Menu Item Image
```bash
# Via Admin Panel UI
1. Go to http://localhost:4000/menu-management
2. Create or edit a menu item
3. Click "Choose File" in the image section
4. Select an image
5. Click "Save Item"
```

### 3. Verify Display
- **Admin Panel Preview**: Image should show immediately after upload
- **Frontend Display**: Navigate to the page to see the uploaded image

## Troubleshooting

### If images don't display:
1. **Check backend is running**: `curl http://localhost:5001/health`
2. **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Check image exists**: `ls -la uploads/logos/` or `uploads/menu-items/`
4. **Test direct access**: `curl -I http://localhost:5001/uploads/logos/[filename]`

### Common Issues & Solutions:
- **Broken preview in admin**: Fixed by using `getImageUrl()` helper
- **HTML entities in URLs**: Fixed by cleaning entities before saving to DB
- **Port confusion**: All images served from backend (5001), not frontend (3003)
- **Cache issues**: Clear Next.js cache with `rm -rf .next/cache`

## Database Schema
Images are stored as URL paths in the database:
- `HeroSettings.logoUrl` - Logo path for each page
- `MenuItem.image` - Image path for menu items
- `GalleryItem.imageUrl` - Gallery image paths

## Persistence
All uploaded images and their database references persist:
- Across server restarts
- After cache clearing
- Through browser refreshes
- Until manually deleted by admin

## Security Notes
- File size limits enforced (5MB default)
- Allowed formats: JPG, PNG, WebP, GIF
- Files saved with unique timestamps to prevent conflicts
- Original filenames preserved with timestamp prefix

## Next Steps
The image upload system is fully operational. You can now:
1. Upload logos for each page's hero section
2. Add images to menu items
3. Manage gallery images
4. All with immediate preview and persistent storage
