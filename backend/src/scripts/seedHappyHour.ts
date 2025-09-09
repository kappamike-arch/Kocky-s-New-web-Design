import { PrismaClient, MenuCategory, MenuType } from '@prisma/client';

const prisma = new PrismaClient();

const happyHourSections = [
  {
    name: "Happy Hour Appetizers",
    description: "Discounted starters",
    menuType: MenuType.HAPPY_HOUR,
    displayMode: "FULL_DETAILS" as const,
    sortOrder: 1,
    isActive: true
  },
  {
    name: "Happy Hour Drinks",
    description: "Special drink prices",
    menuType: MenuType.HAPPY_HOUR,
    displayMode: "FULL_DETAILS" as const,
    sortOrder: 2,
    isActive: true
  }
];

const happyHourItems = [
  // Happy Hour Appetizers
  {
    name: "Happy Hour Wings",
    description: "Our famous buffalo wings at a special price",
    category: MenuCategory.APPETIZER,
    menuType: MenuType.HAPPY_HOUR,
    price: 12.99,
    happyHourPrice: 7.99,
    servingSize: "6 pieces",
    featured: true,
    sortOrder: 1,
    tags: ["happy-hour", "spicy"],
    allergens: ["dairy"]
  },
  {
    name: "Loaded Nachos",
    description: "Tortilla chips loaded with cheese, jalapeños, and sour cream",
    category: MenuCategory.APPETIZER,
    menuType: MenuType.HAPPY_HOUR,
    price: 11.99,
    happyHourPrice: 6.99,
    servingSize: "Large plate",
    featured: false,
    sortOrder: 2,
    tags: ["happy-hour", "vegetarian"],
    allergens: ["dairy", "gluten"]
  },
  {
    name: "Spinach Artichoke Dip",
    description: "Creamy dip served with warm pita bread",
    category: MenuCategory.APPETIZER,
    menuType: MenuType.HAPPY_HOUR,
    price: 9.99,
    happyHourPrice: 5.99,
    servingSize: "Medium bowl",
    featured: false,
    sortOrder: 3,
    tags: ["happy-hour", "vegetarian"],
    allergens: ["dairy", "gluten"]
  },
  {
    name: "Beer Battered Onion Rings",
    description: "Crispy golden onion rings with house-made ranch",
    category: MenuCategory.APPETIZER,
    menuType: MenuType.HAPPY_HOUR,
    price: 8.99,
    happyHourPrice: 4.99,
    servingSize: "12 rings",
    featured: false,
    sortOrder: 4,
    tags: ["happy-hour", "vegetarian"],
    allergens: ["gluten", "dairy"]
  },

  // Happy Hour Drinks
  {
    name: "House Margarita",
    description: "Classic margarita with premium tequila",
    category: MenuCategory.COCKTAIL,
    menuType: MenuType.HAPPY_HOUR,
    price: 10.00,
    happyHourPrice: 6.00,
    servingSize: "12 oz",
    featured: true,
    sortOrder: 1,
    tags: ["happy-hour", "cocktail"],
    allergens: []
  },
  {
    name: "Draft Beer",
    description: "Selection of local and imported drafts",
    category: MenuCategory.BEER,
    menuType: MenuType.HAPPY_HOUR,
    price: 6.00,
    happyHourPrice: 3.50,
    servingSize: "16 oz",
    featured: false,
    sortOrder: 2,
    tags: ["happy-hour", "beer"],
    allergens: ["gluten"]
  },
  {
    name: "House Wine",
    description: "Red or white wine by the glass",
    category: MenuCategory.WINE,
    menuType: MenuType.HAPPY_HOUR,
    price: 8.00,
    happyHourPrice: 5.00,
    servingSize: "6 oz",
    featured: false,
    sortOrder: 3,
    tags: ["happy-hour", "wine"],
    allergens: []
  },
  {
    name: "Well Cocktails",
    description: "Premium well spirits with mixers",
    category: MenuCategory.COCKTAIL,
    menuType: MenuType.HAPPY_HOUR,
    price: 9.00,
    happyHourPrice: 5.50,
    servingSize: "10 oz",
    featured: false,
    sortOrder: 4,
    tags: ["happy-hour", "cocktail"],
    allergens: []
  },
  {
    name: "Moscow Mule",
    description: "Vodka, ginger beer, and lime in a copper mug",
    category: MenuCategory.COCKTAIL,
    menuType: MenuType.HAPPY_HOUR,
    price: 11.00,
    happyHourPrice: 7.00,
    servingSize: "12 oz",
    featured: true,
    sortOrder: 5,
    tags: ["happy-hour", "cocktail", "signature"],
    allergens: []
  }
];

async function seedHappyHour() {
  try {
    console.log('Starting Happy Hour seed...');
    
    // Create sections first
    const createdSections = [];
    for (const sectionData of happyHourSections) {
      // Check if section already exists
      const existingSection = await prisma.menuSection.findFirst({
        where: {
          name: sectionData.name,
          menuType: MenuType.HAPPY_HOUR
        }
      });
      
      if (existingSection) {
        console.log(`Section already exists: ${sectionData.name}`);
        createdSections.push(existingSection);
      } else {
        const section = await prisma.menuSection.create({
          data: sectionData
        });
        console.log(`Created section: ${section.name}`);
        createdSections.push(section);
      }
    }
    
    // Get section IDs for items
    const appetizerSection = createdSections.find(s => s.name === "Happy Hour Appetizers");
    const drinksSection = createdSections.find(s => s.name === "Happy Hour Drinks");
    
    if (!appetizerSection || !drinksSection) {
      throw new Error('Failed to create or find required sections');
    }
    
    // Create items
    for (const itemData of happyHourItems) {
      // Check if item already exists
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          name: itemData.name,
          menuType: MenuType.HAPPY_HOUR
        }
      });
      
      if (existingItem) {
        console.log(`Item already exists: ${itemData.name}`);
        continue;
      }
      
      // Assign section ID based on category
      const sectionId = itemData.category === MenuCategory.APPETIZER 
        ? appetizerSection.id 
        : drinksSection.id;
      
      const item = await prisma.menuItem.create({
        data: {
          ...itemData,
          sectionId
        }
      });
      console.log(`Created item: ${item.name} in section: ${sectionId === appetizerSection.id ? 'Appetizers' : 'Drinks'}`);
    }
    
    console.log('Happy Hour seed completed successfully!');
    console.log(`Created ${createdSections.length} sections and ${happyHourItems.length} items`);
    
  } catch (error) {
    console.error('Error seeding Happy Hour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedHappyHour();





