import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { sanitizeMiddleware } from './middleware/sanitize';
import { requestIdMiddleware } from './middleware/requestId';

// Import routes
import authRoutes from './routes/simple-auth.routes';
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
import quoteConfigRoutes from './routes/quote-config.routes';
import galleryRoutes from './routes/gallery.routes';
import pageContentRoutes from './routes/page-content.routes';
import enhancedMenuRoutes from './routes/enhanced-menu.routes';
import unifiedFormsRoutes from './routes/unified-forms.routes';
import analyticsRoutes from './routes/analytics.routes';
import jobsRoutes from './routes/jobs.routes';
import eventsRoutes from './routes/events.routes';
import emailRoutes from './routes/email';
import graphEmailRoutes from './routes/graphEmail.routes';
import healthRoutes from './routes/health.routes';
import stripeRoutes from './routes/stripe.routes';
import paymentRoutes from './routes/payment.routes';
import { emailScheduler } from './services/emailScheduler';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Production configuration
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://staging.kockys.com';

// Helper to build absolute file URLs (use when persisting new files)
export const fileUrl = (p: string) => `${PUBLIC_BASE_URL}${p.startsWith('/') ? p : '/' + p}`;

// Security middleware with customized settings for uploads
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin access for uploads
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://staging.kockys.com", "https://images.unsplash.com"],
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

// CORS configuration - strict for production
const corsOptions = {
  origin: ['https://staging.kockys.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Request ID middleware for tracing
app.use(requestIdMiddleware);

// Rate limiting - disabled for local development
// Uncomment for production
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Stripe webhook endpoint needs raw body (mount before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body limits to 10 MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware to prevent XSS attacks
app.use(sanitizeMiddleware);

// Serve static uploads with caching
app.use('/uploads', express.static('/home/stagingkockys/public_html/uploads', {
  maxAge: '365d',
  immutable: true
}));

// Legacy video files support (redirect to uploads/videos)
app.use('/videos', express.static('/home/stagingkockys/public_html/uploads/videos', {
  maxAge: '365d',
  immutable: true
}));

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
app.use('/api/quote-config', quoteConfigRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/page-content', pageContentRoutes);
app.use('/api/enhanced-menu', enhancedMenuRoutes);
app.use('/api/unified-forms', unifiedFormsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/graph-email', graphEmailRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', healthRoutes);

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
      events: '/api/events'
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
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Initialize hero settings in database
    const { initializeHeroSettings } = await import('./hero-settings-db');
    await initializeHeroSettings();
    logger.info('Hero settings initialized');

    // Initialize email scheduler
    logger.info('Email scheduler initialized');

    app.listen(parseInt(PORT.toString()), '0.0.0.0', () => {
      logger.info(`Server is running on 0.0.0.0:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Public Base URL: ${PUBLIC_BASE_URL}`);
      logger.info(`API Base URL: ${PUBLIC_BASE_URL}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
