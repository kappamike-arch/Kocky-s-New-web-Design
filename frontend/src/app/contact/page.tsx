import ContactPageClient from './page-client';
import { getServerSettings } from '@/lib/server-data';

// Use the same approach as Footer - get settings from layout
export default async function ContactPage() {
  const settings = await getServerSettings();
  return <ContactPageClient settings={settings} />;
}