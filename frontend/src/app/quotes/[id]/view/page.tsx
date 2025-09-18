'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { quotes } from '@/lib/api/quotes';
import { analytics } from '@/lib/api/analytics';
import { 
  FileText, Calendar, MapPin, Users, DollarSign, 
  CheckCircle, Clock, CreditCard, Download, Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import Image from 'next/image';

export default function QuoteViewPage() {
  const params = useParams();
  const quoteId = params.id as string;

  // Fetch quote details
  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => quotes.getById(quoteId),
  });

  // Track quote view
  useEffect(() => {
    if (quote) {
      analytics.event('quote', 'Quote Viewed', {
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
      });
    }
  }, [quote]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
          <p className="text-gray-600">The quote you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (quote.status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Paid
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Accepted
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <Image 
                src="/logo-white.png" 
                alt="Kocky's Bar & Grill"
                width={150}
                height={60}
                className="h-12 w-auto"
              />
              {getStatusBadge()}
            </div>
            <h1 className="text-3xl font-bold mb-2">Quote #{quote.quoteNumber}</h1>
            <p className="text-white/90">{quote.title}</p>
          </div>
        </motion.div>

        {/* Quote Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-lg p-8"
        >
          {/* Event Details */}
          {(quote.eventDate || quote.eventLocation || quote.guestCount) && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quote.eventDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="font-medium">
                        {format(new Date(quote.eventDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                {quote.eventLocation && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{quote.eventLocation}</p>
                    </div>
                  </div>
                )}
                {quote.guestCount && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Guest Count</p>
                      <p className="font-medium">{quote.guestCount} guests</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quote Breakdown</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Items */}
                  {quote.items?.map((item: any, index: number) => (
                    <tr key={`item-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.name || item.description}</p>
                          {item.description && item.name && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                          {item.isOptional && (
                            <span className="text-xs text-orange-600">(Optional)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${item.unitPrice?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${item.total?.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Packages */}
                  {quote.packages?.map((pkg: any, index: number) => (
                    <tr key={`pkg-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3" colSpan={3}>
                        <div>
                          <p className="font-medium">{pkg.name}</p>
                          {pkg.description && (
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                          )}
                          {pkg.isOptional && (
                            <span className="text-xs text-orange-600">(Optional)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${pkg.price?.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Labor */}
                  {quote.laborItems?.map((labor: any, index: number) => (
                    <tr key={`labor-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3" colSpan={2}>
                        <div>
                          <p className="font-medium">{labor.description}</p>
                          {labor.staffName && (
                            <p className="text-sm text-gray-600">Staff: {labor.staffName}</p>
                          )}
                          {labor.isOptional && (
                            <span className="text-xs text-orange-600">(Optional)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {labor.hours} hrs × ${labor.rate}/hr
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${labor.total?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${quote.subtotal?.toFixed(2)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount:</span>
                    <span>-${quote.discount?.toFixed(2)}</span>
                  </div>
                )}
                {quote.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({quote.taxRate}%):</span>
                    <span>${quote.taxAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-orange-500">${quote.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          {quote.termsAndConditions && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Terms & Conditions</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {quote.termsAndConditions}
                </p>
              </div>
            </div>
          )}

          {/* Validity */}
          {quote.validUntil && (
            <div className="mb-8 text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">
                This quote is valid until{' '}
                <span className="font-semibold">
                  {format(new Date(quote.validUntil), 'MMMM dd, yyyy')}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {quote.status !== 'PAID' && quote.status !== 'EXPIRED' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {quote.stripePaymentLink && (
                <motion.a
                  href={quote.stripePaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold text-center shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                  onClick={() => {
                    analytics.event('quote', 'Payment Link Clicked', {
                      quoteId: quote.id,
                      quoteNumber: quote.quoteNumber,
                      total: quote.total,
                    });
                  }}
                >
                  <CreditCard className="w-5 h-5" />
                  Accept & Pay ${quote.total?.toFixed(2)}
                </motion.a>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold shadow hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                onClick={() => window.print()}
              >
                <Download className="w-5 h-5" />
                Download PDF
              </motion.button>

              <motion.a
                href={`mailto:quotes@kockysbar.com?subject=Question about Quote ${quote.quoteNumber}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold shadow hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </motion.a>
            </div>
          )}

          {/* Paid Badge */}
          {quote.status === 'PAID' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="font-bold text-lg">Payment Received</p>
                  {quote.paidAt && (
                    <p className="text-sm">
                      Paid on {format(new Date(quote.paidAt), 'MMMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-b-2xl shadow-lg p-8 text-center text-white"
        >
          <h3 className="text-xl font-bold mb-2">Thank You for Choosing Kocky's Bar & Grill!</h3>
          <p className="text-gray-300 mb-4">
            We're excited to be part of your special event.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-gray-400">Call Us</p>
              <p className="font-semibold">(555) 123-4567</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-semibold">quotes@kockysbar.com</p>
            </div>
            <div>
              <p className="text-gray-400">Visit</p>
              <p className="font-semibold">123 Main Street</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
