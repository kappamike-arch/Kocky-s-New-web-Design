'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formsAPI } from '@/lib/api';
import { unifiedFormsAPI } from '@/lib/api/unified-forms';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
  guestCount: string;
  location: string;
  packageType: string;
  message: string;
}

interface MobileBarFormProps {
  onSubmit?: (data: BookingFormData) => Promise<void>;
}

export function MobileBarForm({ onSubmit }: MobileBarFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    eventType: 'wedding',
    guestCount: '',
    location: '',
    packageType: 'premium',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.guestCount) newErrors.guestCount = 'Guest count is required';
    if (!formData.location.trim()) newErrors.location = 'Event location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Use unified forms API for better CRM integration
        const response = await unifiedFormsAPI.submit({
          formType: 'mobile-bar',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          eventLocation: formData.location,
          guestCount: formData.guestCount,
          eventType: formData.eventType,
          packageType: formData.packageType,
          message: formData.message
        });
        
        if (response.success) {
          setIsSuccess(true);
          toast.success(response.message || 'Booking request submitted successfully!');
          
          if (response.confirmationCode) {
            toast.success(`Confirmation code: ${response.confirmationCode}`, { duration: 6000 });
          }
          
          // Reset form after success
          setTimeout(() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              eventDate: '',
              eventTime: '',
              eventType: 'wedding',
              guestCount: '',
              location: '',
              packageType: 'premium',
              message: '',
            });
            setIsSuccess(false);
          }, 3000);
        }
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit booking. Please try again.');
      }
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof BookingFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Booking Request Received!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          We'll contact you within 24 hours to confirm your mobile bar service.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="john@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 ${
                errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Event Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 ${
                errors.eventDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
          </div>
          {errors.eventDate && (
            <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
          )}
        </div>

        {/* Event Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Event Time
          </label>
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Event Type
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800"
          >
            <option value="wedding">Wedding</option>
            <option value="corporate">Corporate Event</option>
            <option value="birthday">Birthday Party</option>
            <option value="private">Private Party</option>
            <option value="festival">Festival</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Guest Count */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="guestCount"
            value={formData.guestCount}
            onChange={handleInputChange}
            min="10"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 ${
              errors.guestCount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="50"
          />
          {errors.guestCount && (
            <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
          )}
        </div>

        {/* Package Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Package Type
          </label>
          <select
            name="packageType"
            value={formData.packageType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800"
          >
            <option value="basic">Essential Bar</option>
            <option value="premium">Premium Experience</option>
            <option value="luxury">Luxury Collection</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Event Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 ${
            errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Venue name and address"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Additional Details
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800"
            placeholder="Tell us more about your event, special requests, or questions..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit Booking Request
            </>
          )}
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        We'll contact you within 24 hours to confirm availability and finalize details
      </p>
    </form>
  );
}
