const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBrunchItems() {
  try {
    console.log('Checking brunch items in database...');
    
    const brunchItems = await prisma.menuItem.findMany({
      where: { 
        menuType: 'BRUNCH'
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`Found ${brunchItems.length} brunch items:`);
    brunchItems.forEach(item => {
      console.log(`- ${item.name}: $${item.price} (${item.available ? 'Available' : 'Unavailable'}) [${item.category}]`);
    });
    
    if (brunchItems.length === 0) {
      console.log('No brunch items found! Need to seed the database.');
    }
    
  } catch (error) {
    console.error('Error checking brunch items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrunchItems();



