// Server-side data fetching functions for Next.js
import { INTERNAL_API_URL } from './config';

export async function getServerSettings() {
  try {
    console.log('🔍 getServerSettings: Starting fetch...');
    console.log('🔍 getServerSettings: INTERNAL_API_URL:', INTERNAL_API_URL);
    console.log('🔍 getServerSettings: Fetch URL:', `${INTERNAL_API_URL}/settings`);
    
    const response = await fetch(`${INTERNAL_API_URL}/settings`, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('🔍 getServerSettings: Response status:', response.status);
    console.log('🔍 getServerSettings: Response ok:', response.ok);

    if (!response.ok) {
      console.error('🔍 getServerSettings: SSR fetch failed', response.status);
      throw new Error(`SSR fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 getServerSettings: Data received:', data);
    console.log('🔍 getServerSettings: Data type:', typeof data);
    console.log('🔍 getServerSettings: Data keys:', Object.keys(data));
    
    return data;
  } catch (error) {
    console.error('🔍 getServerSettings: Error fetching server settings:', error);
    console.error('🔍 getServerSettings: Error message:', error.message);
    console.error('🔍 getServerSettings: Error stack:', error.stack);
    throw error; // Re-throw to prevent fallback to hardcoded data
  }
}

export async function getServerHeroSettings(pageId: string) {
  try {
    const response = await fetch(`${INTERNAL_API_URL}/hero-settings/${pageId}`, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('SSR hero settings fetch failed', response.status);
      throw new Error(`SSR hero settings fetch failed: ${response.status}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching server hero settings:', error);
    throw error; // Re-throw to prevent fallback to hardcoded data
  }
}
