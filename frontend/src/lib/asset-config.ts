// Asset configuration for static files (images, videos, etc.)
// This centralizes all asset URL construction to avoid hardcoded IPs

// Determine environment
const isDevelopment = process.env.NODE_ENV === "development";
const isStaging = process.env.NEXT_PUBLIC_ENV === "staging" || process.env.NODE_ENV === "production";

// Asset Base URL configuration
const ASSET_BASE_URL = isStaging
  ? "http://staging.kockys.com"       // Staging (HTTP - server doesn't support HTTPS)
  : "https://kockys.com";             // Production (HTTPS)

// Full asset URL with /uploads path
export const ASSET_URL = `${ASSET_BASE_URL}/uploads`;

// Export base URL for other uses
export { ASSET_BASE_URL as ASSET_BASE };

// Helper function to construct asset URLs
export const getAssetUrl = (path: string): string => {
  // If path already starts with http, return as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // If path starts with /uploads, use our asset URL
  if (path.startsWith('/uploads')) {
    return `${ASSET_BASE_URL}${path}`;
  }
  
  // If path starts with /, assume it's a static file in public directory
  if (path.startsWith('/')) {
    return path;
  }
  
  // Otherwise, prepend /uploads/
  return `${ASSET_URL}/${path}`;
};

// Helper function to construct API URLs (for consistency)
export const getApiUrl = (endpoint: string): string => {
  const API_BASE_URL = isStaging
    ? "http://staging.kockys.com"       // Staging (HTTP - server doesn't support HTTPS)
    : "https://kockys.com";             // Production (HTTPS)
  
  return `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Debug logging
console.log('🎨 Asset Configuration:');
console.log('  Environment:', isDevelopment ? 'development' : isStaging ? 'staging' : 'production');
console.log('  Asset Base URL:', ASSET_BASE_URL);
console.log('  Full Asset URL:', ASSET_URL);
