const express = require('express');
const app = express();
const PORT = 5001;

app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@kockysbar.com' && password === 'AdminPassword123!') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '1',
        email: 'admin@kockysbar.com',
        name: 'Admin User',
        role: 'ADMIN',
      },
      token: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-67890',
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }
});

app.get('/api/auth/session', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'admin@kockysbar.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'admin@kockysbar.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
});

// Add missing endpoints that the admin panel needs
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalVisitors: 1250,
      totalOrders: 89,
      totalRevenue: 12500,
      recentOrders: [],
      topMenuItems: [],
      websiteStats: {
        clicks: 1250,
        pageViews: 3200,
        uniqueVisitors: 890
      }
    }
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    stats: {
      revenue: { total: 45678.90, today: 2345.67 },
      orders: { total: 892, today: 34 },
      reservations: { total: 234, today: 12 },
      users: { total: 3456 }
    }
  });
});

app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: "Kocky's Bar & Grill",
      siteDescription: "Premium Bar & Grill Experience",
      contactEmail: "info@kockysbar.com",
      contactPhone: "(555) 123-4567"
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on 0.0.0.0:${PORT}`);
});
