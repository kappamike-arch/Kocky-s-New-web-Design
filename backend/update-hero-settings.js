const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateHeroSettings() {
  try {
    console.log('Updating hero settings for brunch and happy-hour pages...');
    
    // Update brunch page
    const brunchUpdate = await prisma.heroSettings.update({
      where: { pageId: 'brunch' },
      data: {
        backgroundImage: '/images/brunch-hero.jpg',
        backgroundVideo: '/videos/brunch-hero.mp4',
        mediaPreference: 'auto'
      }
    });
    console.log('Updated brunch settings:', brunchUpdate);
    
    // Update happy-hour page
    const happyHourUpdate = await prisma.heroSettings.update({
      where: { pageId: 'happy-hour' },
      data: {
        backgroundImage: '/images/happy-hour-hero.jpg',
        backgroundVideo: '/videos/happy-hour-hero.mp4',
        mediaPreference: 'auto'
      }
    });
    console.log('Updated happy-hour settings:', happyHourUpdate);
    
    console.log('Hero settings updated successfully!');
  } catch (error) {
    console.error('Error updating hero settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHeroSettings();






