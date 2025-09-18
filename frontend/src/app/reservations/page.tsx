'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, Users, Phone, Mail, MessageSquare, 
  CheckCircle, Star, MapPin, Utensils, Wine, 
  ChevronRight, Sparkles 
} from 'lucide-react';
import { inquiries } from '@/lib/api/inquiries';
import { analytics } from '@/lib/api/analytics';
import { unifiedFormsAPI } from '@/lib/api/unified-forms';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  eventDate: z.string().min(1, 'Please select a date'),
  eventTime: z.string().min(1, 'Please select a time'),
  guestCount: z.number().min(1, 'At least 1 guest is required').max(50, 'Please call for parties over 50'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ReservationsPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Use unified forms API for better CRM integration
      const response = await unifiedFormsAPI.submit({
        formType: 'reservation',
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        guestCount: data.guestCount,
        message: data.message || `Reservation for ${data.guestCount} people`,
        specialRequests: data.message
      });

      analytics.conversion('reservation_submitted', undefined, { 
        guestCount: data.guestCount,
        date: data.eventDate,
      });

      setIsSubmitted(true);
      toast.success(response.message || 'Reservation request submitted successfully!');
      
      if (response.confirmationCode) {
        toast.success(`Confirmation code: ${response.confirmationCode}`, { duration: 6000 });
      }
      
      reset();

      // Reset success state after 10 seconds
      setTimeout(() => setIsSubmitted(false), 10000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit reservation. Please try again.');
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 11; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const label = format(new Date(`2000-01-01T${time}`), 'h:mm a');
      timeSlots.push({ value: time, label });
    }
  }

  const features = [
    { icon: Utensils, title: 'Fine Dining', description: 'Exceptional cuisine prepared by expert chefs' },
    { icon: Wine, title: 'Full Bar', description: 'Premium spirits and craft cocktails' },
    { icon: Users, title: 'Private Events', description: 'Perfect venue for special occasions' },
    { icon: Star, title: 'VIP Service', description: 'Personalized attention to every detail' },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/5 rounded-full filter blur-3xl" />
      </div>

      {/* Hero Section */}
      <motion.div 
        className="relative z-10 text-center pt-20 pb-12 px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-600/30 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium">Experience Fine Dining</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            Reserve Your Table
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Join us for an unforgettable dining experience at Kocky's Bar & Grill
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`relative bg-gray-900 border ${hoveredFeature === index ? 'border-red-600' : 'border-gray-800'} rounded-xl p-4 transition-all duration-300 cursor-pointer`}
            >
              {hoveredFeature === index && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-400/10 rounded-xl" />
              )}
              <div className="relative z-10">
                <feature.icon className={`w-8 h-8 ${hoveredFeature === index ? 'text-red-500' : 'text-gray-400'} mb-2 transition-colors duration-300`} />
                <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-xs">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-3xl filter blur-xl" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 hover:border-red-600/50 transition-all duration-300">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-6">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Reservation Confirmed!</h2>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    We'll send you a confirmation email within 30 minutes. We look forward to serving you!
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold transition-colors"
                  >
                    Make Another Reservation
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Book Your Experience</h2>
                    <p className="text-gray-400">Fill in your details below</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name *</label>
                    <div className="relative group">
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300"
                      />
                      <Users className="absolute left-4 top-4.5 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <div className="relative group">
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300"
                      />
                      <Mail className="absolute left-4 top-4.5 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <div className="relative group">
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300"
                      />
                      <Phone className="absolute left-4 top-4.5 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-2">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                      <div className="relative group">
                        <input
                          {...register('eventDate')}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300"
                        />
                        <Calendar className="absolute left-4 top-4.5 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                      </div>
                      {errors.eventDate && (
                        <p className="text-red-400 text-sm mt-2">{errors.eventDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                      <div className="relative group">
                        <select
                          {...register('eventTime')}
                          className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-800">Select time</option>
                          {timeSlots.map((slot) => (
                            <option key={slot.value} value={slot.value} className="bg-gray-800">
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute left-4 top-4.5 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                      </div>
                      {errors.eventTime && (
                        <p className="text-red-400 text-sm mt-2">{errors.eventTime.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Number of Guests *</label>
                    <div className="relative group">
                      <input
                        {...register('guestCount', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="50"
                        placeholder="2"
                        className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300"
                      />
                      <Users className="absolute left-4 top-4.5 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    {errors.guestCount && (
                      <p className="text-red-400 text-sm mt-2">{errors.guestCount.message}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">For parties over 50 guests, please call us directly</p>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Special Requests (Optional)
                    </label>
                    <div className="relative group">
                      <textarea
                        {...register('message')}
                        rows={4}
                        placeholder="Any dietary restrictions, special occasions, seating preferences..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-300 resize-none"
                      />
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full group overflow-hidden rounded-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 group-hover:from-red-500 group-hover:to-red-400" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative px-8 py-5 font-bold text-white text-lg flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Reserve Now
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Restaurant Info Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-yellow-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 filter blur-xl" />
              <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-red-600/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Visit Kocky's</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Hours of Operation</h3>
                      <div className="space-y-1 text-gray-400 text-sm">
                        <p>Monday - Thursday: 11:00 AM - 10:00 PM</p>
                        <p>Friday - Saturday: 11:00 AM - 11:00 PM</p>
                        <p>Sunday: 12:00 PM - 9:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Direct Line</h3>
                      <p className="text-gray-400">(555) 123-4567</p>
                      <p className="text-gray-500 text-sm mt-1">Call for immediate reservations</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Email Us</h3>
                      <p className="text-gray-400">reservations@kockysbar.com</p>
                      <p className="text-gray-500 text-sm mt-1">24-hour response time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">Location</h3>
                      <p className="text-gray-400">123 Main Street</p>
                      <p className="text-gray-400">Downtown, City 12345</p>
                      <p className="text-gray-500 text-sm mt-1">Free parking available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-red-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 filter blur-xl" />
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-3xl p-8 hover:border-red-600/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Reservation Benefits</h2>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-300 font-medium">Priority Seating</span>
                      <p className="text-gray-500 text-sm mt-1">Skip the wait with guaranteed table availability</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-300 font-medium">Special Occasions</span>
                      <p className="text-gray-500 text-sm mt-1">Complimentary dessert for birthdays & anniversaries</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-300 font-medium">Flexible Cancellation</span>
                      <p className="text-gray-500 text-sm mt-1">Cancel or modify up to 2 hours before arrival</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-300 font-medium">VIP Treatment</span>
                      <p className="text-gray-500 text-sm mt-1">Personalized service from our dedicated staff</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-red-600/10 border border-red-600/20 rounded-xl">
                  <p className="text-red-400 text-sm text-center">
                    ⭐ Join our loyalty program for exclusive dining rewards
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}