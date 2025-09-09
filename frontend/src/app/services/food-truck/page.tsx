'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, Calendar, MapPin, Users, DollarSign, Clock, 
  CheckCircle, Star, Phone, Mail 
} from 'lucide-react';
import { formsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { unifiedFormsAPI } from '@/lib/api/unified-forms';
import { HeroSection } from '@/components/sections/HeroSection';
import { getHeroSettingsAsync, clearHeroSettingsCache } from '@/lib/hero-settings';

export default function FoodTruckPage() {
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    eventDate: '',
    eventTime: '',
    eventDuration: 2,
    eventLocation: '',
    eventType: '',
    expectedGuests: 50,
    budget: '',
    menuPreferences: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Hero settings state
  const [heroData, setHeroData] = useState({
    title: 'Food Truck Service',
    subtitle: 'Bringing Kockys experience to your event',
    description: 'Professional catering on wheels for your special events',
    backgroundImage: '',
    backgroundVideo: undefined as string | undefined,
    mediaPreference: 'auto' as string,
    useLogo: false,
    logoUrl: null as string | null
  });
  const [heroLoaded, setHeroLoaded] = useState(false);
  
  // Load hero settings from API
  useEffect(() => {
    const loadSettings = async (bypassCache: boolean = false) => {
      if (bypassCache) {
        clearHeroSettingsCache();
      }
      const settings = await getHeroSettingsAsync('food-truck', bypassCache);
      if (settings) {
        console.log('[FOOD-TRUCK] Loaded hero settings from API:', settings);
        console.log('[FOOD-TRUCK] Media preference:', settings.mediaPreference || 'auto');
        console.log('[FOOD-TRUCK] Background image:', settings.backgroundImage);
        console.log('[FOOD-TRUCK] Background video:', settings.backgroundVideo);
        
        setHeroData({
          title: settings.useLogo ? '' : settings.title,
          subtitle: settings.subtitle, // Use actual subtitle from database
          description: settings.description, // Use actual description from database
          backgroundImage: settings.backgroundImage || '',
          backgroundVideo: settings.backgroundVideo,
          mediaPreference: settings.mediaPreference || 'auto',
          useLogo: settings.useLogo,
          logoUrl: settings.logoUrl
        });
        setHeroLoaded(true);
      }
    };
    
    // Delay initial load slightly to avoid hydration mismatch
    const timer = setTimeout(() => {
      loadSettings(true);
    }, 100);
    
    // Reload when window gains focus
    const handleFocus = () => {
      loadSettings(true);
    };
    
    // Reload periodically to catch changes
    const interval = setInterval(() => loadSettings(false), 5000);
    
    window.addEventListener('focus', handleFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const eventTypes = [
    'Corporate Event',
    'Wedding',
    'Birthday Party',
    'Festival',
    'Community Event',
    'Private Party',
    'School Event',
    'Other',
  ];

  const features = [
    { icon: Truck, title: 'Fully Equipped Kitchen', description: 'Professional grade cooking equipment on wheels' },
    { icon: Users, title: 'Experienced Staff', description: 'Professional chefs and service team' },
    { icon: Clock, title: 'Flexible Hours', description: 'Available for lunch, dinner, or late night' },
    { icon: Star, title: 'Custom Menu', description: 'Tailored to your event needs' },
  ];

  const packages = [
    {
      name: 'Basic Package',
      price: 'Starting at $500',
      guests: 'Up to 50 guests',
      features: ['2 hour service', 'Limited menu', 'Basic setup', 'Paper products included'],
    },
    {
      name: 'Standard Package',
      price: 'Starting at $1,000',
      guests: '50-100 guests',
      features: ['3 hour service', 'Full menu', 'Professional setup', 'Premium disposables', 'Beverage service'],
      popular: true,
    },
    {
      name: 'Premium Package',
      price: 'Starting at $2,000',
      guests: '100+ guests',
      features: ['4+ hour service', 'Custom menu', 'Full service team', 'Premium setup', 'Dessert included'],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use unified forms API for better CRM integration
      const response = await unifiedFormsAPI.submit({
        formType: 'food-truck',
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        companyName: formData.companyName,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventLocation: formData.eventLocation,
        eventType: formData.eventType,
        eventDuration: formData.eventDuration,
        guestCount: formData.expectedGuests,
        budget: formData.budget,
        menuPreferences: formData.menuPreferences,
        message: formData.additionalNotes
      });
      
      if (response.success) {
        setSubmitted(true);
        toast.success(response.message || 'Food truck booking request submitted!');
        
        if (response.confirmationCode) {
          toast.success(`Confirmation code: ${response.confirmationCode}`, { duration: 6000 });
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
      console.error('Food truck booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-3xl">Request Received!</CardTitle>
                <CardDescription className="text-lg mt-2">
                  We'll contact you within 24 hours with a custom quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">
                  Our team will review your request and prepare a customized proposal for your event.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Return to Homepage
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection
        title={heroData.title}
        subtitle={heroData.subtitle}
        description={heroData.description}
        backgroundImage={heroData.backgroundImage}
        backgroundVideo={heroData.backgroundVideo}
        mediaPreference={heroData.mediaPreference}
        showLogo={heroData.useLogo}
        logoUrl={heroData.logoUrl || undefined}
        height="medium"
        overlayOpacity={0.4}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Food Truck?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 mx-auto h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Service Packages</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full ${pkg.popular ? 'border-orange-500 shadow-lg' : ''}`}>
                  {pkg.popular && (
                    <div className="bg-orange-500 text-white text-center py-2 text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <div className="text-3xl font-bold text-orange-600">{pkg.price}</div>
                    <CardDescription>{pkg.guests}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Request Food Truck Service</CardTitle>
              <CardDescription>
                Fill out the form below and we'll create a custom quote for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company/Organization</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      required
                    />
                  </div>

                  {/* Event Details */}
                  <div>
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Start Time *</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventDuration">Duration (hours) *</Label>
                    <select
                      id="eventDuration"
                      value={formData.eventDuration}
                      onChange={(e) => setFormData({ ...formData, eventDuration: parseInt(e.target.value) })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                        <option key={hour} value={hour}>{hour} hours</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type *</Label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="expectedGuests">Expected Guests *</Label>
                    <Input
                      id="expectedGuests"
                      type="number"
                      value={formData.expectedGuests}
                      onChange={(e) => setFormData({ ...formData, expectedGuests: parseInt(e.target.value) })}
                      min="10"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      placeholder="$1000 - $2000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="eventLocation">Event Location *</Label>
                  <Input
                    id="eventLocation"
                    placeholder="Full address of the event"
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="menuPreferences">Menu Preferences</Label>
                  <textarea
                    id="menuPreferences"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background min-h-[100px]"
                    placeholder="Any specific menu items or dietary requirements?"
                    value={formData.menuPreferences}
                    onChange={(e) => setFormData({ ...formData, menuPreferences: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <textarea
                    id="additionalNotes"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background min-h-[100px]"
                    placeholder="Any other information we should know?"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
