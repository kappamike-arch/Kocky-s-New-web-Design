import { Router, Request, Response } from 'express';
import { prisma } from '../server';
import { logger } from '../utils/logger';

const router = Router();

// Diagnostic endpoint to check database connection and settings
router.get('/', async (req: Request, res: Response) => {
  try {
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Get current environment info
    const nodeEnv = process.env.NODE_ENV || 'development';
    const databaseUrl = process.env.DATABASE_URL || 'not-set';
    
    // Mask the database URL for security (show only host/db name)
    const maskedDbUrl = databaseUrl.replace(/\/\/.*@/, '//***@').replace(/\/.*$/, '/***');

    // Get counts for key tables
    const [
      settingsCount,
      heroSettingsCount,
      serviceSettingsCount,
      usersCount,
      contactInquiriesCount
    ] = await Promise.all([
      prisma.settings.count(),
      prisma.heroSettings.count(),
      prisma.serviceSettings.count(),
      prisma.user.count(),
      prisma.contactInquiry.count()
    ]);

    // Get latest updated timestamps for settings tables
    const [
      latestSettings,
      latestHeroSettings,
      latestServiceSettings
    ] = await Promise.all([
      prisma.settings.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, updatedAt: true, siteName: true }
      }),
      prisma.heroSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, updatedAt: true, pageName: true }
      }),
      prisma.serviceSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, updatedAt: true, serviceName: true }
      })
    ]);

    // Get sample settings data to verify content
    const sampleSettings = await prisma.settings.findFirst({
      select: {
        id: true,
        siteName: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        businessHours: true,
        socialMedia: true,
        updatedAt: true
      }
    });

    // Get sample hero settings data
    const sampleHeroSettings = await prisma.heroSettings.findMany({
      take: 3,
      select: {
        id: true,
        pageId: true,
        pageName: true,
        pageSlug: true,
        useLogo: true,
        logoUrl: true,
        title: true,
        subtitle: true,
        backgroundImage: true,
        backgroundVideo: true,
        mediaPreference: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: nodeEnv,
        DATABASE_URL: maskedDbUrl,
        PORT: process.env.PORT || 'not-set'
      },
      database: {
        connected: true,
        counts: {
          settings: settingsCount,
          heroSettings: heroSettingsCount,
          serviceSettings: serviceSettingsCount,
          users: usersCount,
          contactInquiries: contactInquiriesCount
        },
        latestUpdates: {
          settings: latestSettings ? {
            id: latestSettings.id,
            updatedAt: latestSettings.updatedAt,
            name: latestSettings.siteName
          } : null,
          heroSettings: latestHeroSettings ? {
            id: latestHeroSettings.id,
            updatedAt: latestHeroSettings.updatedAt,
            name: latestHeroSettings.pageName
          } : null,
          serviceSettings: latestServiceSettings ? {
            id: latestServiceSettings.id,
            updatedAt: latestServiceSettings.updatedAt,
            name: latestServiceSettings.serviceName
          } : null
        }
      },
      sampleData: {
        settings: sampleSettings,
        heroSettings: sampleHeroSettings
      }
    };

    logger.info('Diagnostic endpoint accessed', {
      nodeEnv,
      settingsCount,
      heroSettingsCount,
      latestSettingsUpdate: latestSettings?.updatedAt,
      latestHeroSettingsUpdate: latestHeroSettings?.updatedAt
    });

    res.json({
      success: true,
      diagnostic
    });

  } catch (error) {
    logger.error('Diagnostic endpoint error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not-set'
        }
      }
    });
  }
});

export default router;

