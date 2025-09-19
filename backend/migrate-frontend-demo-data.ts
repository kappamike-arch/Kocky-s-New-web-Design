import { PrismaClient, MenuType, MenuCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded demo data from frontend components
const frontendMenuItems = [
  // From MenuPreview.tsx
  {
    name: 'Kocky\'s Signature Burger',
    description: 'Double patty with bacon, cheese, and our special sauce',
    category: MenuCategory.ENTREE,
    menuType: MenuType.REGULAR,
    price: 16.99,
    featured: true,
    tags: ['signature', 'popular'],
    allergens: ['gluten', 'dairy'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'
  },
  {
    name: 'BBQ Ribs',
    description: 'Full rack with homemade BBQ sauce and coleslaw',
    category: MenuCategory.ENTREE,
    menuType: MenuType.REGULAR,
    price: 24.99,
    featured: true,
    tags: ['signature', 'bestseller'],
    allergens: [],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'
  },
  {
    name: 'Buffalo Wings',
    description: 'Classic wings with blue cheese dressing',
    category: MenuCategory.APPETIZER,
    menuType: MenuType.REGULAR,
    price: 12.99,
    featured: true,
    tags: ['spicy', 'popular'],
    allergens: ['dairy'],
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500'
  },
  {
    name: 'Craft Cocktail',
    description: 'Our signature mix with premium spirits',
    category: MenuCategory.COCKTAIL,
    menuType: MenuType.REGULAR,
    price: 10.99,
    featured: true,
    tags: ['signature', 'premium'],
    allergens: [],
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500'
  },
  // From menu/page.tsx
  {
    name: 'Loaded Potato Skins',
    description: 'Crispy potato skins topped with bacon, cheese, and sour cream',
    category: MenuCategory.APPETIZER,
    menuType: MenuType.REGULAR,
    price: 9.99,
    featured: true,
    tags: ['popular', 'comfort'],
    allergens: ['dairy', 'gluten'],
    image: 'https://staging.kockys.com/uploads/gallery/gallery-1757005147531-560817189.jpg'
  },
  {
    name: 'Spinach Artichoke Dip',
    description: 'Creamy blend served with tortilla chips',
    category: MenuCategory.APPETIZER,
    menuType: MenuType.REGULAR,
    price: 8.99,
    featured: false,
    tags: ['vegetarian', 'dip'],
    allergens: ['dairy', 'gluten']
  }
];

// Dev server demo data
const devServerMenuItems = [
  {
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and our special sauce',
    category: MenuCategory.ENTREE,
    menuType: MenuType.REGULAR,
    price: 12.99,
    featured: false,
    tags: ['classic'],
    allergens: ['gluten', 'dairy']
  },
  {
    name: 'Chicken Wings',
    description: '10 piece wings with your choice of sauce',
    category: MenuCategory.APPETIZER,
    menuType: MenuType.REGULAR,
    price: 10.99,
    featured: true,
    tags: ['spicy', 'wings'],
    allergens: []
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing and croutons',
    category: MenuCategory.ENTREE,
    menuType: MenuType.REGULAR,
    price: 8.99,
    featured: false,
    tags: ['healthy', 'salad'],
    allergens: ['dairy', 'gluten']
  }
];

// Dev server demo bookings
const devServerBookings = [
  {
    contactName: 'Alex Thompson',
    contactEmail: 'alex@example.com',
    contactPhone: '555-1234',
    companyName: 'TechCorp',
    eventDate: new Date('2024-02-15'),
    eventTime: '12:00',
    eventDuration: 4,
    eventLocation: 'Downtown Park',
    eventType: 'Company Picnic',
    expectedGuests: 150,
    budget: 2500,
    menuPreferences: 'Need vegetarian options',
    additionalNotes: 'Company picnic event, need vegetarian options',
    status: 'PENDING'
  }
];

async function migrateFrontendDemoData() {
  try {
    console.log('🔄 Migrating frontend demo data to database...');

    // Get or create menu sections
    const appetizerSection = await prisma.menuSection.findFirst({
      where: { name: 'Appetizers', menuType: MenuType.REGULAR }
    });
    
    const entreeSection = await prisma.menuSection.findFirst({
      where: { name: 'Entrees', menuType: MenuType.REGULAR }
    });

    const cocktailSection = await prisma.menuSection.findFirst({
      where: { name: 'Beverages', menuType: MenuType.REGULAR }
    });

    // Combine all demo menu items
    const allDemoItems = [...frontendMenuItems, ...devServerMenuItems];

    // Create menu items
    for (const item of allDemoItems) {
      // Determine section based on category
      let sectionId = null;
      if (item.category === MenuCategory.APPETIZER && appetizerSection) {
        sectionId = appetizerSection.id;
      } else if (item.category === MenuCategory.ENTREE && entreeSection) {
        sectionId = entreeSection.id;
      } else if (item.category === MenuCategory.COCKTAIL && cocktailSection) {
        sectionId = cocktailSection.id;
      }

      await prisma.menuItem.upsert({
        where: { 
          name_menuType: {
            name: item.name,
            menuType: item.menuType
          }
        },
        update: {
          ...item,
          sectionId,
          tags: JSON.stringify(item.tags),
          allergens: JSON.stringify(item.allergens)
        },
        create: {
          ...item,
          sectionId,
          tags: JSON.stringify(item.tags),
          allergens: JSON.stringify(item.allergens)
        }
      });
      console.log(`✅ Created/Updated menu item: ${item.name}`);
    }

    // Create demo food truck bookings
    for (const booking of devServerBookings) {
      await prisma.foodTruckBooking.create({
        data: {
          ...booking,
          confirmationCode: `FT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        }
      });
      console.log(`✅ Created food truck booking: ${booking.contactName}`);
    }

    console.log('🎉 Frontend demo data migration completed!');
    console.log(`📊 Created/Updated ${allDemoItems.length} menu items`);
    console.log(`📊 Created ${devServerBookings.length} food truck bookings`);

  } catch (error) {
    console.error('❌ Error migrating frontend demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateFrontendDemoData()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateFrontendDemoData };


