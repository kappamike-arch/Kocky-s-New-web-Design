import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Map existing files to page IDs
const heroFileMapping = {
  'home': {
    image: '/uploads/images/home-hero.jpg',
    video: '/uploads/videos/home-hero.mp4'
  },
  'menu': {
    image: '/uploads/images/menu-hero.jpg',
    video: '/uploads/videos/menu-hero.mp4'
  },
  'happy-hour': {
    image: '/uploads/images/happy-hour-hero.jpg',
    video: '/uploads/videos/happy-hour-hero.mp4'
  },
  'brunch': {
    image: '/uploads/images/brunch-hero.jpg',
    video: '/uploads/videos/brunch-hero.mp4'
  },
  'mobile': {
    image: '/uploads/images/mobile-bar-hero.jpg',
    video: '/uploads/videos/mobile-bar-hero.mp4'
  },
  'catering': {
    image: '/uploads/images/catering-hero.jpg', // Will check for .png alternative
    video: '/uploads/videos/catering-hero.mp4'
  },
  'food-truck': {
    image: '/uploads/images/food-truck-hero.jpg', // Will check for .png alternative
    video: '/uploads/videos/food-truck-hero.mp4'
  }
};

async function checkFileExists(filePath: string): Promise<boolean> {
  const fullPath = path.join('/home/stagingkockys/public_html', filePath);
  return fs.existsSync(fullPath);
}

async function findBestImageFile(pageId: string, baseName: string): Promise<string | null> {
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  for (const ext of extensions) {
    const filePath = `/uploads/images/${baseName}${ext}`;
    if (await checkFileExists(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

async function migrateHeroFiles() {
  console.log('🔄 Starting hero files migration...');
  
  try {
    // Get all existing hero settings
    const existingSettings = await prisma.heroSettings.findMany({
      select: {
        pageId: true,
        pageName: true,
        backgroundImage: true,
        backgroundVideo: true
      }
    });
    
    console.log(`📊 Found ${existingSettings.length} hero settings in database`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const setting of existingSettings) {
      const pageId = setting.pageId;
      const mapping = heroFileMapping[pageId as keyof typeof heroFileMapping];
      
      if (!mapping) {
        console.log(`⚠️  No mapping found for page: ${pageId}`);
        continue;
      }
      
      console.log(`\n🔍 Processing page: ${pageId} (${setting.pageName})`);
      
      let hasChanges = false;
      const updateData: { backgroundImage?: string; backgroundVideo?: string } = {};
      
      // Check and update background image
      if (!setting.backgroundImage) {
        const imagePath = await findBestImageFile(pageId, `${pageId}-hero`);
        if (imagePath) {
          updateData.backgroundImage = imagePath;
          hasChanges = true;
          console.log(`  ✅ Found image: ${imagePath}`);
        } else {
          console.log(`  ❌ No image found for ${pageId}`);
        }
      } else {
        console.log(`  ⏭️  Image already set: ${setting.backgroundImage}`);
      }
      
      // Check and update background video
      if (!setting.backgroundVideo) {
        const videoExists = await checkFileExists(mapping.video);
        if (videoExists) {
          updateData.backgroundVideo = mapping.video;
          hasChanges = true;
          console.log(`  ✅ Found video: ${mapping.video}`);
        } else {
          console.log(`  ❌ No video found: ${mapping.video}`);
        }
      } else {
        console.log(`  ⏭️  Video already set: ${setting.backgroundVideo}`);
      }
      
      // Update database if we have changes
      if (hasChanges) {
        await prisma.heroSettings.update({
          where: { pageId },
          data: updateData
        });
        
        console.log(`  💾 Updated database for ${pageId}`);
        updatedCount++;
      } else {
        console.log(`  ⏭️  No changes needed for ${pageId}`);
        skippedCount++;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`  ✅ Updated: ${updatedCount} pages`);
    console.log(`  ⏭️  Skipped: ${skippedCount} pages`);
    
    // Verify the results
    console.log(`\n🔍 Verifying results...`);
    const finalSettings = await prisma.heroSettings.findMany({
      select: {
        pageId: true,
        pageName: true,
        backgroundImage: true,
        backgroundVideo: true
      }
    });
    
    for (const setting of finalSettings) {
      console.log(`${setting.pageId}: image=${!!setting.backgroundImage}, video=${!!setting.backgroundVideo}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateHeroFiles()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });




