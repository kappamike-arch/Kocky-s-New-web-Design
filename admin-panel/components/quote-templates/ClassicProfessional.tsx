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

export const ClassicProfessionalTemplate: React.FC<QuoteTemplateProps> = ({
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
    <div className="bg-white text-gray-900 max-w-4xl mx-auto p-8 shadow-lg">
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <img 
          src={companyInfo.logo || '/kockys-logo.png'} 
          alt={companyInfo.name} 
          className="h-24 w-auto mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-[#c1272d]">{companyInfo.name}</h1>
        <p className="text-gray-600 mt-2">{companyInfo.address}</p>
        <p className="text-gray-600">
          {companyInfo.phone} | {companyInfo.email} | {companyInfo.website}
        </p>
      </div>

      {/* Quote Title */}
      <div className="border-b-2 border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-center">QUOTE</h2>
        <p className="text-center text-gray-600 mt-1">Quote #{quoteNumber}</p>
      </div>

      {/* Customer and Event Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-lg mb-3 text-[#c1272d]">Bill To:</h3>
          <p className="font-medium">{customer.name}</p>
          {customer.company && <p className="text-gray-600">{customer.company}</p>}
          <p className="text-gray-600">{customer.email}</p>
          <p className="text-gray-600">{customer.phone}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 text-[#c1272d]">Event Details:</h3>
          <p className="text-gray-600">
            <span className="font-medium">Type:</span> {event.type}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Date:</span> {format(new Date(event.date), 'MMMM dd, yyyy')}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Location:</span> {event.location}
          </p>
          {event.guestCount && (
            <p className="text-gray-600">
              <span className="font-medium">Guest Count:</span> {event.guestCount}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left p-3 font-semibold">Item</th>
              <th className="text-left p-3 font-semibold">Description</th>
              <th className="text-center p-3 font-semibold">Qty</th>
              <th className="text-right p-3 font-semibold">Price</th>
              <th className="text-right p-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 border-b border-gray-200">{item.name}</td>
                <td className="p-3 border-b border-gray-200 text-gray-600 text-sm">
                  {item.description || '-'}
                </td>
                <td className="p-3 border-b border-gray-200 text-center">
                  {item.quantity || 1}
                </td>
                <td className="p-3 border-b border-gray-200 text-right">
                  ${(item.price || 0).toFixed(2)}
                </td>
                <td className="p-3 border-b border-gray-200 text-right font-medium">
                  ${(item.total || item.price || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${pricing.subtotal.toFixed(2)}</span>
          </div>
          {pricing.tax > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">
                Tax {pricing.taxRate ? `(${(pricing.taxRate * 100).toFixed(1)}%)` : ''}:
              </span>
              <span className="font-medium">${pricing.tax.toFixed(2)}</span>
            </div>
          )}
          {pricing.gratuity && pricing.gratuity > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">
                Gratuity {pricing.gratuityRate ? `(${(pricing.gratuityRate * 100).toFixed(0)}%)` : ''}:
              </span>
              <span className="font-medium">${pricing.gratuity.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-xl font-bold text-[#c1272d]">${pricing.total.toFixed(2)}</span>
          </div>
          {pricing.deposit && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Deposit Required:</span>
              <span className="font-medium text-[#c1272d]">${pricing.deposit.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      {notes && (
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Additional Notes:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {/* Payment Button */}
      {stripePaymentUrl && (
        <div className="text-center mb-8">
          <a
            href={stripePaymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#c1272d] text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
          >
            Pay Now with Stripe
          </a>
          {pricing.deposit && (
            <p className="text-sm text-gray-600 mt-2">
              Pay deposit of ${pricing.deposit.toFixed(2)} or full amount
            </p>
          )}
        </div>
      )}

      {/* Terms and Conditions */}
      {termsAndConditions && (
        <div className="border-t pt-6 mt-8">
          <h3 className="font-semibold mb-2 text-sm">Terms and Conditions:</h3>
          <p className="text-xs text-gray-600 whitespace-pre-wrap">{termsAndConditions}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>Thank you for choosing {companyInfo.name}!</p>
        <p className="mt-1">This quote is valid for 30 days from the issue date.</p>
      </div>
    </div>
  );
};



