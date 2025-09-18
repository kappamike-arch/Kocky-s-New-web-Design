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

  // Create email templates
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.upsert({
      where: { slug: 'food-truck-inquiry' },
      update: {},
      create: {
        name: 'Food Truck Inquiry',
        slug: 'food-truck-inquiry',
        subject: 'Thanks for your Food Truck Inquiry, {{customerName}}!',
        html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Inter, Arial; color:#222;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#111;padding:20px;" align="center">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's" height="44"/>{{/if}}
    </td></tr>
    {{#if bannerUrl}}
    <tr><td><img src="{{bannerUrl}}" alt="" width="600" style="display:block"/></td></tr>
    {{/if}}
    <tr><td style="padding:28px;">
      <h2 style="margin:0 0 10px 0;">Hi {{customerName}},</h2>
      <p>Thanks for reaching out about our Food Truck for {{eventDate}} at {{eventLocation}}.</p>
      <p>Estimated headcount: {{headCount}}. Desired service: {{serviceName}}</p>
      <p>We'll review your request and reply with details and pricing.</p>
      <div style="margin:20px 0;padding:14px;border:1px solid #eee;border-radius:10px;background:#fafafa">
        <strong>Contact</strong><br/>
        {{customerName}} • {{customerEmail}} • {{customerPhone}}
      </div>
      <p style="margin:0;">— Kocky's Team</p>
    </td></tr>
    <tr><td style="background:#f5f5f5;padding:18px;font-size:12px;color:#555;" align="center">
      Kocky's Bar & Grill • 123 Main St • Fresno, CA
    </td></tr>
  </table>
</td></tr></table>`,
        text: 'Thanks for your Food Truck inquiry.',
        variables: {
          customerName: 'string',
          customerEmail: 'string', 
          customerPhone: 'string',
          eventDate: 'string',
          eventLocation: 'string',
          headCount: 'number',
          serviceName: 'string',
          logoUrl: 'string',
          bannerUrl: 'string'
        },
        logoUrl: 'https://staging.kockys.com/uploads/logos/kockys-logo.png',
        bannerUrl: 'https://staging.kockys.com/uploads/banners/email-banner.jpg',
      },
    }),
    prisma.emailTemplate.upsert({
      where: { slug: 'catering-inquiry' },
      update: {},
      create: {
        name: 'Catering Inquiry',
        slug: 'catering-inquiry',
        subject: 'Catering Inquiry for {{eventDate}} — Kocky\'s',
        html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Inter, Arial; color:#222;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#111;padding:20px;" align="center">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's" height="44"/>{{/if}}
    </td></tr>
    {{#if bannerUrl}}
    <tr><td><img src="{{bannerUrl}}" alt="" width="600" style="display:block"/></td></tr>
    {{/if}}
    <tr><td style="padding:28px;">
      <h2 style="margin:0 0 10px 0;">Hi {{customerName}},</h2>
      <p>Thanks for your interest in our catering services for {{eventDate}}.</p>
      <p>Expected guests: {{headCount}} people</p>
      <p>We'll review your requirements and send you a detailed quote within 24 hours.</p>
      <div style="margin:20px 0;padding:14px;border:1px solid #eee;border-radius:10px;background:#fafafa">
        <strong>Event Details</strong><br/>
        Date: {{eventDate}}<br/>
        Guests: {{headCount}}<br/>
        Location: {{eventLocation}}
      </div>
      <p style="margin:0;">— Kocky's Catering Team</p>
    </td></tr>
    <tr><td style="background:#f5f5f5;padding:18px;font-size:12px;color:#555;" align="center">
      Kocky's Bar & Grill • 123 Main St • Fresno, CA
    </td></tr>
  </table>
</td></tr></table>`,
        text: 'Catering inquiry received.',
        variables: {
          customerName: 'string',
          eventDate: 'string',
          headCount: 'number',
          eventLocation: 'string',
          logoUrl: 'string',
          bannerUrl: 'string'
        },
        logoUrl: 'https://staging.kockys.com/uploads/logos/kockys-logo.png',
        bannerUrl: 'https://staging.kockys.com/uploads/banners/email-banner.jpg',
      },
    }),
    prisma.emailTemplate.upsert({
      where: { slug: 'mobile-bar-inquiry' },
      update: {},
      create: {
        name: 'Mobile Bar Inquiry',
        slug: 'mobile-bar-inquiry',
        subject: 'Mobile Bar for {{eventDate}} — We got it!',
        html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Inter, Arial; color:#222;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#111;padding:20px;" align="center">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's" height="44"/>{{/if}}
    </td></tr>
    {{#if bannerUrl}}
    <tr><td><img src="{{bannerUrl}}" alt="" width="600" style="display:block"/></td></tr>
    {{/if}}
    <tr><td style="padding:28px;">
      <h2 style="margin:0 0 10px 0;">Hi {{customerName}},</h2>
      <p>We received your mobile bar inquiry for {{eventDate}} at {{eventLocation}}.</p>
      <p>Expected guests: {{headCount}} people</p>
      <p>Our mobile bar team will contact you within 24 hours to discuss your event and provide a custom quote.</p>
      <div style="margin:20px 0;padding:14px;border:1px solid #eee;border-radius:10px;background:#fafafa">
        <strong>Event Details</strong><br/>
        Date: {{eventDate}}<br/>
        Location: {{eventLocation}}<br/>
        Guests: {{headCount}}
      </div>
      <p style="margin:0;">— Kocky's Mobile Bar Team</p>
    </td></tr>
    <tr><td style="background:#f5f5f5;padding:18px;font-size:12px;color:#555;" align="center">
      Kocky's Bar & Grill • 123 Main St • Fresno, CA
    </td></tr>
  </table>
</td></tr></table>`,
        text: 'Mobile bar inquiry received.',
        variables: {
          customerName: 'string',
          eventDate: 'string',
          eventLocation: 'string',
          headCount: 'number',
          logoUrl: 'string',
          bannerUrl: 'string'
        },
        logoUrl: 'https://staging.kockys.com/uploads/logos/kockys-logo.png',
        bannerUrl: 'https://staging.kockys.com/uploads/banners/email-banner.jpg',
      },
    }),
    prisma.emailTemplate.upsert({
      where: { slug: 'quote-sent' },
      update: {},
      create: {
        name: 'Quote Sent',
        slug: 'quote-sent',
        subject: 'Your Quote #{{quoteNumber}} from Kocky\'s',
        html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Inter, Arial; color:#222;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="background:#111;padding:20px;" align="center">
      {{#if logoUrl}}<img src="{{logoUrl}}" alt="Kocky's" height="44"/>{{/if}}
    </td></tr>
    {{#if bannerUrl}}
    <tr><td><img src="{{bannerUrl}}" alt="" width="600" style="display:block"/></td></tr>
    {{/if}}
    <tr><td style="padding:28px;">
      <h2 style="margin:0 0 10px 0;">Hi {{customerName}},</h2>
      <p>Thank you for considering Kocky's for your event. We're pleased to provide you with the following quote:</p>
      <div style="margin:20px 0;padding:20px;border:2px solid #d4af37;border-radius:10px;background:#fafafa">
        <h3 style="margin:0 0 10px 0;color:#d4af37;">Quote #{{quoteNumber}}</h3>
        <p style="margin:0;font-size:24px;font-weight:bold;color:#222;">Total: {{formatCurrency total}}</p>
        <p style="margin:10px 0 0 0;font-size:14px;color:#666;">Valid until {{validUntil}}</p>
      </div>
      <p>To accept this quote and secure your booking, please reply to this email or call us at (555) 123-4567.</p>
      <p style="margin:0;">— Kocky's Team</p>
    </td></tr>
    <tr><td style="background:#f5f5f5;padding:18px;font-size:12px;color:#555;" align="center">
      Kocky's Bar & Grill • 123 Main St • Fresno, CA
    </td></tr>
  </table>
</td></tr></table>`,
        text: 'Quote sent.',
        variables: {
          customerName: 'string',
          quoteNumber: 'string',
          total: 'number',
          validUntil: 'string',
          logoUrl: 'string',
          bannerUrl: 'string'
        },
        logoUrl: 'https://staging.kockys.com/uploads/logos/kockys-logo.png',
        bannerUrl: 'https://staging.kockys.com/uploads/banners/email-banner.jpg',
      },
    }),
  ]);

  console.log(`Created ${emailTemplates.length} email templates`);

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
