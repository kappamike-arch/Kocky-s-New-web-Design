// Server component that fetches data and passes it to client component
import { getServerSettings, getServerHeroSettings } from '@/lib/server-data';
import HomePageClient from './page-client';

export default async function HomePage() {
  console.log('HomePage: Starting server-side fetch...');
  
  // Fetch data on the server with error handling
  let settings = null;
  let heroSettings = null;
  
  try {
    console.log('HomePage: Calling getServerSettings...');
    settings = await getServerSettings();
    console.log('HomePage: getServerSettings result:', settings?.contactPhone, settings?.address);
    
    console.log('HomePage: Calling getServerHeroSettings...');
    heroSettings = await getServerHeroSettings('home');
    console.log('HomePage: getServerHeroSettings result:', heroSettings);
  } catch (error) {
    console.error('HomePage: Server-side fetch failed:', error);
    // Continue with null values - components will use fallbacks
  }

  console.log('HomePage: Final settings:', settings?.contactPhone, settings?.address);
  // Pass data to client component
  return <HomePageClient settings={settings} heroSettings={heroSettings} />;
}