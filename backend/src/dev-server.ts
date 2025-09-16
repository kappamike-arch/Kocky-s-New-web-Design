import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllHeroSettings, getHeroSettings, updateHeroSettings, saveAllHeroSettings } from './hero-settings';

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure logos directory exists
const logosDir = path.join(uploadDir, 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For logo uploads, save to logos directory
    if (req.path.includes('upload-logo')) {
      cb(null, logosDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // For logos, include page ID in filename for better organization
    if (req.path.includes('upload-logo') && req.params.pageId) {
      cb(null, `logo-${req.params.pageId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    } else {
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, gif, webp, svg)'));
    }
  }
});

// Middleware
app.use(cors({
  origin: ['http://staging.kockys.com', 'http://staging.kockys.com:3003', 'http://staging.kockys.com/admin', 'http://staging.kockys.com:4001', 'https://staging.kockys.com', 'https://staging.kockys.com/admin', 'https://api.staging.kockys.com'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));

// In-memory data stores
let settings = {
  contactEmail: 'info@kockysbar.com',
  contactPhone: '(702) 555-0123',
  address: '123 Main Street, Las Vegas, NV 89101',
  businessHours: {
    monday: { open: '11:00 AM', close: '11:00 PM' },
    tuesday: { open: '11:00 AM', close: '11:00 PM' },
    wednesday: { open: '11:00 AM', close: '11:00 PM' },
    thursday: { open: '11:00 AM', close: '11:00 PM' },
    friday: { open: '11:00 AM', close: '2:00 AM' },
    saturday: { open: '10:00 AM', close: '2:00 AM' },
    sunday: { open: '10:00 AM', close: '11:00 PM' }
  },
  socialMedia: {
    facebook: 'https://facebook.com/kockysbar',
    instagram: 'https://instagram.com/kockysbar',
    twitter: 'https://twitter.com/kockysbar'
  }
};

let menuItems: any[] = [
  { 
    id: 1, 
    name: 'Classic Burger', 
    price: 12.99, 
    category: 'burgers', 
    description: 'Juicy beef patty with lettuce, tomato, and our special sauce',
    available: true,
    featured: false,
    special: false,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'Chicken Wings', 
    price: 10.99, 
    category: 'appetizers', 
    description: '10 piece wings with your choice of sauce',
    available: true,
    featured: true,
    special: false,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 3, 
    name: 'Caesar Salad', 
    price: 8.99, 
    category: 'salads', 
    description: 'Fresh romaine lettuce with caesar dressing and croutons',
    available: true,
    featured: false,
    special: false,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

let reservations: any[] = [];
let mobileBarBookings: any[] = [];
let quotes: any[] = [];
let nextMenuId = 4;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development server is running' });
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

// Menu endpoints
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(item => item.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

// Create menu item with optional image upload
app.post('/api/menu', upload.single('image'), (req, res) => {
  try {
    const newItem = {
      id: nextMenuId++,
      name: req.body.name || 'Untitled Item',
      category: req.body.category || 'uncategorized',
      description: req.body.description || '',
      price: parseFloat(req.body.price) || 0,
      specialPrice: req.body.specialPrice ? parseFloat(req.body.specialPrice) : null,
      prepTime: parseInt(req.body.prepTime) || 15,
      available: req.body.available === 'true' || req.body.available === true,
      featured: req.body.featured === 'true' || req.body.featured === true,
      special: req.body.special === 'true' || req.body.special === true,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      allergens: req.body.allergens ? JSON.parse(req.body.allergens) : [],
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    menuItems.push(newItem);
    res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    res.status(400).json({ error: error.message || 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/menu/:id', upload.single('image'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = menuItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    const updatedItem = {
      ...menuItems[index],
      name: req.body.name || menuItems[index].name,
      category: req.body.category || menuItems[index].category,
      description: req.body.description !== undefined ? req.body.description : menuItems[index].description,
      price: req.body.price ? parseFloat(req.body.price) : menuItems[index].price,
      specialPrice: req.body.specialPrice ? parseFloat(req.body.specialPrice) : menuItems[index].specialPrice,
      prepTime: req.body.prepTime ? parseInt(req.body.prepTime) : menuItems[index].prepTime,
      available: req.body.available !== undefined ? 
        (req.body.available === 'true' || req.body.available === true) : 
        menuItems[index].available,
      featured: req.body.featured !== undefined ? 
        (req.body.featured === 'true' || req.body.featured === true) : 
        menuItems[index].featured,
      special: req.body.special !== undefined ? 
        (req.body.special === 'true' || req.body.special === true) : 
        menuItems[index].special,
      image: req.file ? `/uploads/${req.file.filename}` : menuItems[index].image,
      allergens: req.body.allergens ? JSON.parse(req.body.allergens) : menuItems[index].allergens,
      tags: req.body.tags ? JSON.parse(req.body.tags) : menuItems[index].tags,
      updatedAt: new Date().toISOString()
    };
    
    menuItems[index] = updatedItem;
    res.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    res.status(400).json({ error: error.message || 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = menuItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  
  // Delete associated image file if exists
  const item = menuItems[index];
  if (item.image) {
    const imagePath = path.join(uploadDir, path.basename(item.image));
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  
  menuItems.splice(index, 1);
  res.json({ message: 'Menu item deleted successfully' });
});

// Upload image endpoint (for updating image only)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({ 
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    originalname: req.file.originalname
  });
});

// Reservation endpoints
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.post('/api/reservations', (req, res) => {
  const newReservation = { 
    id: reservations.length + 1, 
    ...req.body, 
    status: 'pending',
    createdAt: new Date().toISOString() 
  };
  reservations.push(newReservation);
  res.json(newReservation);
});

// Inquiries endpoints (for admin panel)
app.get('/api/inquiries', (req, res) => {
  const { type, status } = req.query;
  let filteredData = [];
  
  if (type === 'RESERVATION') {
    filteredData = reservations.map(r => ({
      ...r,
      type: 'RESERVATION',
      status: r.status?.toUpperCase() || 'PENDING'
    }));
  } else if (type === 'MOBILE_BAR') {
    filteredData = mobileBarBookings.map(b => ({
      ...b,
      type: 'MOBILE_BAR',
      status: b.status?.toUpperCase() || 'PENDING'
    }));
  } else if (type === 'FOOD_TRUCK') {
    filteredData = foodTruckBookings.map(b => ({
      ...b,
      type: 'FOOD_TRUCK',
      status: b.status?.toUpperCase() || 'PENDING'
    }));
  } else {
    // Return all inquiries combined
    filteredData = [
      ...reservations.map(r => ({ ...r, type: 'RESERVATION', status: r.status?.toUpperCase() || 'PENDING' })),
      ...mobileBarBookings.map(b => ({ ...b, type: 'MOBILE_BAR', status: b.status?.toUpperCase() || 'PENDING' })),
      ...foodTruckBookings.map(b => ({ ...b, type: 'FOOD_TRUCK', status: b.status?.toUpperCase() || 'PENDING' }))
    ];
  }
  
  // Filter by status if provided
  if (status && status !== 'ALL') {
    filteredData = filteredData.filter(item => item.status === status);
  }
  
  res.json({
    data: filteredData,
    total: filteredData.length,
    page: 1,
    limit: 20
  });
});

app.patch('/api/inquiries/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  // Find and update in appropriate array
  let updated = false;
  
  // Check reservations
  const resIndex = reservations.findIndex(r => r.id === parseInt(id) || r.id === id);
  if (resIndex !== -1) {
    reservations[resIndex] = { 
      ...reservations[resIndex], 
      status: status.toLowerCase(),
      notes 
    };
    updated = true;
    res.json(reservations[resIndex]);
  }
  
  // Check mobile bar bookings
  if (!updated) {
    const mbIndex = mobileBarBookings.findIndex(b => b.id === parseInt(id) || b.id === id);
    if (mbIndex !== -1) {
      mobileBarBookings[mbIndex] = { 
        ...mobileBarBookings[mbIndex], 
        status: status.toLowerCase(),
        notes 
      };
      res.json(mobileBarBookings[mbIndex]);
      return;
    }
  }
  
  if (!updated) {
    res.status(404).json({ message: 'Inquiry not found' });
  }
});

// Food Truck bookings
let foodTruckBookings = [
  {
    id: 1,
    name: 'Alex Thompson',
    email: 'alex@example.com',
    phone: '555-1234',
    type: 'FOOD_TRUCK',
    eventDate: new Date('2024-02-15').toISOString(),
    location: 'Downtown Park',
    guestCount: 150,
    budget: '$2000-3000',
    message: 'Company picnic event, need vegetarian options',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }
];

// Mobile Bar Booking endpoints
app.get('/api/mobilebar', (req, res) => {
  res.json(mobileBarBookings);
});

app.post('/api/mobilebar', (req, res) => {
  const newBooking = { 
    id: mobileBarBookings.length + 1, 
    ...req.body,
    status: 'pending', 
    createdAt: new Date().toISOString() 
  };
  mobileBarBookings.push(newBooking);
  res.json(newBooking);
});

// Quotes endpoints
app.get('/api/quotes', (req, res) => {
  res.json(quotes);
});

app.post('/api/quotes', (req, res) => {
  const newQuote = { 
    id: quotes.length + 1, 
    ...req.body,
    status: 'draft',
    createdAt: new Date().toISOString() 
  };
  quotes.push(newQuote);
  res.json(newQuote);
});

// Newsletter endpoint
app.post('/api/newsletter', (req, res) => {
  console.log('Newsletter signup:', req.body);
  res.json({ message: 'Successfully subscribed to newsletter', success: true });
});

// Hero Settings API endpoints
// Get all hero settings
app.get('/api/hero-settings', (req, res) => {
  try {
    const settings = getAllHeroSettings();
    res.json({
      success: true,
      data: Object.values(settings)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero settings',
      error: error.message
    });
  }
});

// Get hero settings for a specific page
app.get('/api/hero-settings/:pageId', (req, res) => {
  try {
    const { pageId } = req.params;
    const settings = getHeroSettings(pageId);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `Hero settings not found for page: ${pageId}`
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hero settings',
      error: error.message
    });
  }
});

// Update hero settings for a specific page
app.put('/api/hero-settings/:pageId', (req, res) => {
  const { pageId } = req.params;
  
  try {
    const updates = req.body;
    
    console.log(`[Hero Settings] Updating ${pageId}:`, updates);
    
    const updatedSettings = updateHeroSettings(pageId, updates);
    
    console.log(`[Hero Settings] Successfully updated ${pageId}:`, updatedSettings);
    
    // Add CORS headers for real-time updates
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Hero settings updated successfully'
    });
  } catch (error: any) {
    console.error(`[Hero Settings] Error updating ${pageId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hero settings',
      error: error.message
    });
  }
});

// Save all hero settings at once
app.post('/api/hero-settings/save-all', (req, res) => {
  try {
    const { pages } = req.body;
    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: pages array required'
      });
    }

    const saved = saveAllHeroSettings(pages);
    res.json({
      success: true,
      data: saved,
      message: 'All hero settings saved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to save hero settings',
      error: error.message
    });
  }
});

