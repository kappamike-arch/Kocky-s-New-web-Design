const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanupInvalidLogos() {
  try {
    console.log('🔍 Checking hero settings for invalid logos...');
    const heroSettings = await prisma.heroSettings.findMany();
    
    for (const setting of heroSettings) {
      if (setting.logoUrl && !setting.logoUrl.startsWith('http')) {
        // Check if file exists
        const filePath = path.join('/home/stagingkockys/public_html', setting.logoUrl);
        console.log(`Checking: ${setting.pageName} -> ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`❌ Removing invalid logo for ${setting.pageName}: ${setting.logoUrl}`);
          await prisma.heroSettings.update({
            where: { id: setting.id },
            data: { logoUrl: null, useLogo: false }
          });
        } else {
          console.log(`✅ Valid logo for ${setting.pageName}`);
        }
      } else if (setting.logoUrl && setting.logoUrl.startsWith('http')) {
        console.log(`🌐 Full URL logo for ${setting.pageName}: ${setting.logoUrl}`);
      } else {
        console.log(`📝 No logo for ${setting.pageName}`);
      }
    }
    
    console.log('✨ Cleanup completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInvalidLogos();
