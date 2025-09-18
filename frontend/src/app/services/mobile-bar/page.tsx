'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wine, Calendar, MapPin, Users, DollarSign, Clock, 
  CheckCircle, Star, Phone, Mail, Sparkles 
} from 'lucide-react';
import { contactAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MobileBarPage() {
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    eventDate: '',
    eventTime: '',
    eventDuration: 3,
    eventLocation: '',
    eventType: '',
    expectedGuests: 50,
    budget: '',
    barPackage: '',
    drinkPreferences: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Private Party',
    'Festival',
    'Fundraiser',
    'Holiday Party',
    'Other',
  ];

  const features = [
    { icon: Users, title: 'Professional Bartenders', description: 'Licensed and insured bartenders' },
    { icon: Sparkles, title: 'Custom Cocktails', description: 'Signature drinks for your event' },
    { icon: Clock, title: 'Flexible Service', description: 'Available for any duration' },
    { icon: Star, title: 'Premium Setup', description: 'Elegant bar with lighting' },
  ];

  const packages = [
    {
      id: 'basic',
      name: 'Essential Bar',
      price: 'Starting at $500',
      duration: 'Up to 3 hours',
      guests: 'Up to 50 guests',
      features: [
        'Professional bartender',
        'Basic bar setup',
        'Beer & Wine selection',
        'Soft drinks & mixers',
        'Ice & garnishes',
        'Disposable barware'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Experience',
      price: 'Starting at $800',
      duration: 'Up to 4 hours',
      guests: 'Up to 100 guests',
      popular: true,
      features: [
        'Two professional bartenders',
        'Premium bar setup with lighting',
        'Full cocktail menu',
        'Premium spirits selection',
        'Wine & champagne service',
        'Glassware included',
        'Custom cocktail creation',
        'Bar snacks & garnishes'
      ]
    },
    {
      id: 'luxury',
      name: 'Luxury Collection',
      price: 'Starting at $1,500',
      duration: 'Up to 6 hours',
      guests: 'Up to 200 guests',
      features: [
        'Full bartending team',
        'Luxury mobile bar setup',
        'Top-shelf spirits only',
        'Champagne service',
        'Signature cocktail menu',
        'Premium glassware',
        'LED bar lighting',
        'Dedicated event coordinator',
        'Complimentary tasting session'
      ]
    }
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
        subject: `Mobile Bar Service - ${formData.eventType || 'Event'}`,
        message: `Company: ${formData.companyName}\nEvent Date: ${formData.eventDate}\nEvent Time: ${formData.eventTime || 'TBD'}\nDuration: ${formData.eventDuration} hours\nLocation: ${formData.eventLocation}\nEvent Type: ${formData.eventType}\nExpected Guests: ${formData.expectedGuests}\nBudget: ${formData.budget}\nPackage Interest: ${formData.barPackage}\nDrink Preferences: ${formData.drinkPreferences}\nAdditional Notes: ${formData.additionalNotes}`,
        serviceType: 'MOBILE_BAR',
      });

      setSubmitted(true);
      toast.success('Your mobile bar inquiry has been submitted successfully!');
      
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
          eventDuration: 3,
          eventLocation: '',
          eventType: '',
          expectedGuests: 50,
          budget: '',
          barPackage: '',
          drinkPreferences: '',
          additionalNotes: '',
        });
      }, 5000);
    } catch (error: any) {
      console.error('Mobile Bar form submission error:', {
        error,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit inquiry. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Server endpoint not found. Please contact support.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid form data. Please check your inputs.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-red-600/30" />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
        >
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-600 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000" />
        </motion.div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Wine className="w-20 h-20 mx-auto mb-6 text-red-500" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Mobile Bar Service
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Bringing the party to you with professional bartending and premium drinks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Packages
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600/10 transition-all duration-300"
                asChild
              >
                <Link href="/quotes">Get Custom Quote</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Why Choose Our Mobile Bar?</h2>
            <p className="text-xl text-gray-400">
              Professional service that brings the bar experience to your event
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
                className="bg-gray-800 border border-gray-700 p-6 rounded-xl hover:border-red-600 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Mobile Bar Packages</h2>
            <p className="text-xl text-gray-400">
              Choose the perfect package for your event
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gray-900 border rounded-2xl hover:border-red-600 transition-all p-8 ${
                  pkg.popular ? 'border-2 border-red-600 bg-gradient-to-br from-gray-900 to-gray-800' : 'border-gray-800'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-red-500 mb-2">
                    {pkg.price}
                  </p>
                  <p className="text-gray-400">
                    {pkg.duration} • {pkg.guests}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  className={pkg.popular ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'}
                  variant={pkg.popular ? 'default' : 'outline'}
                  onClick={() => {
                    setFormData({ ...formData, barPackage: pkg.name });
                    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Select This Package
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        id="booking-form"
        className="bg-gray-900 py-20"
      >
        <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Request Mobile Bar Service</CardTitle>
            <CardDescription className="text-gray-400">
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
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We've received your mobile bar service request and will contact you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <Label className="text-gray-300" htmlFor="contactName" className="text-gray-300">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                      className="bg-gray-700 border-gray-600 text-white focus:border-red-600"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="companyName">Company/Organization</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="contactPhone">Phone Number *</Label>
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
                    <Label className="text-gray-300" htmlFor="eventDate">Event Date *</Label>
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
                    <Label className="text-gray-300" htmlFor="eventTime">Event Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="eventDuration">Event Duration (hours)</Label>
                    <Input
                      id="eventDuration"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.eventDuration}
                      onChange={(e) => setFormData({ ...formData, eventDuration: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="eventLocation">Event Location *</Label>
                    <Input
                      id="eventLocation"
                      value={formData.eventLocation}
                      onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                      placeholder="Venue address"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="eventType">Event Type</Label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="expectedGuests">Expected Guests</Label>
                    <Input
                      id="expectedGuests"
                      type="number"
                      min="10"
                      value={formData.expectedGuests}
                      onChange={(e) => setFormData({ ...formData, expectedGuests: parseInt(e.target.value) || 50 })}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="$1000 - $2000"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300" htmlFor="barPackage">Package Interest</Label>
                    <Input
                      id="barPackage"
                      value={formData.barPackage}
                      onChange={(e) => setFormData({ ...formData, barPackage: e.target.value })}
                      placeholder="Premium Experience"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <Label htmlFor="drinkPreferences">Drink Preferences</Label>
                  <textarea
                    id="drinkPreferences"
                    rows={3}
                    value={formData.drinkPreferences}
                    onChange={(e) => setFormData({ ...formData, drinkPreferences: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Signature cocktails, wine selection, beer preferences..."
                  />
                </div>
                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <textarea
                    id="additionalNotes"
                    rows={4}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Special requests, theme details, dietary restrictions..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Wine className="mr-2" />
                      Submit Mobile Bar Inquiry
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your Event?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Let's create an unforgettable bar experience for your guests
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => {
                document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Calendar className="mr-2" />
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              asChild
            >
              <a href="tel:+1234567890">
                <Phone className="mr-2" />
                Call Us
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-100">
            Available for weddings, corporate events, private parties, and more
          </p>
        </motion.div>
      </section>
    </div>
  );
}
