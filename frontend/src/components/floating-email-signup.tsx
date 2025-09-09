'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { emailLists } from '@/lib/api/email-lists';
import { analytics } from '@/lib/api/analytics';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  firstName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function FloatingEmailSignup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Show popup after 30 seconds if user hasn't interacted
  useEffect(() => {
    const hasSubscribed = localStorage.getItem('newsletter-subscribed');
    const hasClosed = sessionStorage.getItem('newsletter-closed');
    
    if (!hasSubscribed && !hasClosed && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        analytics.event('popup', 'Newsletter Popup Shown');
      }, 30000); // 30 seconds delay

      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);

  // Track scroll to show popup
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 50 && !hasInteracted && !isOpen) {
        const hasSubscribed = localStorage.getItem('newsletter-subscribed');
        const hasClosed = sessionStorage.getItem('newsletter-closed');
        
        if (!hasSubscribed && !hasClosed) {
          setIsOpen(true);
          setHasInteracted(true);
          analytics.event('popup', 'Newsletter Popup Shown on Scroll');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasInteracted, isOpen]);

  const onSubmit = async (data: FormData) => {
    try {
      await emailLists.subscribe({
        ...data,
        source: 'popup',
      });

      toast.success('🎉 Welcome to the family! Check your email for a special offer.');
      localStorage.setItem('newsletter-subscribed', 'true');
      analytics.conversion('newsletter_signup', undefined, { source: 'popup' });
      
      reset();
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    sessionStorage.setItem('newsletter-closed', 'true');
    analytics.event('popup', 'Newsletter Popup Closed');
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMinimized(!isMinimized);
    analytics.event('popup', isMinimized ? 'Newsletter Popup Expanded' : 'Newsletter Popup Minimized');
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsOpen(true);
              analytics.event('popup', 'Newsletter Popup Opened via Button');
            }}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Mail className="w-6 h-6" />
            <motion.div
              className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 'auto'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: '400px', maxWidth: 'calc(100vw - 48px)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <h3 className="font-bold text-lg">
                    {isMinimized ? 'Newsletter' : 'Get 10% Off Your First Order!'}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {/* Minimize/Expand Button */}
                  <button
                    type="button"
                    onClick={handleMinimize}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={isMinimized ? 'Expand' : 'Minimize'}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {isMinimized ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Close"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Join our VIP list for exclusive deals, event invites, and insider news!
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                      <div>
                        <input
                          {...register('firstName')}
                          type="text"
                          placeholder="First name (optional)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="Your email address"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                          required
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Joining...
                          </span>
                        ) : (
                          'Get My 10% Off!'
                        )}
                      </motion.button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>

                  {/* Animated decoration - Palm tree logo */}
                  <div className="absolute bottom-2 right-2 opacity-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-yellow-300 flex items-center justify-center">
                      <span className="text-4xl">🌴</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}