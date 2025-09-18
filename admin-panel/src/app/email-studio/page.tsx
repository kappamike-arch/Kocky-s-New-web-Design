"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function EmailStudio() {
  const [activeTab, setActiveTab] = useState("inquiry");

  const templates = {
    inquiry: {
      title: "Inquiry Confirmation",
      description: "Create beautiful confirmation emails for customer inquiries",
      color: "blue",
      icon: "📧"
    },
    quote: {
      title: "Quote / Proposal", 
      description: "Design professional quote and proposal emails",
      color: "green",
      icon: "💰"
    },
    mobileBar: {
      title: "Mobile Bar Booking",
      description: "Create engaging mobile bar service emails", 
      color: "orange",
      icon: "🍻"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎨 Email Template Visual Studio</h1>
              <p className="mt-2 text-gray-600">Create beautiful, professional email templates with our visual editor</p>
            </div>
            <Link 
              href="/admin/email-templates/editor"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ⚙️ Template Editor
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? `border-${template.color}-500 text-${template.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {template.icon} {template.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Template Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-8">
            {Object.entries(templates).map(([key, template]) => (
              <div key={key} className={activeTab === key ? 'block' : 'hidden'}>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${template.color}-100 mb-4`}>
                    <span className="text-2xl">{template.icon}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{template.title}</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">{template.description}</p>
                </div>

                {/* Coming Soon Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Visual Editor Features:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Drag & drop email blocks
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Live preview with real-time updates
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Logo and banner upload
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        Color customization
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Template Variables:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <code className="text-sm text-gray-700">
                        {key === 'inquiry' && `{{customerName}}\n{{serviceName}}\n{{confirmationCode}}\n{{eventDate}}`}
                        {key === 'quote' && `{{customerName}}\n{{quoteNumber}}\n{{total}}\n{{validUntil}}`}
                        {key === 'mobileBar' && `{{customerName}}\n{{eventDate}}\n{{eventLocation}}\n{{packageType}}`}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button 
                    className={`px-6 py-3 bg-${template.color}-600 text-white rounded-lg hover:bg-${template.color}-700 transition-colors`}
                    onClick={() => alert('Visual editor coming soon! For now, use the Template Editor.')}
                  >
                    🎨 Open Visual Editor
                  </button>
                  <Link 
                    href="/admin/email-templates/editor"
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ⚙️ Use Template Editor
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>The full visual email template studio is in development. Use the Template Editor for now to customize your email templates.</p>
        </div>
      </div>
    </div>
  );
}