'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export function FloatingNewsletter() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show the popup after 30 seconds
    const timer = setTimeout(() => {
      const hasSeenNewsletter = localStorage.getItem('hasSeenNewsletter');
      if (!hasSeenNewsletter) {
        setIsOpen(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await newsletterAPI.subscribe({ email, name });
      toast.success('Successfully subscribed to our newsletter!');
      localStorage.setItem('hasSeenNewsletter', 'true');
      setIsOpen(false);
      setEmail('');
      setName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenNewsletter', 'true');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <Mail className="h-6 w-6" />
        <span className="absolute top-0 right-0 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
      </motion.button>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Header with Gradient Background */}
              <div className="bg-gradient-to-br from-orange-400 to-red-600 p-6 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Get 10% Off!</h2>
                </div>
                <p className="text-white/90">
                  Subscribe to our newsletter and receive exclusive offers, updates, and a special discount on your first order!
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </span>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Subscribe & Get 10% Off
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
