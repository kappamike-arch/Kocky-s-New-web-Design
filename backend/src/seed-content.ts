import { MenuType, MenuCategory } from '@prisma/client';
import { prisma } from './lib/prisma';

async function main() {
  console.log('🌱 Seeding content management data...');

  // Seed Page Content
  const pages = [
    {
      slug: 'home',
      title: 'Home',
      heroTitle: 'Welcome to Kocky\'s Bar & Grill',
      heroSubtitle: 'Experience the best dining in town',
      content: '<p>Welcome to our restaurant. We serve delicious food and drinks in a warm, inviting atmosphere.</p>',
      metaTitle: 'Kocky\'s Bar & Grill - Home',
      metaDescription: 'Welcome to Kocky\'s Bar & Grill. Experience fine dining, happy hour specials, and weekend brunch.',
      isActive: true
    },
    {
      slug: 'menu',
      title: 'Menu',
      heroTitle: 'Our Menu',
      heroSubtitle: 'Delicious dishes made with love',
      content: '<p>Explore our extensive menu featuring appetizers, entrees, desserts, and beverages.</p>',
      metaTitle: 'Menu - Kocky\'s Bar & Grill',
      metaDescription: 'View our full menu with appetizers, entrees, desserts, and drinks.',
      isActive: true
    },
    {
      slug: 'happy-hour',
      title: 'Happy Hour',
      heroTitle: 'Happy Hour Specials',
      heroSubtitle: 'Join us for great deals on drinks and appetizers',
      content: '<p>Monday-Friday 4-7 PM. Enjoy discounted drinks and appetizers!</p>',
      metaTitle: 'Happy Hour - Kocky\'s Bar & Grill',
      metaDescription: 'Join us for happy hour Monday-Friday 4-7 PM. Special prices on drinks and appetizers.',
      isActive: true
    },
    {
      slug: 'brunch',
      title: 'Brunch',
      heroTitle: 'Weekend Brunch',
      heroSubtitle: 'Start your weekend right with our amazing brunch',
      content: '<p>Saturday & Sunday 10 AM - 3 PM. Bottomless mimosas available!</p>',
      metaTitle: 'Weekend Brunch - Kocky\'s Bar & Grill',
      metaDescription: 'Join us for weekend brunch with bottomless mimosas. Saturday & Sunday 10 AM - 3 PM.',
      isActive: true
    },
    {
      slug: 'gallery',
      title: 'Gallery',
      heroTitle: 'Photo Gallery',
      heroSubtitle: 'Memories from Kocky\'s Bar & Grill',
      content: '<p>Browse through photos of our restaurant, dishes, and events.</p>',
      metaTitle: 'Gallery - Kocky\'s Bar & Grill',
      metaDescription: 'View photos of our restaurant, food, and events at Kocky\'s Bar & Grill.',
      isActive: true
    },
    {
      slug: 'reservations',
      title: 'Reservations',
      heroTitle: 'Make a Reservation',
      heroSubtitle: 'Book your table today',
      content: '<p>Reserve your table online or call us at (555) 123-4567.</p>',
      metaTitle: 'Reservations - Kocky\'s Bar & Grill',
      metaDescription: 'Make a reservation at Kocky\'s Bar & Grill. Book online or call (555) 123-4567.',
      isActive: true
    }
  ];

  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { slug: page.slug },
      update: page,
      create: page
    });
    console.log(`✅ Created/Updated page: ${page.title}`);
  }

  // Seed Menu Sections
  const menuSections = [
    // Regular Menu Sections
    { name: 'Appetizers', description: 'Start your meal right', menuType: MenuType.REGULAR, sortOrder: 1, isActive: true },
    { name: 'Salads', description: 'Fresh and healthy options', menuType: MenuType.REGULAR, sortOrder: 2, isActive: true },
    { name: 'Entrees', description: 'Main courses', menuType: MenuType.REGULAR, sortOrder: 3, isActive: true },
    { name: 'Desserts', description: 'Sweet endings', menuType: MenuType.REGULAR, sortOrder: 4, isActive: true },
    { name: 'Beverages', description: 'Drinks and refreshments', menuType: MenuType.REGULAR, sortOrder: 5, isActive: true },
    
    // Happy Hour Sections
    { name: 'Happy Hour Appetizers', description: 'Discounted starters', menuType: MenuType.HAPPY_HOUR, sortOrder: 1, isActive: true },
    { name: 'Happy Hour Drinks', description: 'Special drink prices', menuType: MenuType.HAPPY_HOUR, sortOrder: 2, isActive: true },
    
    // Brunch Sections
    { name: 'Brunch Classics', description: 'Traditional brunch favorites', menuType: MenuType.BRUNCH, sortOrder: 1, isActive: true },
    { name: 'Brunch Specials', description: 'Chef\'s special brunch items', menuType: MenuType.BRUNCH, sortOrder: 2, isActive: true },
    { name: 'Brunch Drinks', description: 'Mimosas, Bloody Marys, and more', menuType: MenuType.BRUNCH, sortOrder: 3, isActive: true },
    
    // Specials Section
    { name: 'Daily Specials', description: 'Today\'s special offerings', menuType: MenuType.SPECIALS, sortOrder: 1, isActive: true },
  ];

  const createdSections: any = {};
  for (const section of menuSections) {
    const created = await prisma.menuSection.create({
      data: section
    });
    createdSections[`${section.menuType}-${section.name}`] = created.id;
    console.log(`✅ Created menu section: ${section.name} (${section.menuType})`);
  }

  // Seed Sample Menu Items
  const menuItems = [
    // Regular Menu - Appetizers
    {
      name: 'Buffalo Wings',
      description: 'Crispy chicken wings tossed in our signature buffalo sauce',
      category: MenuCategory.APPETIZER,
      menuType: MenuType.REGULAR,
      sectionId: createdSections['REGULAR-Appetizers'],
      price: 12.99,
      servingSize: '8 pieces',
      preparationTime: 15,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['spicy', 'popular']),
      allergens: JSON.stringify(['dairy'])
    },
    {
      name: 'Loaded Nachos',
      description: 'Tortilla chips with cheese, jalapeños, sour cream, and guacamole',
      category: MenuCategory.APPETIZER,
      menuType: MenuType.REGULAR,
      sectionId: createdSections['REGULAR-Appetizers'],
      price: 10.99,
      servingSize: 'Sharing size',
      preparationTime: 10,
      available: true,
      featured: false,
      sortOrder: 2,
      tags: JSON.stringify(['vegetarian', 'sharing']),
      allergens: JSON.stringify(['dairy', 'gluten'])
    },
    
    // Regular Menu - Entrees
    {
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce, served with vegetables and rice',
      category: MenuCategory.ENTREE,
      menuType: MenuType.REGULAR,
      sectionId: createdSections['REGULAR-Entrees'],
      price: 24.99,
      servingSize: '8 oz',
      preparationTime: 20,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['healthy', 'gluten-free']),
      allergens: JSON.stringify(['fish'])
    },
    {
      name: 'Classic Burger',
      description: 'Angus beef patty with lettuce, tomato, onion, and pickles on a brioche bun',
      category: MenuCategory.ENTREE,
      menuType: MenuType.REGULAR,
      sectionId: createdSections['REGULAR-Entrees'],
      price: 15.99,
      servingSize: '8 oz patty',
      preparationTime: 15,
      available: true,
      featured: false,
      sortOrder: 2,
      tags: JSON.stringify(['popular']),
      allergens: JSON.stringify(['gluten', 'dairy'])
    },
    
    // Happy Hour Items
    {
      name: 'Happy Hour Wings',
      description: 'Our famous buffalo wings at a special price',
      category: MenuCategory.APPETIZER,
      menuType: MenuType.HAPPY_HOUR,
      sectionId: createdSections['HAPPY_HOUR-Happy Hour Appetizers'],
      price: 12.99,
      happyHourPrice: 7.99,
      servingSize: '6 pieces',
      preparationTime: 15,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['happy-hour', 'spicy']),
      allergens: JSON.stringify(['dairy'])
    },
    {
      name: 'House Margarita',
      description: 'Classic margarita with premium tequila',
      category: MenuCategory.COCKTAIL,
      menuType: MenuType.HAPPY_HOUR,
      sectionId: createdSections['HAPPY_HOUR-Happy Hour Drinks'],
      price: 10.00,
      happyHourPrice: 6.00,
      servingSize: '12 oz',
      preparationTime: 5,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['happy-hour', 'cocktail']),
      allergens: JSON.stringify([])
    },
    
    // Brunch Items
    {
      name: 'Eggs Benedict',
      description: 'Poached eggs on English muffins with Canadian bacon and hollandaise sauce',
      category: MenuCategory.ENTREE,
      menuType: MenuType.BRUNCH,
      sectionId: createdSections['BRUNCH-Brunch Classics'],
      price: 14.99,
      servingSize: '2 eggs',
      preparationTime: 15,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['brunch', 'classic']),
      allergens: JSON.stringify(['eggs', 'gluten', 'dairy'])
    },
    {
      name: 'French Toast',
      description: 'Thick-cut brioche French toast with maple syrup and fresh berries',
      category: MenuCategory.ENTREE,
      menuType: MenuType.BRUNCH,
      sectionId: createdSections['BRUNCH-Brunch Classics'],
      price: 12.99,
      servingSize: '3 slices',
      preparationTime: 12,
      available: true,
      featured: false,
      sortOrder: 2,
      tags: JSON.stringify(['brunch', 'sweet']),
      allergens: JSON.stringify(['eggs', 'gluten', 'dairy'])
    },
    {
      name: 'Bottomless Mimosas',
      description: 'Unlimited mimosas for 90 minutes',
      category: MenuCategory.COCKTAIL,
      menuType: MenuType.BRUNCH,
      sectionId: createdSections['BRUNCH-Brunch Drinks'],
      price: 25.00,
      servingSize: 'Unlimited',
      preparationTime: 2,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['brunch', 'bottomless', 'popular']),
      allergens: JSON.stringify([])
    },
    
    // Daily Specials
    {
      name: 'Chef\'s Special Pasta',
      description: 'Ask your server about today\'s pasta special',
      category: MenuCategory.SPECIAL,
      menuType: MenuType.SPECIALS,
      sectionId: createdSections['SPECIALS-Daily Specials'],
      price: 18.99,
      servingSize: 'Full portion',
      preparationTime: 18,
      available: true,
      featured: true,
      sortOrder: 1,
      tags: JSON.stringify(['special', 'pasta']),
      allergens: JSON.stringify(['gluten', 'dairy'])
    }
  ];

  for (const item of menuItems) {
    const created = await prisma.menuItem.create({
      data: item as any
    });
    console.log(`✅ Created menu item: ${item.name} (${item.menuType})`);
  }

  // Seed Sample Gallery Items
  const galleryItems = [
    {
      title: 'Restaurant Interior',
      description: 'Our warm and inviting dining room',
      imageUrl: '/uploads/gallery/sample-interior.jpg',
      thumbnailUrl: '/uploads/gallery/thumbnails/thumb-sample-interior.jpg',
      category: 'Interior',
      tags: JSON.stringify(['restaurant', 'dining', 'interior']),
      sortOrder: 1,
      isActive: true
    },
    {
      title: 'Signature Dish',
      description: 'Our famous grilled salmon',
      imageUrl: '/uploads/gallery/sample-salmon.jpg',
      thumbnailUrl: '/uploads/gallery/thumbnails/thumb-sample-salmon.jpg',
      category: 'Food',
      tags: JSON.stringify(['food', 'salmon', 'entree']),
      sortOrder: 2,
      isActive: true
    },
    {
      title: 'Happy Hour Crowd',
      description: 'Guests enjoying happy hour',
      imageUrl: '/uploads/gallery/sample-happy-hour.jpg',
      thumbnailUrl: '/uploads/gallery/thumbnails/thumb-sample-happy-hour.jpg',
      category: 'Events',
      tags: JSON.stringify(['happy-hour', 'crowd', 'events']),
      sortOrder: 3,
      isActive: true
    },
    {
      title: 'Weekend Brunch',
      description: 'Delicious brunch spread',
      imageUrl: '/uploads/gallery/sample-brunch.jpg',
      thumbnailUrl: '/uploads/gallery/thumbnails/thumb-sample-brunch.jpg',
      category: 'Food',
      tags: JSON.stringify(['brunch', 'food', 'weekend']),
      sortOrder: 4,
      isActive: true
    },
    {
      title: 'Bar Area',
      description: 'Our fully stocked bar',
      imageUrl: '/uploads/gallery/sample-bar.jpg',
      thumbnailUrl: '/uploads/gallery/thumbnails/thumb-sample-bar.jpg',
      category: 'Interior',
      tags: JSON.stringify(['bar', 'drinks', 'interior']),
      sortOrder: 5,
      isActive: true
    }
  ];

  for (const item of galleryItems) {
    const created = await prisma.galleryItem.create({
      data: item
    });
    console.log(`✅ Created gallery item: ${item.title}`);
  }

  console.log('✨ Content seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
