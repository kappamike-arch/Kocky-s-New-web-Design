import { prisma } from './lib/prisma';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  console.log('🌱 Starting CRM and Calendar data seed...');
  
  // Create some reservations
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  console.log('Creating reservations...');
  
  // Today's reservation
  await prisma.reservation.create({
    data: {
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah.j@example.com',
      guestPhone: '555-0101',
      date: today,
      time: '19:00',
      partySize: 4,
      specialRequests: 'Anniversary dinner - please decorate table',
      status: 'CONFIRMED',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  // Tomorrow's reservation
  await prisma.reservation.create({
    data: {
      guestName: 'Michael Brown',
      guestEmail: 'mbrown@example.com',
      guestPhone: '555-0102',
      date: tomorrow,
      time: '18:30',
      partySize: 6,
      specialRequests: 'Business dinner - quiet table please',
      status: 'PENDING',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  // Next week reservation
  await prisma.reservation.create({
    data: {
      guestName: 'Emily Davis',
      guestEmail: 'emily.davis@example.com',
      guestPhone: '555-0103',
      date: nextWeek,
      time: '20:00',
      partySize: 8,
      specialRequests: 'Birthday party - will bring cake',
      status: 'CONFIRMED',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  console.log('Creating Food Truck bookings...');
  
  // Food Truck booking for next week
  await prisma.foodTruckBooking.create({
    data: {
      contactName: 'Robert Wilson',
      contactEmail: 'rwilson@techcorp.com',
      contactPhone: '555-0201',
      companyName: 'TechCorp Industries',
      eventDate: nextWeek,
      eventTime: '12:00',
      eventDuration: 4,
      eventLocation: '1234 Corporate Blvd, Business Park',
      eventType: 'Corporate Lunch',
      expectedGuests: 150,
      budget: 8000,
      menuPreferences: 'Variety of options including vegetarian and vegan',
      additionalNotes: 'Annual employee appreciation event',
      status: 'PENDING',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  // Food Truck booking for next month
  await prisma.foodTruckBooking.create({
    data: {
      contactName: 'Jennifer Martinez',
      contactEmail: 'jmartinez@example.com',
      contactPhone: '555-0202',
      companyName: 'Community Center',
      eventDate: nextMonth,
      eventTime: '11:00',
      eventDuration: 6,
      eventLocation: '567 Park Avenue, Downtown',
      eventType: 'Community Festival',
      expectedGuests: 300,
      budget: 15000,
      menuPreferences: 'Family-friendly options, kids meals available',
      additionalNotes: 'Part of summer festival series',
      status: 'CONTACTED',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  console.log('Creating Mobile Bar bookings...');
  
  // Mobile Bar for next week (wedding)
  await prisma.mobileBarBooking.create({
    data: {
      contactName: 'Amanda Thompson',
      contactEmail: 'amanda.t@wedding.com',
      contactPhone: '555-0301',
      eventDate: nextWeek,
      eventTime: '17:00',
      eventDuration: 5,
      eventLocation: 'Sunset Gardens Wedding Venue',
      eventType: 'Wedding Reception',
      expectedGuests: 200,
      packageType: 'PREMIUM',
      addOns: ['Champagne Service', 'Signature Cocktails', 'Premium Spirits'],
      specialRequests: 'Need champagne for toasts, signature his & hers cocktails',
      budget: 3500,
      status: 'CONFIRMED',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  // Mobile Bar for tomorrow (corporate event)
  await prisma.mobileBarBooking.create({
    data: {
      contactName: 'David Chen',
      contactEmail: 'dchen@marketing.com',
      contactPhone: '555-0302',
      eventDate: tomorrow,
      eventTime: '18:00',
      eventDuration: 4,
      eventLocation: 'Downtown Convention Center',
      eventType: 'Product Launch Party',
      expectedGuests: 100,
      packageType: 'STANDARD',
      addOns: ['LED Bar Lighting', 'Custom Cocktail Menu'],
      specialRequests: 'Company colors in cocktails (blue and silver)',
      budget: 2000,
      status: 'PENDING',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
    }
  });

  console.log('Creating CRM Inquiries...');
  
  // Catering inquiry
  const cateringInquiry = await prisma.contactInquiry.create({
    data: {
      name: 'Patricia Anderson',
      email: 'panderson@example.com',
      phone: '555-0401',
      subject: 'Catering for 50th Birthday Party',
      message: 'Looking for catering services for my husband\'s 50th birthday party. Expecting about 75 guests. Would like a mix of appetizers, main courses, and desserts. The party will be at our home with both indoor and outdoor seating.',
      serviceType: 'CATERING',
      eventDate: nextMonth,
      eventLocation: '789 Maple Street, Residential Area',
      guestCount: 75,
      status: 'NEW',
      priority: 'HIGH',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
      source: 'Website Form'
    }
  });

  // General inquiry that needs quoting
  const generalInquiry = await prisma.contactInquiry.create({
    data: {
      name: 'Thomas Rodriguez',
      email: 'trodriguez@nonprofit.org',
      phone: '555-0402',
      subject: 'Fundraising Gala - Multiple Services Needed',
      message: 'We are planning our annual fundraising gala and need both catering and mobile bar services. Event for 250 guests, black-tie affair. Need full dinner service plus premium bar. Budget is flexible for the right services.',
      serviceType: 'GENERAL',
      eventDate: nextMonth,
      eventLocation: 'Grand Ballroom, Historic Hotel',
      guestCount: 250,
      status: 'NEW',
      priority: 'URGENT',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
      source: 'Website Form'
    }
  });

  // Food truck inquiry
  const foodTruckInquiry = await prisma.contactInquiry.create({
    data: {
      name: 'Lisa Parker',
      email: 'lparker@school.edu',
      phone: '555-0403',
      subject: 'Food Truck for School Event',
      message: 'Looking to book your food truck for our school\'s spring carnival. We expect 400+ attendees including students and families. Need kid-friendly menu options.',
      serviceType: 'FOOD_TRUCK',
      eventDate: nextMonth,
      eventLocation: 'Riverside Elementary School',
      guestCount: 400,
      status: 'CONTACTED',
      priority: 'NORMAL',
      confirmationCode: uuidv4().slice(0, 8).toUpperCase(),
      source: 'Website Form'
    }
  });

  console.log('Creating sample Quotes...');
  
  // Create a quote for the catering inquiry
  await prisma.quote.create({
    data: {
      inquiryId: cateringInquiry.id,
      quoteNumber: `Q-2024-${uuidv4().slice(0, 6).toUpperCase()}`,
      amount: 3750,
      validUntil: nextMonth,
      serviceDetails: `Catering Service for 50th Birthday Party
      
Service Date: ${nextMonth.toLocaleDateString()}
Guest Count: 75
Location: 789 Maple Street

Menu Package:
- Appetizers (3 selections)
  • Shrimp Cocktail
  • Vegetable Spring Rolls
  • Cheese & Charcuterie Board
  
- Main Courses (2 selections)
  • Grilled Chicken with Herbs
  • Salmon with Lemon Butter
  • Vegetarian Pasta Option
  
- Sides
  • Garden Salad
  • Roasted Vegetables
  • Garlic Mashed Potatoes
  
- Desserts
  • Birthday Cake (provided by client)
  • Assorted Mini Desserts
  
Includes:
- Professional service staff (4 servers)
- All serving equipment
- Setup and cleanup
- Disposable plates and utensils (upgrade to china available)`,
      terms: 'Payment Terms: 50% deposit required upon booking confirmation. Remaining balance due 48 hours before event. Cancellation Policy: Full refund if cancelled 30+ days before event. 50% refund if cancelled 14-30 days before. No refund within 14 days of event.',
      notes: 'Client mentioned outdoor seating - recommend tent rental if weather is uncertain. Can provide referral to rental company.',
      status: 'SENT',
      sentToCustomer: true,
      sentAt: new Date(),
      createdBy: 'Admin'
    }
  });

  // Create a comprehensive quote for the gala
  await prisma.quote.create({
    data: {
      inquiryId: generalInquiry.id,
      quoteNumber: `Q-2024-${uuidv4().slice(0, 6).toUpperCase()}`,
      amount: 18500,
      validUntil: nextWeek,
      serviceDetails: `Complete Service Package for Fundraising Gala
      
Event Date: ${nextMonth.toLocaleDateString()}
Guest Count: 250
Venue: Grand Ballroom, Historic Hotel

CATERING SERVICES ($12,500):
- Cocktail Hour (6:00 PM - 7:00 PM)
  • 5 passed hors d'oeuvres selections
  • Stationed cheese & charcuterie display
  
- Dinner Service (7:00 PM - 9:00 PM)
  • Choice of 3 entrees (Filet Mignon, Salmon, Vegetarian)
  • Salad course
  • Artisan bread service
  • Chef's selection of sides
  • Dessert trio
  
MOBILE BAR SERVICE ($6,000):
- Premium Open Bar (6:00 PM - 11:00 PM)
  • Top shelf spirits
  • Wine selection (4 reds, 4 whites)
  • Domestic and imported beers
  • Signature cocktails (2)
  • Non-alcoholic beverages
  • Professional bartenders (4)
  • Complete bar setup with LED lighting
  
INCLUDED:
- Professional service staff (12 servers, 1 captain)
- China, glassware, and silverware
- Linen service (tables and napkins)
- Setup and breakdown
- Service charge and gratuity`,
      terms: 'Payment Terms: 25% deposit upon contract signing. 50% due 30 days before event. Final 25% due 48 hours before event. Prices include service charge but do not include applicable taxes. Menu tastings available upon request.',
      notes: 'This is a high-profile event. Recommend our premium service team. Client mentioned flexibility in budget for exceptional service.',
      status: 'DRAFT',
      sentToCustomer: false,
      createdBy: 'Admin'
    }
  });

  console.log('Creating internal notes...');
  
  await prisma.inquiryNote.create({
    data: {
      inquiryId: generalInquiry.id,
      note: 'High-value client - nonprofit has used our services before. They typically host 3-4 events per year. Priority follow-up needed.',
      isInternal: true,
      createdBy: 'Admin'
    }
  });

  await prisma.inquiryNote.create({
    data: {
      inquiryId: cateringInquiry.id,
      note: 'Spoke with Patricia on phone - very interested in our services. Mentioned they might also need mobile bar. Follow up about adding bar service to quote.',
      isInternal: true,
      createdBy: 'Sales Team'
    }
  });

  console.log('Creating email logs...');
  
  await prisma.emailLog.create({
    data: {
      inquiryId: cateringInquiry.id,
      type: 'CONFIRMATION',
      recipient: 'panderson@example.com',
      subject: 'We received your catering inquiry - Kocky\'s Bar & Grill',
      body: 'Thank you for your interest in our catering services...',
      status: 'SENT',
      sentAt: new Date()
    }
  });

  await prisma.emailLog.create({
    data: {
      inquiryId: cateringInquiry.id,
      type: 'QUOTE',
      recipient: 'panderson@example.com',
      subject: 'Your Catering Quote - 50th Birthday Party',
      body: 'Please find attached your customized quote for catering services...',
      status: 'OPENED',
      sentAt: new Date(),
      openedAt: new Date()
    }
  });

  console.log('✅ Sample data created successfully!');
  console.log('\n📊 Summary:');
  console.log('- 3 Reservations (1 today, 1 tomorrow, 1 next week)');
  console.log('- 2 Food Truck bookings');
  console.log('- 2 Mobile Bar bookings');
  console.log('- 3 CRM Inquiries');
  console.log('- 2 Quotes (1 sent, 1 draft)');
  console.log('- 2 Internal notes');
  console.log('- 2 Email logs');
  console.log('\n🎉 You can now test the CRM and Calendar systems with this data!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

