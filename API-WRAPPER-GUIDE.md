# API Wrapper Usage Guide

This guide explains how to use the centralized API wrappers to eliminate hardcoded URLs and improve code maintainability.

## Overview

We've created centralized API wrappers for both the frontend and admin panel that provide:
- Consistent base URL configuration
- Automatic authentication handling
- Error handling and logging
- TypeScript support
- Helper functions for common operations

## Files Created

### Frontend
- **`frontend/src/lib/api.ts`** - Centralized API client for frontend
- **`frontend/src/lib/config.ts`** - Configuration constants

### Admin Panel
- **`admin-panel/src/lib/api.ts`** - Centralized API client for admin panel
- **`admin-panel/src/lib/config.ts`** - Configuration constants

## Usage Examples

### Basic API Calls

#### Before (Hardcoded URLs)
```typescript
// ❌ Don't do this
const response = await fetch('http://localhost:5001/api/email-templates');
const data = await response.json();

// ❌ Don't do this
const response = await axios.get('http://127.0.0.1:5001/api/menu');
```

#### After (Using API Wrapper)
```typescript
// ✅ Do this instead
import { api } from '@/lib/api';

// Using the axios instance directly
const response = await api.get('/email-templates');
const data = response.data;

// Using helper functions (recommended)
import { apiHelpers } from '@/lib/api';
const data = await apiHelpers.get('/email-templates');
```

### Helper Functions

The API wrapper provides convenient helper functions:

```typescript
import { apiHelpers } from '@/lib/api';

// GET request
const menuItems = await apiHelpers.get('/menu');

// POST request
const newItem = await apiHelpers.post('/menu', {
  name: 'New Item',
  price: 12.99
});

// PUT request
const updatedItem = await apiHelpers.put('/menu/123', {
  name: 'Updated Item'
});

// PATCH request
const patchedItem = await apiHelpers.patch('/menu/123', {
  price: 15.99
});

// DELETE request
await apiHelpers.delete('/menu/123');
```

### Image/Media URLs

#### Before (Hardcoded URLs)
```typescript
// ❌ Don't do this
const imageUrl = `http://72.167.227.205:5001${imagePath}`;
const videoUrl = `http://localhost:5001${videoPath}`;
```

#### After (Using Config)
```typescript
// ✅ Do this instead
import { UPLOADS_URL } from '@/lib/config';

const imageUrl = `${UPLOADS_URL}${imagePath}`;
const videoUrl = `${UPLOADS_URL}${videoPath}`;
```

### Error Handling

The API wrapper includes automatic error handling:

```typescript
import { apiHelpers } from '@/lib/api';

try {
  const data = await apiHelpers.get('/menu');
  console.log('Success:', data);
} catch (error) {
  // Error is automatically logged in development
  console.error('API Error:', error.message);
  
  // 401 errors automatically clear auth tokens
  // 403 errors can be handled specifically
  if (error.response?.status === 403) {
    // Handle forbidden access
  }
}
```

## Configuration

### Environment Variables

The API wrapper uses these environment variables:

```bash
# Base URLs
NEXT_PUBLIC_PUBLIC_BASE_URL=https://staging.kockys.com
NEXT_PUBLIC_API_BASE_URL=https://staging.kockys.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://staging.kockys.com

# Environment
NEXT_PUBLIC_ENV=staging
```

### Available Constants

```typescript
import { 
  API_URL,           // Full API URL (e.g., https://staging.kockys.com/api)
  UPLOADS_URL,       // Uploads URL (e.g., https://staging.kockys.com/uploads)
  PUBLIC_BASE_URL,   // Public base URL (e.g., https://staging.kockys.com)
  ADMIN_BASE_URL,    // Admin panel URL (e.g., https://staging.kockys.com/admin)
  PRISMA_STUDIO_URL, // Prisma Studio URL (e.g., https://staging.kockys.com/prisma)
  IS_DEVELOPMENT,    // Boolean for development environment
  IS_STAGING,        // Boolean for staging environment
  IS_PRODUCTION      // Boolean for production environment
} from '@/lib/config';
```

## Migration Checklist

### ✅ Completed
- [x] Created centralized API wrappers
- [x] Updated Next.js image configurations
- [x] Replaced hardcoded URLs in key files
- [x] Added environment variable structure
- [x] Created migration script

### 🔄 In Progress
- [ ] Review and test all changes
- [ ] Update remaining hardcoded URLs
- [ ] Test API calls in both environments

### 📋 Next Steps
1. **Test the API wrappers** in both frontend and admin panel
2. **Review migrated files** for any edge cases
3. **Update any remaining hardcoded URLs** manually
4. **Test image loading** with new configuration
5. **Commit all changes** to version control

## Benefits

### 🚫 No More Hardcoded URLs
- All URLs are centralized and configurable
- Easy to switch between environments
- No more localhost references in production code

### 🛡️ Better Error Handling
- Automatic authentication token management
- Consistent error logging
- Proper HTTP status code handling

### 🔧 Easier Maintenance
- Single source of truth for API configuration
- TypeScript support for better development experience
- Consistent patterns across the application

### 🚀 Better Performance
- Automatic request/response logging in development
- Proper timeout configuration
- Optimized for production use

## Troubleshooting

### Common Issues

1. **Import Errors**
   ```typescript
   // Make sure you're importing from the correct path
   import { api } from '@/lib/api';  // ✅ Correct
   import { api } from './lib/api';  // ❌ Wrong path
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check your .env.local file
   cat .env.local
   
   # Restart your development server
   npm run dev
   ```

3. **API Calls Failing**
   ```typescript
   // Check the network tab in browser dev tools
   // Look for the actual URL being called
   console.log('API URL:', API_URL);
   ```

### Debug Mode

The API wrapper includes debug logging in development:

```typescript
// Check browser console for:
// 🚀 API Request: GET /menu
// ✅ API Response: 200 /menu
// 🚨 API Response Error: 404 /invalid-endpoint
```

## Examples by Use Case

### Menu Management
```typescript
import { apiHelpers } from '@/lib/api';

// Get all menu items
const menuItems = await apiHelpers.get('/menu');

// Create new menu item
const newItem = await apiHelpers.post('/menu', {
  name: 'New Dish',
  description: 'Delicious new dish',
  price: 15.99,
  category: 'entrees'
});

// Update menu item
const updatedItem = await apiHelpers.put('/menu/123', {
  name: 'Updated Dish Name'
});
```

### Image Uploads
```typescript
import { apiHelpers, UPLOADS_URL } from '@/lib/api';

// Upload image
const formData = new FormData();
formData.append('image', file);

const uploadResult = await apiHelpers.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Use uploaded image
const imageUrl = `${UPLOADS_URL}${uploadResult.imagePath}`;
```

### Authentication
```typescript
import { apiHelpers } from '@/lib/api';

// Login
const loginResult = await apiHelpers.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Store token (handled automatically by the wrapper)
localStorage.setItem('auth-token', loginResult.token);

// Authenticated requests (token added automatically)
const userData = await apiHelpers.get('/auth/me');
```

This API wrapper system provides a robust, maintainable foundation for all API communications in the Kocky's website! 🎉
