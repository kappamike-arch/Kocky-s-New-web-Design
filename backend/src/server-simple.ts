import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllHeroSettings, getHeroSettings, updateHeroSettings, saveAllHeroSettings } from './hero-settings';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://staging.kockys.com',
    process.env.ADMIN_URL || 'https://staging.kockys.com/admin',
    'http://72.167.227.205:3003',
    'http://72.167.227.205:4000'
  ],
  credentials: true
}));
// Increase limit for base64 image uploads (10MB should be enough)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/menu');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// In-memory storage for menu items
let menuItems: any[] = [];
let nextId = 1;

// Menu endpoints
app.get('/api/menu', (req: Request, res: Response) => {
  const { category } = req.query;
  let filteredItems = menuItems;
  
  if (category && category !== 'ALL') {
    filteredItems = menuItems.filter(item => item.category === category);
  }
  
  res.json({
    success: true,
    data: filteredItems
  });
});

app.post('/api/menu', upload.single('image'), (req: Request, res: Response) => {
  const newItem = {
    id: String(nextId++),
    ...req.body,
    imageUrl: req.file ? `/uploads/menu/${req.file.filename}` : req.body.imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Parse JSON fields that might come as strings from FormData
  if (typeof newItem.price === 'string') {
    newItem.price = parseFloat(newItem.price);
  }
  if (typeof newItem.isAvailable === 'string') {
    newItem.isAvailable = newItem.isAvailable === 'true';
  }
  if (typeof newItem.isFeatured === 'string') {
    newItem.isFeatured = newItem.isFeatured === 'true';
  }
  if (typeof newItem.isSpecial === 'string') {
    newItem.isSpecial = newItem.isSpecial === 'true';
  }
  if (typeof newItem.preparationTime === 'string') {
    newItem.preparationTime = parseInt(newItem.preparationTime);
  }
  
  menuItems.push(newItem);
  
  res.status(201).json({
    success: true,
    data: newItem
  });
});

app.put('/api/menu/:id', upload.single('image'), (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  
  const updateData = { ...req.body };
  
  // Handle image upload
  if (req.file) {
    updateData.imageUrl = `/uploads/menu/${req.file.filename}`;
  }
  
  // Parse JSON fields that might come as strings from FormData
  if (typeof updateData.price === 'string') {
    updateData.price = parseFloat(updateData.price);
  }
  if (typeof updateData.isAvailable === 'string') {
    updateData.isAvailable = updateData.isAvailable === 'true';
  }
  if (typeof updateData.isFeatured === 'string') {
    updateData.isFeatured = updateData.isFeatured === 'true';
  }
  if (typeof updateData.isSpecial === 'string') {
    updateData.isSpecial = updateData.isSpecial === 'true';
  }
  if (typeof updateData.preparationTime === 'string') {
    updateData.preparationTime = parseInt(updateData.preparationTime);
  }
  
  menuItems[index] = {
    ...menuItems[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: menuItems[index]
  });
});

app.delete('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  
  menuItems.splice(index, 1);
  
  res.json({ success: true });
});

app.patch('/api/menu/:id/toggle-availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = menuItems.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  
  item.isAvailable = !item.isAvailable;
  item.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: item
  });
});

app.patch('/api/menu/:id/toggle-featured', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = menuItems.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  
  item.isFeatured = !item.isFeatured;
  item.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: item
  });
});

// Mock admin stats endpoint
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: {
      reservations: { total: 127, today: 8 },
      orders: { total: 543, today: 22 },
      users: { total: 1842 },
      revenue: { total: 28543.50, today: 1234.75 },
      newsletter: { subscribers: 423 }
    }
  });
});

// Hero Settings API endpoints
// Get all hero settings
app.get('/api/hero-settings', (req: Request, res: Response) => {
  try {
    const settings = getAllHeroSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get hero settings for a specific page
app.get('/api/hero-settings/:pageId', (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const settings = getHeroSettings(pageId);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: `Settings for page ${pageId} not found`
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update hero settings for a specific page
app.put('/api/hero-settings/:pageId', (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const updatedSettings = updateHeroSettings(pageId, req.body);
    
    res.json({
      success: true,
      data: updatedSettings,
      message: `Settings updated for ${pageId}`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save all hero settings at once
app.post('/api/hero-settings/save-all', (req: Request, res: Response) => {
  try {
    const { pages } = req.body;
    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data: pages array required'
      });
    }
    
    saveAllHeroSettings(pages);
    
    res.json({
      success: true,
      message: 'All hero settings saved successfully',
      data: pages
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Kocky's Bar & Grill API",
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin: '/api/admin/dashboard'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
