// Quick fix for brunch items
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickFix() {
  try {
    console.log('🔍 Checking brunch items...');
    
    // Check current items
    const current = await prisma.menuItem.findMany({
      where: { menuType: 'BRUNCH' }
    });
    
    console.log(`Found ${current.length} brunch items`);
    
    if (current.length === 0) {
      console.log('📝 Adding brunch items...');
      
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
      
      console.log('🎉 All brunch items added!');
    } else {
      console.log('✅ Brunch items already exist');
      current.forEach(item => console.log(`- ${item.name}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickFix();



