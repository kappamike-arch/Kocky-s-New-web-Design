'use client';

import React, { useState } from 'react';
import { ClassicProfessionalTemplate } from './ClassicProfessional';
import { SleekModernTemplate } from './SleekModern';
import { ElegantVisualTemplate } from './ElegantVisual';
import { TemplateType, templateNames, templateDescriptions } from './index';
import { QuoteTemplateProps } from './types';
import { Eye, Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  quoteData?: QuoteTemplateProps;
  showPreview?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  quoteData,
  showPreview = true,
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(null);

  const templates = [
    {
      id: TemplateType.CLASSIC_PROFESSIONAL,
      name: templateNames[TemplateType.CLASSIC_PROFESSIONAL],
      description: templateDescriptions[TemplateType.CLASSIC_PROFESSIONAL],
      preview: '/template-classic.png',
      features: ['Traditional layout', 'Large logo', 'Clear pricing table', 'Professional look'],
    },
    {
      id: TemplateType.SLEEK_MODERN,
      name: templateNames[TemplateType.SLEEK_MODERN],
      description: templateDescriptions[TemplateType.SLEEK_MODERN],
      preview: '/template-modern.png',
      features: ['Minimalist design', 'Dark theme', 'Bold typography', 'Integrated payment'],
    },
    {
      id: TemplateType.ELEGANT_VISUAL,
      name: templateNames[TemplateType.ELEGANT_VISUAL],
      description: templateDescriptions[TemplateType.ELEGANT_VISUAL],
      preview: '/template-elegant.png',
      features: ['Visual cards', 'Hero banner', 'Item images', 'Premium feel'],
    },
  ];

  const renderTemplatePreview = (templateType: TemplateType) => {
    if (!quoteData) return null;

    switch (templateType) {
      case TemplateType.CLASSIC_PROFESSIONAL:
        return <ClassicProfessionalTemplate {...quoteData} />;
      case TemplateType.SLEEK_MODERN:
        return <SleekModernTemplate {...quoteData} />;
      case TemplateType.ELEGANT_VISUAL:
        return <ElegantVisualTemplate {...quoteData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'ring-4 ring-[#c1272d] transform scale-105'
                : 'hover:shadow-xl hover:transform hover:scale-102'
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Selected Badge */}
            {selectedTemplate === template.id && (
              <div className="absolute top-4 right-4 z-10 bg-[#c1272d] text-white rounded-full p-2">
                <Check className="w-5 h-5" />
              </div>
            )}

            {/* Template Preview Thumbnail */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-6xl mb-2">
                  {template.id === TemplateType.CLASSIC_PROFESSIONAL && '📄'}
                  {template.id === TemplateType.SLEEK_MODERN && '⚡'}
                  {template.id === TemplateType.ELEGANT_VISUAL && '🎨'}
                </div>
                <p className="text-sm text-gray-600">{template.name}</p>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              
              {/* Features */}
              <ul className="space-y-1">
                {template.features.map((feature, index) => (
                  <li key={index} className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="text-[#c1272d]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Preview Button */}
              {showPreview && quoteData && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template.id);
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && quoteData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setPreviewTemplate(null)}
            />
            <div className="relative bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Preview: {templateNames[previewTemplate]}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8">
                {renderTemplatePreview(previewTemplate)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



