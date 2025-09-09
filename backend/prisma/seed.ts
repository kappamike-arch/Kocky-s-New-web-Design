import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminPassword123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@kockysbar.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@kockysbar.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('Admin user created:', adminUser.email);

  // Create some test users
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'staff@kockysbar.com' },
      update: {},
      create: {
        email: 'staff@kockysbar.com',
        password: await bcrypt.hash('StaffPassword123!', 10),
        name: 'Staff Member',
        role: 'STAFF',
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        password: await bcrypt.hash('CustomerPassword123!', 10),
        name: 'John Doe',
        role: 'CUSTOMER',
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log('Test users created');

  // Create menu items
  const menuItems = await Promise.all([
    // Appetizers
    prisma.menuItem.create({
      data: {
        name: 'Buffalo Wings',
        description: 'Classic buffalo wings with blue cheese dressing',
        category: 'APPETIZER',
        price: 12.99,
        featured: true,
        tags: ['spicy', 'popular'],
        allergens: ['dairy'],
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Loaded Nachos',
        description: 'Tortilla chips with cheese, jalapeños, sour cream, and guacamole',
        category: 'APPETIZER',
        price: 14.99,
        tags: ['vegetarian', 'shareable'],
        allergens: ['dairy', 'gluten'],
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Mozzarella Sticks',
        description: 'Crispy fried mozzarella with marinara sauce',
        category: 'APPETIZER',
        price: 9.99,
        tags: ['vegetarian'],
        allergens: ['dairy', 'gluten'],
      },
    }),

    // Entrees
    prisma.menuItem.create({
      data: {
        name: 'Kocky\'s Burger',
        description: 'Double patty with bacon, cheese, lettuce, tomato, and special sauce',
        category: 'ENTREE',
        price: 16.99,
        featured: true,
        tags: ['signature', 'bestseller'],
        allergens: ['dairy', 'gluten'],
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'BBQ Ribs',
        description: 'Full rack of ribs with homemade BBQ sauce and coleslaw',
        category: 'ENTREE',
        price: 24.99,
        tags: ['signature'],
        allergens: [],
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon butter sauce and vegetables',
        category: 'ENTREE',
        price: 22.99,
        tags: ['healthy'],
        allergens: ['fish'],
      },
    }),

    // Drinks
    prisma.menuItem.create({
      data: {
        name: 'Kocky\'s Special Cocktail',
        description: 'Our signature mixed drink with rum, vodka, and tropical fruits',
        category: 'COCKTAIL',
        price: 10.99,
        featured: true,
        tags: ['signature', 'strong'],
        allergens: [],
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Craft Beer Selection',
        description: 'Ask your server for today\'s selection',
        category: 'BEER',
        price: 6.99,
        tags: ['local'],
        allergens: ['gluten'],
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'House Wine',
        description: 'Red or white wine by the glass',
        category: 'WINE',
        price: 8.99,
        tags: [],
        allergens: ['sulfites'],
      },
    }),

    // Desserts
    prisma.menuItem.create({
      data: {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center and vanilla ice cream',
        category: 'DESSERT',
        price: 8.99,
        featured: true,
        tags: ['popular'],
        allergens: ['dairy', 'gluten', 'eggs'],
      },
    }),
  ]);

  console.log(`Created ${menuItems.length} menu items`);

  // Create happy hour settings
  const happyHours = await Promise.all([
    // Monday to Friday
    ...Array.from({ length: 5 }, (_, i) =>
      prisma.happyHour.create({
        data: {
          dayOfWeek: i + 1, // 1 = Monday, 5 = Friday
          startTime: '16:00',
          endTime: '19:00',
          description: 'Weekday Happy Hour',
          specials: [
            '$2 off all draft beers',
            '$3 off house wines',
            '50% off selected appetizers',
            '$5 well drinks',
          ],
        },
      })
    ),
  ]);

  console.log('Happy hour settings created');

  // Create settings
  const settings = await prisma.settings.create({
    data: {
      siteName: "Kocky's Bar & Grill",
      siteDescription: "The best bar and grill in town - great food, drinks, and atmosphere!",
      contactEmail: "info@kockysbar.com",
      contactPhone: "(555) 123-4567",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      businessHours: {
        monday: { open: "11:00", close: "23:00" },
        tuesday: { open: "11:00", close: "23:00" },
        wednesday: { open: "11:00", close: "23:00" },
        thursday: { open: "11:00", close: "00:00" },
        friday: { open: "11:00", close: "02:00" },
        saturday: { open: "10:00", close: "02:00" },
        sunday: { open: "10:00", close: "22:00" },
      },
      socialMedia: {
        facebook: "https://facebook.com/kockysbar",
        instagram: "https://instagram.com/kockysbar",
        twitter: "https://twitter.com/kockysbar",
        tiktok: "https://tiktok.com/@kockysbar",
      },
      emailSettings: {
        provider: "sendgrid",
        from: "noreply@kockysbar.com",
      },
      paymentSettings: {
        stripeEnabled: true,
        acceptsCash: true,
        acceptsCard: true,
      },
      reservationSettings: {
        minPartySize: 1,
        maxPartySize: 20,
        advanceBookingDays: 30,
        reservationSlotDuration: 120,
        maxReservationsPerSlot: 10,
      },
    },
  });

  console.log('Settings created');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
