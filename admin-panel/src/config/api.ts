/**
 * Centralized API Configuration
 * Handles environment-specific API base URLs
 */

// Determine environment
const isDevelopment = process.env.NODE_ENV === "development";
const isStaging = process.env.NEXT_PUBLIC_ENV === "staging" || process.env.NODE_ENV === "production";

// API Base URL configuration
const API_BASE_URL = isStaging
  ? "https://staging.kockys.com"
  : "https://api.kockys.com";

// Full API URL with /api path
export const API_URL = `${API_BASE_URL}/api`;

// Export base URL for other uses
export const API_BASE = API_BASE_URL;

// Debug logging
console.log('🔧 API Configuration:');
console.log('  Environment:', process.env.NODE_ENV);
console.log('  Custom ENV:', process.env.NEXT_PUBLIC_ENV);
console.log('  API Base URL:', API_BASE_URL);
console.log('  Full API URL:', API_URL);

export default API_URL;
