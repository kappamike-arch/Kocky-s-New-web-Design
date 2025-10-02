// Hero Logo Fix - Hardcoded fallback system with reliable paths
import path from 'path';
import fs from 'fs';

// Hardcoded logo paths for each page - fallback when uploads fail
export const HARDCODED_LOGOS: Record<string, string> = {
  'home': '/kockys-logo.png',
  'menu': '/kockys-logo.png',
  'happy-hour': '/kockys-logo.png',
  'brunch': '/kockys-logo.png',
  'mobile-bar': '/kockys-logo.png',
  'catering': '/kockys-logo.png',
  'reservations': '/kockys-logo.png',
  'about': '/kockys-logo.png',
  'gallery': '/kockys-logo.png',
  'food-truck': '/kockys-logo.png',
  'mobile': '/kockys-logo.png'
};

// Fix logo URL to ensure it's properly formatted
export function fixLogoUrl(logoUrl: string | null | undefined, pageId: string): string {
  // If no logo URL, use hardcoded fallback
  if (!logoUrl) {
    return HARDCODED_LOGOS[pageId] || '/kockys-logo.png';
  }
  
  // Fix HTML entities in URL
  let fixedUrl = logoUrl
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  // If it's an uploaded logo, ensure correct path
  if (fixedUrl.includes('/uploads/logos/')) {
    // Extract just the filename
    const filename = path.basename(fixedUrl);
    
    // Check multiple possible locations for the logo file
    const possiblePaths = [
      path.join(__dirname, '../uploads/logos', filename),  // backend/uploads/logos
      path.join(__dirname, '../../uploads/logos', filename), // uploads/logos from backend/dist
      path.join(__dirname, '../../../uploads/logos', filename), // root uploads/logos
    ];
    
    for (const checkPath of possiblePaths) {
      if (fs.existsSync(checkPath)) {
        // File found, return the URL
        return `/uploads/logos/${filename}`;
      }
    }
    
    // If file doesn't exist anywhere, log warning but still return the URL
    // The file might exist but not be accessible from Node.js
    console.warn(`Logo file may not be accessible from Node.js: ${fixedUrl}`);
    // Return the URL anyway - the browser might be able to access it
    return fixedUrl;
  }
  
  // For other URLs, return as-is
  return fixedUrl;
}

// Copy logos from backend/uploads to root uploads for consistency
export function syncLogoDirectories() {
  const backendLogosDir = path.join(__dirname, '../../uploads/logos');
  const rootUploadsDir = path.join(__dirname, '../../../uploads');
  const rootLogosDir = path.join(rootUploadsDir, 'logos');
  
  // Ensure directories exist
  if (!fs.existsSync(rootUploadsDir)) {
    fs.mkdirSync(rootUploadsDir, { recursive: true });
  }
  if (!fs.existsSync(rootLogosDir)) {
    fs.mkdirSync(rootLogosDir, { recursive: true });
  }
  
  // Copy files from backend/uploads/logos to root uploads/logos
  if (fs.existsSync(backendLogosDir)) {
    const files = fs.readdirSync(backendLogosDir);
    files.forEach(file => {
      const srcPath = path.join(backendLogosDir, file);
      const destPath = path.join(rootLogosDir, file);
      
      // Only copy if destination doesn't exist or is older
      if (!fs.existsSync(destPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Synced logo: ${file}`);
        } catch (error) {
          console.error(`Failed to sync logo ${file}:`, error);
        }
      }
    });
  }
}

// Get logo with fallback
export function getLogoWithFallback(pageId: string, uploadedLogoUrl?: string | null): string {
  if (uploadedLogoUrl) {
    const fixedUrl = fixLogoUrl(uploadedLogoUrl, pageId);
    // If the fixed URL is different from the original, we're using a fallback
    if (fixedUrl !== uploadedLogoUrl) {
      console.log(`Using fallback logo for ${pageId}`);
    }
    return fixedUrl;
  }
  
  // Use hardcoded logo for the specific page
  return HARDCODED_LOGOS[pageId] || '/kockys-logo.png';
}
