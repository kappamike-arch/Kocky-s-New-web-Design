// Test and fix brunch items
const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function testAndFix() {
  console.log('🔍 Testing current state...');
  
  try {
    // Check database
    const dbItems = await prisma.menuItem.findMany({
      where: { menuType: 'BRUNCH' }
    });
    
    console.log(`📊 Database has ${dbItems.length} brunch items`);
    
    if (dbItems.length === 0) {
      console.log('📝 Adding brunch items to database...');
      
      const items = [
        { name: "Classic Benedict", description: "Poached eggs, Canadian bacon, hollandaise on English muffin", category: "ENTREE", menuType: "BRUNCH", price: 14.99, servingSize: "2 eggs", featured: true, sortOrder: 1, tags: [], allergens: [] },
        { name: "Avocado Toast", description: "Smashed avocado, poached eggs, cherry tomatoes, feta", category: "ENTREE", menuType: "BRUNCH", price: 12.99, servingSize: "2 slices", featured: false, sortOrder: 2, tags: ["Vegetarian"], allergens: ["Gluten", "Dairy"] },
        { name: "Belgian Waffles", description: "Light and fluffy Belgian waffles with maple syrup and fresh berries", category: "ENTREE", menuType: "BRUNCH", price: 11.99, servingSize: "2 waffles", featured: false, sortOrder: 3, tags: ["Vegetarian"], allergens: ["Gluten", "Dairy", "Eggs"] },
        { name: "Steak & Eggs", description: "Grilled sirloin steak with two eggs any style and home fries", category: "ENTREE", menuType: "BRUNCH", price: 22.99, servingSize: "8oz steak", featured: true, sortOrder: 4, tags: [], allergens: ["Eggs"] },
        { name: "Brunch Burger", description: "Beef patty, fried egg, bacon, cheese, special sauce", category: "ENTREE", menuType: "BRUNCH", price: 16.99, servingSize: "1 burger", featured: false, sortOrder: 5, tags: [], allergens: ["Gluten", "Dairy", "Eggs"] },
        { name: "Caesar Salad", description: "Romaine, parmesan, croutons, grilled chicken option", category: "ENTREE", menuType: "BRUNCH", price: 13.99, servingSize: "Large bowl", featured: false, sortOrder: 6, tags: ["Gluten-Free Option"], allergens: ["Dairy", "Gluten"] },
        { name: "Bottomless Mimosas", description: "90 minutes of unlimited mimosas", category: "COCKTAIL", menuType: "BRUNCH", price: 25.00, servingSize: "Unlimited", featured: true, sortOrder: 7, tags: ["Bottomless"], allergens: [] },
        { name: "Bloody Mary", description: "House-made mix with premium vodka", category: "COCKTAIL", menuType: "BRUNCH", price: 10.00, servingSize: "12oz", featured: false, sortOrder: 8, tags: [], allergens: [] },
        { name: "Fresh Coffee", description: "Locally roasted, unlimited refills", category: "NON_ALCOHOLIC", menuType: "BRUNCH", price: 4.00, servingSize: "Unlimited", featured: false, sortOrder: 9, tags: ["Unlimited Refills"], allergens: [] }
      ];
      
      for (const item of items) {
        await prisma.menuItem.create({ data: item });
        console.log(`✅ Added: ${item.name}`);
      }
      
      console.log('🎉 All 9 brunch items added to database!');
    } else {
      console.log('✅ Brunch items already exist in database');
      dbItems.forEach(item => console.log(`  - ${item.name}: $${item.price}`));
    }
    
    // Test API endpoint
    console.log('\n🧪 Testing API endpoint...');
    testAPI();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

function testAPI() {
  const options = {
    hostname: '72.167.227.205',
    port: 5001,
    path: '/api/menu/brunch',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.success && jsonData.items) {
          console.log(`✅ API returned ${jsonData.items.length} brunch items`);
          console.log('📋 Items:', jsonData.items.map(item => item.name).join(', '));
        } else {
          console.log('❌ API error:', jsonData.message || 'Unknown error');
        }
      } catch (e) {
        console.log('❌ API response not JSON:', data);
      }
      
      console.log('\n🎯 Next steps:');
      console.log('1. Check Admin Panel: http://72.167.227.205:4000/menu-management?type=BRUNCH');
      console.log('2. Check Frontend: http://72.167.227.205:3003/brunch');
      console.log('3. If admin panel still shows "No items", restart backend: pm2 restart kockys-backend');
    });
  });

  req.on('error', (e) => {
    console.log('❌ API test failed:', e.message);
  });

  req.end();
}

testAndFix();



