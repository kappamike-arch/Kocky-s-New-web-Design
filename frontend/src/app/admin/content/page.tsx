'use client';

import ContentManagement from '@/components/admin/ContentManagement';

export default function ContentPage() {
  const handleSave = (data: any) => {
    console.log('Content saved:', data);
    // Here you would typically make an API call to save the content
  };

  return (
    <div className="min-h-screen">
      <ContentManagement onSave={handleSave} />
    </div>
  );
}
