"use client";

import React from "react";

export default function EmailTemplateStudio() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎨 Email Template Visual Studio
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                Editor #1 · Inquiry Confirmation
              </h2>
              <p className="text-blue-700 mb-4">
                Create beautiful confirmation emails for customer inquiries.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Open Editor
              </button>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                Editor #2 · Quote / Proposal
              </h2>
              <p className="text-green-700 mb-4">
                Design professional quote and proposal emails.
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Open Editor
              </button>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-orange-900 mb-3">
                Editor #3 · Mobile Bar Booking
              </h2>
              <p className="text-orange-700 mb-4">
                Create engaging mobile bar service emails.
              </p>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                Open Editor
              </button>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Features Coming Soon:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Visual drag-and-drop email builder</li>
              <li>Live preview with real-time updates</li>
              <li>Logo and banner upload functionality</li>
              <li>Color customization and branding</li>
              <li>Template variables ({{customerName}}, {{serviceName}}, etc.)</li>
              <li>Export to HTML and JSON formats</li>
              <li>Send test emails through Azure integration</li>
            </ul>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              The full visual email template studio is being prepared. 
              For now, you can use the existing template editor.
            </p>
            <a 
              href="/admin/email-templates/editor" 
              className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Go to Template Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}