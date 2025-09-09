const { PrismaClient, MenuCategory, MenuType } = require('@prisma/client');

const prisma = new PrismaClient();

const brunchItems = [
  // Breakfast Favorites
  {
    name: "Classic Benedict",
    description: "Poached eggs, Canadian bacon, hollandaise on English muffin",
    category: MenuCategory.ENTREE,
    menuType: MenuType.BRUNCH,
    price: 14.99,
    servingSize: "2 eggs",
    featured: true,
    sortOrder: 1,
    tags: [],
    allergens: []
  },
  {
    name: "Avocado Toast",
    description: "Smashed avocado, poached eggs, cherry tomatoes, feta",
    category: MenuCategory.ENTREE,
    menuType: MenuType.BRUNCH,
    price: 12.99,
    servingSize: "2 slices",
    featured: false,
    sortOrder: 2,
    tags: ["Vegetarian"],
    allergens: ["Gluten", "Dairy"]
  },
  {
    name: "Belgian Waffles",
    description: "Light and fluffy Belgian waffles with maple syrup and fresh berries",
    category: MenuCategory.ENTREE,
    menuType: MenuType.BRUNCH,
    price: 11.99,
    servingSize: "2 waffles",
    featured: false,
    sortOrder: 3,
    tags: ["Vegetarian"],
    allergens: ["Gluten", "Dairy", "Eggs"]
  },
  {
    name: "Steak & Eggs",
    description: "Grilled sirloin steak with two eggs any style and home fries",
    category: MenuCategory.ENTREE,
    menuType: MenuType.BRUNCH,
    price: 22.99,
    servingSize: "8oz steak",
    featured: true,
    sortOrder: 4,
    tags: [],
    allergens: ["Eggs"]
  },
  
  // Lunch Options
  {
    name: "Brunch Burger",
    description: "Beef patty, fried egg, bacon, cheese, special sauce",
    category: MenuCategory.ENTREE,
    menuType: MenuType.BRUNCH,
    price: 16.99,
    servingSize: "1 burger",
    featured: false,
    sortOrder: 5,
    tags: [],
    allergens: ["Gluten", "Dairy", "Eggs"]
  },
  {
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, grilled chicken option",
    category: MenuCategory.ENTREE,
    menuType: MenuType.BRUNCH,
    price: 13.99,
    servingSize: "Large bowl",
    featured: false,
    sortOrder: 6,
    tags: ["Gluten-Free Option"],
    allergens: ["Dairy", "Gluten"]
  },
  
  // Brunch Beverages
  {
    name: "Bottomless Mimosas",
    description: "90 minutes of unlimited mimosas",
    category: MenuCategory.COCKTAIL,
    menuType: MenuType.BRUNCH,
    price: 25.00,
    servingSize: "Unlimited",
    featured: true,
    sortOrder: 7,
    tags: ["Bottomless"],
    allergens: []
  },
  {
    name: "Bloody Mary",
    description: "House-made mix with premium vodka",
    category: MenuCategory.COCKTAIL,
    menuType: MenuType.BRUNCH,
    price: 10.00,
    servingSize: "12oz",
    featured: false,
    sortOrder: 8,
    tags: [],
    allergens: []
  },
  {
    name: "Fresh Coffee",
    description: "Locally roasted, unlimited refills",
    category: MenuCategory.NON_ALCOHOLIC,
    menuType: MenuType.BRUNCH,
    price: 4.00,
    servingSize: "Unlimited",
    featured: false,
    sortOrder: 9,
    tags: ["Unlimited Refills"],
    allergens: []
  }
];

async function fixBrunchSync() {
  try {
    console.log('🔍 Checking current brunch items in database...');
    
    const existingItems = await prisma.menuItem.findMany({
      where: { menuType: 'BRUNCH' }
    });
    
    console.log(`Found ${existingItems.length} existing brunch items`);
    
    if (existingItems.length === 0) {
      console.log('📝 No brunch items found. Seeding database...');
      
      // Clear any existing brunch items first
      await prisma.menuItem.deleteMany({
        where: { menuType: 'BRUNCH' }
      });
      
      // Create new brunch items
      for (const item of brunchItems) {
        await prisma.menuItem.create({
          data: item
        });
        console.log(`✅ Created: ${item.name}`);
      }
      
      console.log('🎉 Successfully seeded all brunch items!');
    } else {
      console.log('📋 Current brunch items:');
      existingItems.forEach(item => {
        console.log(`  - ${item.name}: $${item.price} (${item.available ? 'Available' : 'Unavailable'})`);
      });
    }
    
    // Test the API endpoint
    console.log('\n🧪 Testing API endpoint...');
    const testItems = await prisma.menuItem.findMany({
      where: { 
        menuType: 'BRUNCH',
        available: true 
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`✅ API query returned ${testItems.length} items`);
    console.log('📊 Items by category:');
    const categories = {};
    testItems.forEach(item => {
      if (!categories[item.category]) categories[item.category] = 0;
      categories[item.category]++;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} items`);
    });
    
    console.log('\n🎯 Brunch sync fix completed successfully!');
    console.log('📝 Next steps:');
    console.log('  1. Restart the backend server: pm2 restart kockys-backend');
    console.log('  2. Test the API: curl http://72.167.227.205:5001/api/menu/brunch');
    console.log('  3. Check the frontend: http://72.167.227.205:3003/brunch');
    console.log('  4. Check the admin panel: http://72.167.227.205:4000/menu-management?type=BRUNCH');
    
  } catch (error) {
    console.error('❌ Error fixing brunch sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBrunchSync();



