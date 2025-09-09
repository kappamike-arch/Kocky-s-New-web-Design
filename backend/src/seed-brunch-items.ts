import { PrismaClient, MenuCategory, MenuType } from '@prisma/client';

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

async function seedBrunchItems() {
  try {
    console.log('Starting brunch items seed...');
    
    // Clear existing brunch items
    await prisma.menuItem.deleteMany({
      where: { menuType: 'BRUNCH' }
    });
    
    console.log('Cleared existing brunch items');
    
    // Create new brunch items
    for (const item of brunchItems) {
      await prisma.menuItem.create({
        data: item
      });
      console.log(`Created brunch item: ${item.name}`);
    }
    
    console.log('Brunch items seed completed successfully!');
  } catch (error) {
    console.error('Error seeding brunch items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBrunchItems();
