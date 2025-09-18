'use client';

import React from 'react';
import { format } from 'date-fns';

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  price?: number;
  total?: number;
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

export const SleekModernTemplate: React.FC<QuoteTemplateProps> = ({
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
    <div className="bg-black text-white max-w-5xl mx-auto p-8">
      {/* Minimalist Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-4">
          <img 
            src={companyInfo.logo || '/kockys-logo.png'} 
            alt={companyInfo.name} 
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-2xl font-light tracking-wider">{companyInfo.name}</h1>
            <p className="text-gray-400 text-sm">{companyInfo.website}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-thin text-[#c1272d]">QUOTE</p>
          <p className="text-gray-400 text-sm mt-1">#{quoteNumber}</p>
        </div>
      </div>

      {/* Customer and Event Grid */}
      <div className="grid grid-cols-3 gap-8 mb-12 border-b border-gray-800 pb-8">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Client</h3>
          <p className="font-light text-lg">{customer.name}</p>
          {customer.company && <p className="text-gray-400">{customer.company}</p>}
          <p className="text-gray-400 text-sm mt-2">{customer.email}</p>
          <p className="text-gray-400 text-sm">{customer.phone}</p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Event</h3>
          <p className="font-light text-lg">{event.type}</p>
          <p className="text-gray-400 text-sm mt-2">
            {format(new Date(event.date), 'MMM dd, yyyy')}
          </p>
          {event.guestCount && (
            <p className="text-gray-400 text-sm">{event.guestCount} guests</p>
          )}
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Location</h3>
          <p className="font-light text-gray-300">{event.location}</p>
        </div>
      </div>

      {/* Minimalist Items List */}
      <div className="mb-12">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Services & Items</h3>
        <div className="space-y-1">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`grid grid-cols-12 gap-4 py-4 ${
                index % 2 === 0 ? 'bg-gray-900/30' : ''
              }`}
            >
              <div className="col-span-6">
                <p className="font-light">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
              </div>
              <div className="col-span-2 text-center">
                <p className="text-gray-400">{item.quantity || 1}</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-gray-400">${(item.price || 0).toFixed(2)}</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="font-light">${(item.total || item.price || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing and Payment Section */}
      <div className="flex justify-between items-start">
        {/* Notes */}
        <div className="w-1/2">
          {notes && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Notes</h3>
              <p className="text-gray-400 text-sm whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>

        {/* Pricing Summary with Payment Button */}
        <div className="w-96">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase text-xs tracking-wider">Subtotal</span>
              <span className="font-light">${pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase text-xs tracking-wider">
                  Tax {pricing.taxRate ? `${(pricing.taxRate * 100).toFixed(1)}%` : ''}
                </span>
                <span className="font-light">${pricing.tax.toFixed(2)}</span>
              </div>
            )}
            {pricing.gratuity && pricing.gratuity > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase text-xs tracking-wider">
                  Gratuity {pricing.gratuityRate ? `${(pricing.gratuityRate * 100).toFixed(0)}%` : ''}
                </span>
                <span className="font-light">${pricing.gratuity.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Total with integrated payment button */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex justify-between items-end mb-6">
              <span className="text-lg uppercase tracking-wider">Total</span>
              <span className="text-4xl font-bold text-[#c1272d]">
                ${pricing.total.toFixed(2)}
              </span>
            </div>

            {stripePaymentUrl && (
              <a
                href={stripePaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#c1272d] text-white text-center py-4 font-light text-sm uppercase tracking-wider hover:bg-red-700 transition-colors"
              >
                Secure Payment →
              </a>
            )}

            {pricing.deposit && (
              <p className="text-xs text-gray-500 text-center mt-3">
                Deposit: ${pricing.deposit.toFixed(2)} | Full payment accepted
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      {termsAndConditions && (
        <div className="mt-12 pt-8 border-t border-gray-800">
          <details className="cursor-pointer">
            <summary className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300">
              Terms & Conditions
            </summary>
            <p className="text-xs text-gray-600 mt-4 whitespace-pre-wrap">{termsAndConditions}</p>
          </details>
        </div>
      )}

      {/* Contact Footer */}
      <div className="mt-12 pt-8 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          {companyInfo.phone} • {companyInfo.email} • {companyInfo.address}
        </p>
        <p className="text-xs text-gray-700 mt-2">Quote valid for 30 days</p>
      </div>
    </div>
  );
};



