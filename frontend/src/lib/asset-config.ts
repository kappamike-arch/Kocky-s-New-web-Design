// Asset configuration for static files (images, videos, etc.)
// This centralizes all asset URL construction to avoid hardcoded IPs
// @deprecated Use src/lib/config.ts instead

import { 
  PUBLIC_BASE_URL, 
  API_BASE_URL, 
  API_URL, 
  UPLOADS_URL,
  getAssetUrl as getAssetUrlFromConfig,
  getApiUrl as getApiUrlFromConfig
} from './config';

// Re-export for backward compatibility
export const ASSET_BASE_URL = PUBLIC_BASE_URL;
export const ASSET_URL = UPLOADS_URL;
export { ASSET_BASE_URL as ASSET_BASE };

// Helper function to construct asset URLs
export const getAssetUrl = (path: string): string => {
  // If path already starts with http, return as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If path starts with /uploads, use our asset URL
  if (path.startsWith('/uploads')) {
    return `${PUBLIC_BASE_URL}${path}`;
  }
  
  // If path starts with /, assume it's a static file in public directory
  if (path.startsWith('/')) {
    return path;
  }
  
  // Otherwise, prepend /uploads/
  return `${UPLOADS_URL}/${path}`;
};

// Helper function to construct API URLs (for consistency)
export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Debug logging
console.log('🎨 Asset Configuration (Legacy):');
console.log('  Using centralized config from src/lib/config.ts');
console.log('  Asset Base URL:', ASSET_BASE_URL);
console.log('  Full Asset URL:', ASSET_URL);
