// Server-side data fetching functions for Next.js (JavaScript version)
const INTERNAL_API_URL = 'http://127.0.0.1:5001/api';

export async function getServerSettings() {
  try {
    const response = await fetch(`${INTERNAL_API_URL}/settings/public`, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      console.error('SSR fetch failed', response.status);
      throw new Error(`SSR fetch failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    return data.settings;
  } catch (error) {
    console.error('Error fetching server settings:', error);
    throw error; // Re-throw to prevent fallback to hardcoded data
  }
}

export async function getServerHeroSettings(pageId) {
  try {
    const response = await fetch(`${INTERNAL_API_URL}/hero-settings/${pageId}`, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      console.error('SSR hero settings fetch failed', response.status);
      throw new Error(`SSR hero settings fetch failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('Hero settings API returned unsuccessful response');
    }
    
    return data.settings;
  } catch (error) {
    console.error('Error fetching server hero settings:', error);
    throw error; // Re-throw to prevent fallback to hardcoded data
  }
}

