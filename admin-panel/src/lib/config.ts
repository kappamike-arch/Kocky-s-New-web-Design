/**
 * Centralized Configuration for Admin Panel
 * Handles environment-specific URLs and settings
 */

// Base URL for the public website
export const PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'https://staging.kockys.com';

// API Base URL - use staging domain for admin panel
export const API_BASE_URL = 'https://staging.kockys.com';

// API prefix
export const API_PREFIX = '/api';

// Full API URL
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Media/Uploads base URL - use backend server for file serving
export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://staging.kockys.com:5001';

// Uploads prefix
export const UPLOADS_PREFIX = '/uploads';

// Full uploads URL
export const UPLOADS_URL = `${MEDIA_BASE_URL}${UPLOADS_PREFIX}`;

// Admin panel URL
export const ADMIN_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL || `${PUBLIC_BASE_URL}/admin`;

// Prisma Studio URL
export const PRISMA_STUDIO_URL =
  process.env.NEXT_PUBLIC_PRISMA_STUDIO_URL || `${PUBLIC_BASE_URL}/prisma`;

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_STAGING = process.env.NEXT_PUBLIC_ENV === 'staging' || 
  PUBLIC_BASE_URL.includes('staging.kockys.com');
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Debug logging
if (IS_DEVELOPMENT) {
  console.log('🔧 Admin Panel Configuration:');
  console.log('  Environment:', process.env.NODE_ENV);
  console.log('  Public Base URL:', PUBLIC_BASE_URL);
  console.log('  API Base URL:', API_BASE_URL);
  console.log('  Full API URL:', API_URL);
  console.log('  Media Base URL:', MEDIA_BASE_URL);
  console.log('  Uploads URL:', UPLOADS_URL);
  console.log('  Admin Base URL:', ADMIN_BASE_URL);
  console.log('  Prisma Studio URL:', PRISMA_STUDIO_URL);
}



