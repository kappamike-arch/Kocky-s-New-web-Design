'use client';

import React from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Phone, Mail, CreditCard } from 'lucide-react';

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  price?: number;
  total?: number;
  image?: string;
}

interface QuoteTemplateProps {
  quoteNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  event: {
    date: string;
    location: string;
    type: string;
    guestCount?: number;
  };
  items: QuoteItem[];
  pricing: {
    subtotal: number;
    tax: number;
    taxRate?: number;
    gratuity?: number;
    gratuityRate?: number;
    total: number;
    deposit?: number;
  };
  notes?: string;
  termsAndConditions?: string;
  stripePaymentUrl?: string;
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

export const ElegantVisualTemplate: React.FC<QuoteTemplateProps> = ({
  quoteNumber,
  customer,
  event,
  items,
  pricing,
  notes,
  termsAndConditions,
  stripePaymentUrl,
  companyInfo,
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white text-gray-900 max-w-5xl mx-auto shadow-2xl">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#c1272d] to-red-800 text-white p-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <img 
                src={companyInfo.logo || '/kockys-logo.png'} 
                alt={companyInfo.name} 
                className="h-20 w-auto brightness-0 invert"
              />
              <div>
                <h1 className="text-4xl font-bold">{companyInfo.name}</h1>
                <p className="text-red-100 mt-1">Premium Event Services</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">Quote Number</p>
              <p className="text-2xl font-bold">#{quoteNumber}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Customer and Event Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#c1272d] mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  {customer.company && <p className="text-sm text-gray-600">{customer.company}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#c1272d] mb-4">Event Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</p>
                  <p className="text-sm text-gray-600">{event.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>
              {event.guestCount && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{event.guestCount} Expected Guests</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items as Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Services & Items</h3>
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="flex items-start gap-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-[#c1272d]">
                          ${(item.total || item.price || 0).toFixed(2)}
                        </p>
                        {item.quantity && item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ${(item.price || 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6">Quote Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.tax > 0 && (
              <div className="flex justify-between text-gray-300">
                <span>Tax {pricing.taxRate ? `(${(pricing.taxRate * 100).toFixed(1)}%)` : ''}</span>
                <span>${pricing.tax.toFixed(2)}</span>
              </div>
            )}
            {pricing.gratuity && pricing.gratuity > 0 && (
              <div className="flex justify-between text-gray-300">
                <span>Gratuity {pricing.gratuityRate ? `(${(pricing.gratuityRate * 100).toFixed(0)}%)` : ''}</span>
                <span>${pricing.gratuity.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-light">Total Amount</span>
                <span className="text-4xl font-bold text-[#c1272d]">
                  ${pricing.total.toFixed(2)}
                </span>
              </div>
              {pricing.deposit && (
                <div className="flex justify-between mt-3 text-sm text-gray-400">
                  <span>Required Deposit</span>
                  <span className="text-yellow-400">${pricing.deposit.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Button */}
          {stripePaymentUrl && (
            <div className="mt-8">
              <a
                href={stripePaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[#c1272d] to-red-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-[1.02]"
              >
                <CreditCard className="w-6 h-6" />
                Secure Payment with Stripe
              </a>
              {pricing.deposit && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  Choose to pay deposit (${pricing.deposit.toFixed(2)}) or full amount
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notes Section */}
        {notes && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
            <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
            <p className="text-yellow-700 whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Terms Footer */}
        {termsAndConditions && (
          <div className="bg-gray-100 rounded-lg p-6">
            <h4 className="font-semibold text-sm mb-3">Terms and Conditions</h4>
            <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
              {termsAndConditions}
            </p>
          </div>
        )}

        {/* Contact Footer */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">Questions? Contact us:</p>
          <div className="flex justify-center items-center gap-6 text-sm">
            <a href={`tel:${companyInfo.phone}`} className="flex items-center gap-2 text-[#c1272d] hover:underline">
              <Phone className="w-4 h-4" />
              {companyInfo.phone}
            </a>
            <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2 text-[#c1272d] hover:underline">
              <Mail className="w-4 h-4" />
              {companyInfo.email}
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            This quote is valid for 30 days from issue date • {companyInfo.website}
          </p>
        </div>
      </div>
    </div>
  );
};



