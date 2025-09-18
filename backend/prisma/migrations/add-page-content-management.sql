-- Add PageContent model for managing navigation tab content
CREATE TABLE IF NOT EXISTS "PageContent" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "heroTitle" TEXT,
  "heroSubtitle" TEXT,
  "heroImage" TEXT,
  "heroVideo" TEXT,
  "heroLogo" TEXT,
  "content" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "customCss" TEXT,
  "customJs" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Add MenuType enum for different menu categories
CREATE TYPE "MenuType" AS ENUM ('REGULAR', 'HAPPY_HOUR', 'BRUNCH', 'SPECIALS');

-- Update MenuItem table to include menu type
ALTER TABLE "MenuItem" 
ADD COLUMN IF NOT EXISTS "menuType" "MenuType" DEFAULT 'REGULAR',
ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "happyHourPrice" DECIMAL(65,30),
ADD COLUMN IF NOT EXISTS "servingSize" TEXT,
ADD COLUMN IF NOT EXISTS "preparationTime" INTEGER;

-- Create GalleryItem table
CREATE TABLE IF NOT EXISTS "GalleryItem" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "category" TEXT,
  "tags" JSONB DEFAULT '[]',
  "sortOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Create MenuSection table for organizing menu items
CREATE TABLE IF NOT EXISTS "MenuSection" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "menuType" "MenuType" NOT NULL DEFAULT 'REGULAR',
  "sortOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Add sectionId to MenuItem
ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "sectionId" TEXT,
ADD CONSTRAINT "MenuItem_sectionId_fkey" 
FOREIGN KEY ("sectionId") REFERENCES "MenuSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "PageContent_slug_idx" ON "PageContent"("slug");
CREATE INDEX IF NOT EXISTS "MenuItem_menuType_idx" ON "MenuItem"("menuType");
CREATE INDEX IF NOT EXISTS "MenuSection_menuType_idx" ON "MenuSection"("menuType");
CREATE INDEX IF NOT EXISTS "GalleryItem_category_idx" ON "GalleryItem"("category");

-- Insert default page content for navigation tabs
INSERT INTO "PageContent" ("slug", "title", "heroTitle", "heroSubtitle", "content", "isActive") VALUES
('menu', 'Menu', 'Our Menu', 'Delicious dishes made with love', '', true),
('happy-hour', 'Happy Hour', 'Happy Hour Specials', 'Join us for great deals on drinks and appetizers', '', true),
('brunch', 'Brunch', 'Weekend Brunch', 'Start your weekend right with our amazing brunch', '', true),
('gallery', 'Gallery', 'Photo Gallery', 'Memories from Kocky''s Bar & Grill', '', true),
('reservations', 'Reservations', 'Make a Reservation', 'Book your table today', '', true),
('food-truck', 'Food Truck', 'Mobile Food Service', 'We bring the party to you', '', true),
('mobile-bar', 'Mobile Bar', 'Mobile Bar Service', 'Professional bartending at your event', '', true),
('catering', 'Catering', 'Catering Services', 'Let us cater your next event', '', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default menu sections
INSERT INTO "MenuSection" ("name", "description", "menuType", "sortOrder") VALUES
('Appetizers', 'Start your meal right', 'REGULAR', 1),
('Entrees', 'Main courses', 'REGULAR', 2),
('Desserts', 'Sweet endings', 'REGULAR', 3),
('Beverages', 'Drinks and refreshments', 'REGULAR', 4),
('Happy Hour Appetizers', 'Discounted starters', 'HAPPY_HOUR', 1),
('Happy Hour Drinks', 'Special drink prices', 'HAPPY_HOUR', 2),
('Brunch Classics', 'Traditional brunch favorites', 'BRUNCH', 1),
('Brunch Specials', 'Chef''s special brunch items', 'BRUNCH', 2),
('Brunch Drinks', 'Mimosas, Bloody Marys, and more', 'BRUNCH', 3);
