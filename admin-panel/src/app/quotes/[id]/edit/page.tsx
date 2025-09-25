'use client';

import { EnhancedQuoteComposer } from '@/components/quotes/EnhancedQuoteComposer';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuoteEditPage({ params }: PageProps) {
  const [quoteId, setQuoteId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setQuoteId(id));
  }, [params]);

  if (!quoteId) {
    return <div>Loading...</div>;
  }
  
  return (
    <EnhancedQuoteComposer
      mode="edit"
      quoteId={quoteId}
    />
  );
}
