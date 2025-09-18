'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, MapPin, Phone, ExternalLink, Loader2 } from 'lucide-react';
import { HeroSection } from '@/components/sections/HeroSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderOnlinePage() {
  const [orderingUrl, setOrderingUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  // Fetch the online ordering URL from settings
  useEffect(() => {
    const fetchOrderingUrl = async () => {
      try {
        const response = await fetch('https://staging.kockys.com/api/settings');
        const data = await response.json();
        
        // Use the online ordering URL from settings or fallback
        const url = data.onlineOrderingUrl || 
                   process.env.NEXT_PUBLIC_ORDERING_URL || 
                   'https://ordering.chownow.com/order/29755/locations/43697'; // Example ChowNow URL
        
        setOrderingUrl(url);
      } catch (error) {
        console.error('Error fetching ordering URL:', error);
        // Use fallback URL
        setOrderingUrl('https://ordering.chownow.com/order/29755/locations/43697');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderingUrl();
  }, []);

  const handleIframeLoad = () => {
    setLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setLoading(false);
  };

  const openInNewTab = () => {
    if (orderingUrl) {
      window.open(orderingUrl, '_blank');
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroSection
        page="order"
        title="Order Online"
        subtitle="Quick & Easy"
        description="Skip the wait, order ahead for pickup or delivery"
      />

      {/* Order Information Bar */}
      <section className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Ready in 20-30 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>123 Main Street, City, State</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="h-4 w-4 text-orange-500" />
              <span>(555) 123-4567</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Full Site
            </Button>
          </div>
        </div>
      </section>

      {/* Embedded Ordering Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Instructions Card */}
          <Card className="mb-6 bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">How to Order</h2>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>Browse our menu and add items to your cart</li>
                    <li>Choose pickup or delivery</li>
                    <li>Enter your contact information</li>
                    <li>Complete payment securely</li>
                    <li>Receive confirmation and pickup/delivery time</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iframe Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-lg overflow-hidden shadow-2xl"
            style={{ minHeight: '800px' }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-400">Loading online ordering...</p>
                </div>
              </div>
            )}

            {iframeError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center p-8">
                  <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Online Ordering Unavailable in Preview
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    For security reasons, some ordering platforms don't allow embedding. 
                    Click the button below to open the ordering page in a new tab.
                  </p>
                  <Button
                    onClick={openInNewTab}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Open Online Ordering
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                src={orderingUrl}
                title="Online Ordering"
                className="w-full"
                style={{ 
                  height: '900px',
                  border: 'none',
                  display: loading ? 'none' : 'block'
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allow="payment"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
              />
            )}
          </motion.div>

          {/* Alternative Options */}
          <Card className="mt-6 bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Other Ways to Order</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <Phone className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Call Us</h4>
                  <p className="text-sm text-gray-400">(555) 123-4567</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Walk In</h4>
                  <p className="text-sm text-gray-400">123 Main Street</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Third Party</h4>
                  <p className="text-sm text-gray-400">DoorDash, Uber Eats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
