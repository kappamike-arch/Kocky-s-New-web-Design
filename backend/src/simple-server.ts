import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Import simple auth routes
import simpleAuthRoutes from './routes/simple-auth.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:*", "https://localhost:*", "http://72.167.227.205:*", "https://staging.kockys.com", "https://api.staging.kockys.com"],
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
    const allowedOrigins = [
      'http://72.167.227.205:3003',
      'http://localhost:4000',
      'http://72.167.227.205:4000',
      'https://staging.kockys.com',
      'https://staging.kockys.com/admin',
      'https://api.staging.kockys.com',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files
app.use('/uploads', express.static('/home/stagingkockys/public_html/uploads'));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Simple auth routes
app.use('/api/auth', simpleAuthRoutes);

// Welcome route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Kocky's Bar & Grill API",
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      authLogin: '/api/auth/login',
      authLogout: '/api/auth/logout',
      authSession: '/api/auth/session'
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

// Start server
const startServer = async () => {
  try {
    app.listen(parseInt(PORT.toString()), '0.0.0.0', () => {
      console.log(`Simple server is running on 0.0.0.0:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();










