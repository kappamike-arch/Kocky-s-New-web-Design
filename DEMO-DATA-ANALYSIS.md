# Demo Data Analysis & Restoration Guide

## 🔍 **Static/Seeded Sample Data Locations**

### **1. Seed Scripts (Backend)**
**Location:** `/backend/src/` and `/backend/prisma/`

| File | Description | Demo Data |
|------|-------------|-----------|
| `prisma/seed.ts` | Main database seed | 10 menu items, users, settings, happy hour |
| `src/seed-brunch-items.ts` | Brunch menu items | 9 brunch items (Benedict, Waffles, Mimosas, etc.) |
| `src/seed-content.ts` | Content management | Menu sections, items, gallery, page content |
| `src/seed-crm-data.ts` | CRM & bookings | 3 reservations, 2 food truck, 2 mobile bar bookings |
| `src/seed-happy-hour.ts` | Happy hour page | Happy hour page content |

### **2. Static JSON Files**
**Location:** `/backend/data/services/`

| File | Description | Demo Data |
|------|-------------|-----------|
| `mobile-bar.json` | Mobile bar packages | 3 packages (Essential, Premium, Luxury) |
| `food-truck.json` | Food truck service | Basic service info (minimal) |

### **3. Hardcoded Demo Data in Components**
**Location:** Frontend components

| File | Description | Demo Data |
|------|-------------|-----------|
| `frontend/src/components/home/MenuPreview.tsx` | Home page menu preview | 4 items (Burger, Ribs, Wings, Cocktail) |
| `frontend/src/app/menu/page.tsx` | Menu page | Static menu items array |
| `backend/src/dev-server.ts` | Development server | 3 menu items, 1 food truck booking |

## 🎯 **Specific Demo Records Found**

### **Menu Items with Keywords:**
- **Wings:** "Buffalo Wings", "Chicken Wings", "Happy Hour Wings"
- **Mimosa:** "Bottomless Mimosas" (brunch items)
- **Happy Hour:** "Happy Hour Wings", "House Margarita"
- **Catering:** Service type in inquiries
- **Food Truck:** Service type and booking examples

### **Inquiries & Bookings:**
- Food Truck inquiries and bookings
- Mobile Bar inquiries and bookings
- Catering inquiries
- Test reservations

## 📊 **Import Status**

### **✅ Backend Integration:**
- All seed scripts use Prisma ORM
- Static JSON files used by service settings
- Dev-server has in-memory demo data

### **✅ Frontend Integration:**
- Components use hardcoded arrays as fallbacks
- API calls to backend for dynamic data
- Static data used when API fails

## 🚀 **Restoration Commands**

### **Quick Reload (All Demo Data):**
```bash
cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/backend"
./reload-demo-data.sh
```

### **Individual Seed Scripts:**
```bash
# Main seed (basic data)
npx prisma db seed

# Brunch items
npx ts-node src/seed-brunch-items.ts

# Content management (all menu types)
npx ts-node src/seed-content.ts

# CRM data (bookings & inquiries)
npx ts-node src/seed-crm-data.ts

# Happy hour page
npx ts-node src/seed-happy-hour.ts

# Frontend demo data migration
npx ts-node migrate-frontend-demo-data.ts
```

## 📋 **Expected Results After Reload**

### **Menu Items:**
- **REGULAR:** 14+ items
- **BRUNCH:** 12 items
- **HAPPY_HOUR:** 2 items
- **SPECIALS:** 1 item

### **CRM Data:**
- **Contact Inquiries:** 6+ items
- **Food Truck Bookings:** 2+ items
- **Mobile Bar Bookings:** 2+ items
- **Reservations:** 3+ items
- **Quotes:** 2+ items

### **Content:**
- **Gallery Items:** 5+ items
- **Page Content:** 6+ pages
- **Menu Sections:** 10+ sections

## 🔧 **Files Created for Restoration**

1. **`reload-demo-data.sh`** - Complete demo data reload script
2. **`migrate-frontend-demo-data.ts`** - Migrates hardcoded frontend data to database
3. **`DEMO-DATA-ANALYSIS.md`** - This analysis document

## 🌐 **Testing URLs**

After reload, test these endpoints:
- **Frontend:** http://staging.kockys.com:3003
- **Admin Panel:** http://staging.kockys.com:4000
- **Backend API:** http://staging.kockys.com:5001
- **Prisma Studio:** http://localhost:5555 (if running)

## 📝 **Notes**

- All seed scripts are idempotent (safe to run multiple times)
- Frontend hardcoded data serves as fallbacks when API fails
- Dev-server data is in-memory only (resets on restart)
- Database uses SQLite for development
- All demo data includes realistic pricing and descriptions


