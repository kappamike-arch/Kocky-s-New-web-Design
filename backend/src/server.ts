import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { connectPrisma, disconnectPrisma, prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { sanitizeMiddleware } from './middleware/sanitize';

// Import routes
import authRoutes from './routes/auth.routes';
import reservationRoutes from './routes/reservation.routes';
import foodTruckRoutes from './routes/foodtruck.routes';
import mobileBarRoutes from './routes/mobilebar.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import newsletterRoutes from './routes/newsletter.routes';
import adminRoutes from './routes/admin.routes';
import contactRoutes from './routes/contact.routes';
import settingsRoutes from './routes/settings.routes';
import formsRoutes from './routes/forms.routes';
import crmRoutes from './routes/crm.routes';
import quoteRoutes from './routes/quote.routes';
import calendarRoutes from './routes/calendar.routes';
import servicesRoutes from './routes/services.routes';
import heroSettingsRoutes from './routes/hero-settings.routes';
import emailTemplateRoutes from './routes/email-template.routes';
import emailRoutes from './routes/email.routes';
import azureEmailRoutes from './routes/azure-email.routes';
import quoteConfigRoutes from './routes/quote-config.routes';
import galleryRoutes from './routes/gallery.routes';
import pageContentRoutes from './routes/page-content.routes';
import enhancedMenuRoutes from './routes/enhanced-menu.routes';
import unifiedFormsRoutes from './routes/unified-forms.routes';
import analyticsRoutes from './routes/analytics.routes';
import mediaRoutes from './routes/media.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Security middleware with customized settings for uploads
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin access for uploads
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:*", "https://localhost:*", "http://72.167.227.205:*"],
      mediaSrc: ["'self'", "data:", "https://staging.kockys.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests from these origins
    const allowedOrigins = [
      'http://72.167.227.205:3003/',  // Frontend on 3003 (local dev)
      'http://localhost:4000',  // Admin panel on 4000 (local dev) [[memory:7534915]]
      'http://72.167.227.205:3003',  // Production Frontend
      'http://72.167.227.205:4000',  // Production Admin panel
      'https://staging.kockys.com',  // Production API
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - disabled for local development
// Uncomment for production
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Body parsing middleware with increased limits for video uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Input sanitization middleware to prevent XSS attacks
app.use(sanitizeMiddleware);

// Serve static files from public_html/uploads (logos, videos, etc.) - web accessible
app.use('/uploads', express.static('/home/stagingkockys/public_html/uploads'));

// Also serve from backend/uploads for backward compatibility
app.use('/backend-uploads', express.static(path.join(__dirname, '../uploads')));

// Legacy video files support (redirect to uploads/videos)
app.use('/videos', express.static('/home/stagingkockys/public_html/uploads/videos'));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/food-truck', foodTruckRoutes);
app.use('/api/mobile-bar', mobileBarRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/services', servicesRoutes);  // Fixed: was incorrectly using /api/settings
app.use('/api/hero-settings', heroSettingsRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/azure-email', azureEmailRoutes);
app.use('/api/quote-config', quoteConfigRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/page-content', pageContentRoutes);
app.use('/api/enhanced-menu', enhancedMenuRoutes);
app.use('/api/unified-forms', unifiedFormsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);

// Welcome route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Kocky's Bar & Grill API",
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      reservations: '/api/reservations',
      foodTruck: '/api/food-truck',
      mobileBar: '/api/mobile-bar',
      menu: '/api/menu',
      orders: '/api/orders',
      newsletter: '/api/newsletter',
      admin: '/api/admin',
      contact: '/api/contact',
      settings: '/api/settings',
      forms: '/api/forms',
      crm: '/api/crm',
      calendar: '/api/calendar',
      media: '/api/media'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const handleShutdown = async (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await connectPrisma();
    logger.info('Database connected successfully');
    
    // Initialize hero settings in database
    const { initializeHeroSettings } = await import('./hero-settings-db');
    await initializeHeroSettings();
    logger.info('Hero settings initialized');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
