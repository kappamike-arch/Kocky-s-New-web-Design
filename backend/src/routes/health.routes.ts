import { Router } from 'express';
import { prisma } from '../server';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/healthz', async (req, res) => {
  const startTime = Date.now();
  const health = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      db: false,
      api: true
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    health.services.db = true;
    
    const responseTime = Date.now() - startTime;
    (health as any).responseTime = responseTime;
    
    logger.info('Health check passed', { 
      responseTime,
      services: health.services 
    });
    
    res.status(200).json(health);
  } catch (error) {
    health.ok = false;
    health.services.db = false;
    
    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(503).json(health);
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

export default router;
