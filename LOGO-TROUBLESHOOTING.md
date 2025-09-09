# Logo Display Troubleshooting Guide

## Issue Identified
The frontend pages were showing the wrong logos (e.g., "Butta Brunch" yellow logo instead of Kocky's red logo) because the wrong image files were stored at the logo paths referenced in the database.

## Root Cause
When logos were uploaded for different pages through the admin panel, different image files were uploaded for each page instead of using the same Kocky's logo for all pages.

## Solution Applied

### 1. Verified API Response
The API was correctly returning logo URLs for each page:
```bash
# Example API responses:
home: /uploads/logos/logo-home-1756540005865-427634120.png (✅ Correct Kocky's logo)
brunch: /uploads/logos/logo-brunch-1756534662939-301758119.png (❌ Was wrong logo)
menu: /uploads/logos/logo-menu-1756494174807-108975346.png (❌ Was wrong logo)
```

### 2. Fixed Logo Files
Copied the correct Kocky's logo to all page-specific logo file paths:
```bash
# Files updated with correct Kocky's logo:
- logo-brunch-1756534662939-301758119.png
- logo-menu-1756494174807-108975346.png
- logo-happy-hour-1756494174817-743738233.png
- logo-catering-1756494174827-199741195.png
```

### 3. Updated Mobile Bar Page
Changed the mobile bar page to use the same logo as the home page instead of a different SVG file.

## How the System Works

### Logo Display Flow
```
1. Frontend page loads (e.g., /brunch)
   ↓
2. Page calls getHeroSettingsAsync('brunch')
   ↓
3. Fetches from http://localhost:5001/api/hero-settings/brunch
   ↓
4. API returns: { useLogo: true, logoUrl: "/uploads/logos/logo-brunch-..." }
   ↓
5. Frontend HeroSection component renders:
   <img src="http://localhost:5001/uploads/logos/logo-brunch-..." />
   ↓
6. Backend serves the actual image file from uploads/logos/
```

### Frontend Implementation
Each page (menu, brunch, happy-hour, etc.) has this structure:
```typescript
// Load settings from API
useEffect(() => {
  const loadSettings = async () => {
    const settings = await getHeroSettingsAsync('brunch');
    setHeroData({
      useLogo: settings.useLogo,
      logoUrl: settings.logoUrl
    });
  };
  loadSettings();
}, []);

// Pass to hero section
<EditableHeroSection
  showLogo={heroData.useLogo}
  logoUrl={heroData.logoUrl}
/>
```

## Testing Verification

### 1. Check API Response
```bash
curl http://localhost:5001/api/hero-settings/[page-name]
```

### 2. Verify Logo File
```bash
ls -la uploads/logos/logo-[page-name]-*.png
```

### 3. Test Direct Image Access
```bash
curl -I http://localhost:5001/uploads/logos/[filename]
```

### 4. Clear Caches
```bash
# Clear frontend cache
cd frontend && rm -rf .next/cache

# Clear browser cache
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

## Prevention
To prevent this issue in the future:

1. **Use Single Logo**: When uploading logos in the admin panel, use the same Kocky's logo file for all pages
2. **Centralized Logo**: Consider having a single "brand logo" setting that applies to all pages
3. **Validation**: Add backend validation to ensure uploaded logos are the correct brand assets

## Quick Fix Commands
If logos show incorrectly again, run these commands:
```bash
# Copy correct logo to all page files
for page in brunch menu happy-hour catering; do
  cp uploads/logos/logo-home-1756540005865-427634120.png \
     "uploads/logos/logo-${page}-*.png"
done

# Clear frontend cache
cd frontend && rm -rf .next/cache
```

## Status: ✅ RESOLVED
All pages now display the correct Kocky's logo.