// Upload logo for hero settings
app.post('/api/hero-settings/:pageId/upload-logo', upload.single('logo'), (req, res) => {
  const { pageId } = req.params;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Generate the URL for the uploaded file
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    console.log(`[Logo Upload] Uploaded logo for ${pageId}:`, logoUrl);
    
    // Update hero settings with the new logo URL
    const updatedSettings = updateHeroSettings(pageId, {
      logoUrl: logoUrl,
      useLogo: true
    });
    
    res.json({
      success: true,
      data: {
        logoUrl: logoUrl,
        settings: updatedSettings
      },
      message: 'Logo uploaded successfully'
    });
  } catch (error: any) {
    console.error(`[Logo Upload] Error for ${pageId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
});

// Catch all 404
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found', path: req.url });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server is running at http://staging.kockys.com:${PORT}`);
  console.log('📝 This is a simple in-memory server for development purposes');
  console.log('🔄 All data will be lost on restart');
  console.log('\nAvailable endpoints:');
  console.log('  GET    /api/health');
  console.log('  GET    /api/settings');
  console.log('  PUT    /api/settings');
  console.log('  GET    /api/menu');
  console.log('  POST   /api/menu (with image upload)');
  console.log('  PUT    /api/menu/:id (with image upload)');
  console.log('  DELETE /api/menu/:id');
  console.log('  POST   /api/upload');
  console.log('  GET    /api/reservations');
  console.log('  POST   /api/reservations');
  console.log('  GET    /api/mobilebar');
  console.log('  POST   /api/mobilebar');
  console.log('  GET    /api/quotes');
  console.log('  POST   /api/quotes');
  console.log('  POST   /api/newsletter');
  console.log('  GET    /api/hero-settings');
  console.log('  GET    /api/hero-settings/:pageId');
  console.log('  PUT    /api/hero-settings/:pageId');
  console.log('  POST   /api/hero-settings/save-all');
});