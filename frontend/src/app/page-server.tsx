// Server component that fetches data and passes it to client component
import { getServerSettings, getServerHeroSettings } from '@/lib/server-data';
import HomePageClient from './page-client';

export default async function HomePage() {
  // Fetch data on the server
  const [settings, heroSettings] = await Promise.all([
    getServerSettings(),
    getServerHeroSettings('home')
  ]);

  // Pass data to client component
  return <HomePageClient settings={settings} heroSettings={heroSettings} />;
}

