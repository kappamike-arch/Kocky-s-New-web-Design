'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Star, CheckCircle, Calendar, Phone, Mail, Users, Truck, ChefHat, Clock, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EditableHeroSection } from '@/components/sections/HeroSection';
import Link from 'next/link';
import { contactAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CateringPage() {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroData, setHeroData] = useState({
    title: null as string | null,
    subtitle: 'Professional Catering Services',
    description: 'Delicious food delivered and served at your location',
    backgroundImage: '',
    backgroundVideo: undefined as string | undefined,
  });

  // Form state
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    eventDate: '',
    eventTime: '',
    eventDuration: 4,
    eventLocation: '',
    eventType: '',
    expectedGuests: 50,
    budget: '',
    menuSelection: '',
    serviceStyle: '',
    dietaryRestrictions: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cateringMenus = [
    {
      id: 'corporate',
      name: 'Corporate Catering',
      description: 'Professional catering for meetings, conferences, and corporate events',
      minOrder: 'Minimum 20 people',
      priceRange: '$15-25 per person',
      image: '/images/corporate-catering.jpg',
      items: [
        'Breakfast platters',
        'Sandwich & wrap platters',
        'Hot lunch buffets',
        'Snack stations',
        'Beverage service',
        'Dessert selections'
      ]
    },
    {
      id: 'social',
      name: 'Social Events',
      description: 'Perfect for parties, celebrations, and special occasions',
      minOrder: 'Minimum 30 people',
      priceRange: '$20-35 per person',
      image: '/images/social-catering.jpg',
      items: [
        'Appetizer stations',
        'BBQ & grill packages',
        'Buffet dinners',
        'Cocktail receptions',
        'Themed menus',
        'Full bar service'
      ]
    },
    {
      id: 'wedding',
      name: 'Wedding Catering',
      description: 'Elegant dining experiences for your special day',
      minOrder: 'Minimum 50 people',
      priceRange: '$35-65 per person',
      image: '/images/wedding-catering.jpg',
      items: [
        'Plated dinners',
        'Buffet service',
        'Cocktail hour',
        'Champagne service',
        'Wedding cake',
        'Late night snacks'
      ]
    },
  ];

  const features = [
    {
      icon: ChefHat,
      title: 'Professional Chefs',
      description: 'Award-winning culinary team with decades of experience'
    },
    {
      icon: Truck,
      title: 'Full Service Delivery',
      description: 'Setup, service, and cleanup included'
    },
    {
      icon: Users,
      title: 'Flexible Capacity',
      description: 'Events from 20 to 500+ guests'
    },
    {
      icon: Clock,
      title: 'Timely Service',
      description: 'Always on time, every time'
    },
  ];

  const serviceStyles = [
    'Buffet Service',
    'Plated Dinner',
    'Family Style',
    'Cocktail Reception',
    'Food Stations',
    'Box Lunches',
    'Drop-off Only',
    'Full Service with Staff'
  ];

  const eventTypes = [
    'Corporate Meeting',
    'Conference',
    'Wedding',
    'Birthday Party',
    'Anniversary',
    'Graduation',
    'Holiday Party',
    'Fundraiser',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactName || !formData.contactEmail || !formData.contactPhone || 
        !formData.eventDate || !formData.eventLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Submit to CRM system
      const response = await contactAPI.submit({
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        subject: `Catering Service - ${formData.eventType || 'Event'}`,
        message: `Company: ${formData.companyName}
Event Date: ${formData.eventDate}
Event Time: ${formData.eventTime || 'TBD'}
Duration: ${formData.eventDuration} hours
Location: ${formData.eventLocation}
Event Type: ${formData.eventType}
Expected Guests: ${formData.expectedGuests}
Budget: ${formData.budget}
Menu Selection: ${formData.menuSelection}
Service Style: ${formData.serviceStyle}
Dietary Restrictions: ${formData.dietaryRestrictions}
Additional Notes: ${formData.additionalNotes}`,
        serviceType: 'CATERING',
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        guestCount: formData.expectedGuests,
        companyName: formData.companyName
      });

      setSubmitted(true);
      toast.success('Your catering inquiry has been submitted successfully!');
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          companyName: '',
          eventDate: '',
          eventTime: '',
          eventDuration: 4,
          eventLocation: '',
          eventType: '',
          expectedGuests: 50,
          budget: '',
          menuSelection: '',
          serviceStyle: '',
          dietaryRestrictions: '',
          additionalNotes: '',
        });
      }, 5000);
    } catch (error: any) {
      console.error('Catering inquiry submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit inquiry. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSelect = (menuId: string) => {
    setSelectedMenu(menuId);
    setFormData({ ...formData, menuSelection: menuId });
    // Scroll to form
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <EditableHeroSection
        title={heroData.title || 'Catering Services'}
        subtitle={heroData.subtitle}
        description={heroData.description}
        ctaPrimary={{ text: 'View Menus', href: '#menus' }}
        ctaSecondary={{ text: 'Get Quote', href: '#booking-form' }}
        backgroundImage={heroData.backgroundImage}
        backgroundVideo={heroData.backgroundVideo}
        serviceType="CATERING"
        isAdmin={isAdmin}
        onUpdate={(data) => setHeroData(data)}
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Catering?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Professional service that brings exceptional dining to your event
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-orange-600 dark:text-orange-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Options */}
      <section id="menus" className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Catering Menu Options</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose from our carefully crafted menu packages
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {cateringMenus.map((menu, index) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-2xl">{menu.name}</CardTitle>
                    <CardDescription>{menu.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{menu.minOrder}</Badge>
                      <span className="font-bold text-lg">{menu.priceRange}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Menu Includes:</h4>
                      <ul className="space-y-1">
                        {menu.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleMenuSelect(menu.id)}
                    >
                      Select This Menu
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking-form" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Request Catering Service</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll create a custom quote for your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your catering inquiry has been submitted. We'll contact you within 24 hours with a custom quote.
                    </p>
                  </motion.div>
                ) : (
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
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyName">Company/Organization</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          disabled={loading}
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
                          disabled={loading}
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
                          disabled={loading}
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
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventTime">Event Time</Label>
                        <Input
                          id="eventTime"
                          type="time"
                          value={formData.eventTime}
                          onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventDuration">Duration (hours)</Label>
                        <Input
                          id="eventDuration"
                          type="number"
                          min="1"
                          max="12"
                          value={formData.eventDuration}
                          onChange={(e) => setFormData({ ...formData, eventDuration: parseInt(e.target.value) })}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventLocation">Event Location *</Label>
                        <Input
                          id="eventLocation"
                          value={formData.eventLocation}
                          onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                          placeholder="Full address"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventType">Event Type</Label>
                        <select
                          id="eventType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.eventType}
                          onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                          disabled={loading}
                        >
                          <option value="">Select event type</option>
                          {eventTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="expectedGuests">Expected Guests</Label>
                        <Input
                          id="expectedGuests"
                          type="number"
                          min="20"
                          value={formData.expectedGuests}
                          onChange={(e) => setFormData({ ...formData, expectedGuests: parseInt(e.target.value) })}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget Range</Label>
                        <Input
                          id="budget"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="e.g., $2000-3000"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceStyle">Service Style</Label>
                        <select
                          id="serviceStyle"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.serviceStyle}
                          onChange={(e) => setFormData({ ...formData, serviceStyle: e.target.value })}
                          disabled={loading}
                        >
                          <option value="">Select service style</option>
                          {serviceStyles.map((style) => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <Label htmlFor="menuSelection">Menu Package Interest</Label>
                      <select
                        id="menuSelection"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.menuSelection}
                        onChange={(e) => setFormData({ ...formData, menuSelection: e.target.value })}
                        disabled={loading}
                      >
                        <option value="">Select a menu package</option>
                        {cateringMenus.map((menu) => (
                          <option key={menu.id} value={menu.id}>{menu.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="dietaryRestrictions">Dietary Restrictions/Allergies</Label>
                      <Textarea
                        id="dietaryRestrictions"
                        value={formData.dietaryRestrictions}
                        onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                        placeholder="Please list any dietary restrictions or food allergies..."
                        rows={3}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        placeholder="Any special requests or additional information..."
                        rows={4}
                        disabled={loading}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Catering Inquiry'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-red-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Plan Your Event?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Let us take care of the food while you enjoy your special occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              asChild
            >
              <a href="tel:555-0123">
                <Phone className="mr-2" />
                Call Now
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Mail className="mr-2" />
              Request Quote
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-100">
            Serving the local area • Licensed & Insured • 48-hour notice required
          </p>
        </motion.div>
      </section>
    </div>
  );
}