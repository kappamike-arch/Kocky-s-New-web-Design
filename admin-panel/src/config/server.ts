// Server configuration for admin panel
// This file centralizes all server URLs for easy maintenance

// Backend API server (handles all data and file uploads)
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://72.167.227.205:5001';
export const BACKEND_API_URL = `${BACKEND_URL}/api`;

// Frontend server (for preview links)
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://72.167.227.205:3003';

// Admin panel server
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://72.167.227.205:4000';

// Helper function to get image URL with backend server
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a data URL (base64), return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Otherwise, prepend backend URL
  return `${BACKEND_URL}${path}`;
}

// Helper function to clean HTML entities
export function cleanHtmlEntities(str: string): string {
  return str
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
