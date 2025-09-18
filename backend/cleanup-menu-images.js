const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanupCorruptedMenuImages() {
  try {
    console.log('🔍 Checking menu items for corrupted image references...');
    
    // Get all menu items
    const menuItems = await prisma.menuItem.findMany({
      select: { id: true, name: true, image: true }
    });
    
    console.log(`Found ${menuItems.length} menu items to check`);
    
    let cleanedCount = 0;
    
    for (const item of menuItems) {
      if (item.image) {
        const isCorrupted = 
          item.image.endsWith('-') ||           // Ends with dash
          item.image.endsWith('-.') ||          // Ends with dash-dot
          item.image.includes('--') ||          // Double dashes
          item.image.length < 10 ||             // Too short
          !item.image.includes('.') ||          // No file extension
          item.image.split('.').pop().length > 5; // Invalid extension
        
        if (isCorrupted) {
          console.log(`❌ Corrupted image found for "${item.name}": "${item.image}"`);
          
          // Check if the file exists on disk
          const possiblePaths = [
            path.join('/home/stagingkockys/public_html/uploads/menu-items', path.basename(item.image)),
            path.join('/home/stagingkockys/public_html/uploads', path.basename(item.image))
          ];
          
          let fileExists = false;
          for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
              console.log(`  📁 File exists at: ${filePath}`);
              fileExists = true;
              break;
            }
          }
          
          if (!fileExists) {
            console.log(`  🗑️ File not found, removing image reference`);
            await prisma.menuItem.update({
              where: { id: item.id },
              data: { image: null }
            });
            cleanedCount++;
          }
        } else {
          // Check if the image file actually exists
          const imagePath = path.join('/home/stagingkockys/public_html/uploads/menu-items', path.basename(item.image));
          if (!fs.existsSync(imagePath)) {
            console.log(`❌ Image file missing for "${item.name}": "${item.image}"`);
            console.log(`  🗑️ Removing reference to missing file`);
            await prisma.menuItem.update({
              where: { id: item.id },
              data: { image: null }
            });
            cleanedCount++;
          } else {
            console.log(`✅ Valid image for "${item.name}": "${item.image}"`);
          }
        }
      } else {
        console.log(`📝 No image for "${item.name}"`);
      }
    }
    
    console.log(`\n✨ Cleanup completed! Cleaned ${cleanedCount} corrupted image references.`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCorruptedMenuImages();
