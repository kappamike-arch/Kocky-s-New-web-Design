import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function seedHappyHourPage() {
  try {
    logger.info('Seeding Happy Hour page...');

    // Check if happy-hour page already exists
    const existingPage = await prisma.pageContent.findUnique({
      where: { slug: 'happy-hour' }
    });

    if (existingPage) {
      logger.info('Happy Hour page already exists');
      return existingPage;
    }

    // Create happy-hour page
    const happyHourPage = await prisma.pageContent.create({
      data: {
        slug: 'happy-hour',
        title: 'Happy Hour Specials',
        heroTitle: 'Happy Hour Specials',
        heroSubtitle: 'Daily 3PM - 6PM',
        content: JSON.stringify({
          description: 'Join us for amazing drink specials and appetizer deals every weekday!',
          schedule: 'Monday through Friday, 3:00 PM - 6:00 PM',
          features: [
            'Up to 50% off selected cocktails, beer & wine',
            '$5 - $8 appetizers perfect for sharing',
            'Extended hours on Fridays until 7PM'
          ]
        }),
        metaTitle: 'Happy Hour Specials | Kocky\'s Bar & Grill',
        metaDescription: 'Join us for the best happy hour deals in town! Daily 3PM-6PM with discounted drinks and appetizers.',
        isActive: true
      }
    });

    logger.info('Happy Hour page created successfully');
    return happyHourPage;
  } catch (error) {
    logger.error('Failed to seed Happy Hour page:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedHappyHourPage()
    .then(() => {
      console.log('Happy Hour page seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Happy Hour page seeding failed:', error);
      process.exit(1);
    });
}

export { seedHappyHourPage };
