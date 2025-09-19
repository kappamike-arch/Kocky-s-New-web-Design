# Hero Section Upload System Analysis

## 🔍 **Current Status**

### **Files Exist on Disk:**
✅ **Hero Images:** `/home/stagingkockys/public_html/uploads/images/`
- `home-hero.jpg`
- `menu-hero.jpg` 
- `happy-hour-hero.jpg`
- `brunch-hero.jpg`
- `mobile-bar-hero.jpg`
- `catering-hero.jpg` (and .png)
- `food-truck-hero.jpg` (and .png)

✅ **Hero Videos:** `/home/stagingkockys/public_html/uploads/videos/`
- `home-hero.mp4`
- `menu-hero.mp4`
- `happy-hour-hero.mp4` (and .mov)
- `brunch-hero.mp4`
- `mobile-bar-hero.mp4`
- `catering-hero.mp4`
- `food-truck-hero.mp4`

### **Database Status:**
❌ **All `backgroundImage` and `backgroundVideo` fields are NULL**
- Files exist on disk but database references are missing
- Only `logoUrl` fields are populated
- `mediaPreference` is set to "auto" for all pages

## 🚨 **Root Cause Analysis**

### **Problem 1: Upload System Not Saving to Database**
The upload endpoints in `hero-settings.routes.ts` save files to disk but **DO NOT update the database** with the file paths.

**Current Upload Flow:**
1. ✅ File uploaded to `/uploads/images/` or `/uploads/videos/`
2. ❌ Database `backgroundImage`/`backgroundVideo` fields remain NULL
3. ❌ Frontend can't find the files because DB has no references

### **Problem 2: Missing Database Updates**
Looking at the upload routes:
- `POST /hero-settings/:pageId/upload-image` - saves file but doesn't update DB
- `POST /hero-settings/:pageId/upload-video` - saves file but doesn't update DB

### **Problem 3: Admin Panel Expects Database References**
The admin panel's media management page expects the database to have the file paths, but they're all NULL.

## 🔧 **Solution: Fix Upload System**

### **Step 1: Update Upload Routes to Save Database References**

The upload routes need to:
1. Save the file to disk (✅ already working)
2. Update the database with the file path (❌ missing)
3. Return the correct URL for the admin panel (❌ needs fixing)

### **Step 2: Backfill Existing Files**

Since files already exist on disk, we need to:
1. Create a migration script to populate the database with existing file paths
2. Map the existing files to their correct page IDs

### **Step 3: Fix URL Generation**

Ensure uploaded files are accessible via the correct staging.kockys.com URLs.

## 📁 **File Structure Analysis**

### **Upload Directories:**
```
/home/stagingkockys/public_html/uploads/
├── images/
│   ├── home-hero.jpg
│   ├── menu-hero.jpg
│   ├── happy-hour-hero.jpg
│   ├── brunch-hero.jpg
│   ├── mobile-bar-hero.jpg
│   ├── catering-hero.jpg
│   ├── catering-hero.png
│   ├── food-truck-hero.jpg
│   └── food-truck-hero.png
└── videos/
    ├── home-hero.mp4
    ├── menu-hero.mp4
    ├── happy-hour-hero.mp4
    ├── happy-hour-hero.mov
    ├── brunch-hero.mp4
    ├── mobile-bar-hero.mp4
    ├── catering-hero.mp4
    └── food-truck-hero.mp4
```

### **Database Schema:**
```sql
model HeroSettings {
  id              String   @id @default(cuid())
  pageId          String   @unique
  pageName        String
  pageSlug        String
  useLogo         Boolean  @default(true)
  logoUrl         String?
  title           String?
  subtitle        String?
  description     String?
  backgroundImage String?  -- ❌ All NULL
  backgroundVideo String?  -- ❌ All NULL
  mediaPreference String?  @default("auto")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🎯 **Page ID Mapping**

| Page ID | Page Name | Expected Image | Expected Video |
|---------|-----------|----------------|----------------|
| home | Home | home-hero.jpg | home-hero.mp4 |
| menu | Menu | menu-hero.jpg | menu-hero.mp4 |
| happy-hour | Happy Hour | happy-hour-hero.jpg | happy-hour-hero.mp4 |
| brunch | Weekend Brunch | brunch-hero.jpg | brunch-hero.mp4 |
| mobile | Mobile Bar | mobile-bar-hero.jpg | mobile-bar-hero.mp4 |
| catering | Catering | catering-hero.jpg | catering-hero.mp4 |
| food-truck | Food Truck | food-truck-hero.jpg | food-truck-hero.mp4 |

## 🔄 **Next Steps**

1. **Fix Upload Routes** - Update database when files are uploaded
2. **Create Migration Script** - Backfill existing files into database
3. **Test Upload Flow** - Ensure new uploads work end-to-end
4. **Verify Admin Panel** - Confirm media management displays correctly





