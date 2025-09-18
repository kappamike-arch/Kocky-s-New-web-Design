"use client";

import { useEffect, useState } from "react";
import { getTemplate } from "@/lib/email-templates-api";
import { useRouter } from "next/navigation";
import { LoadingPage } from "@/components/Skeleton";

export default function PreviewTemplate({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await getTemplate(params.id);
        setTemplate(response.template);
      } catch (error) {
        console.error('Error fetching template:', error);
        if ((error as Error).message === "UNAUTHORIZED") {
          router.push("/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id, router]);

  if (loading) {
    return <LoadingPage message="Loading template preview..." />;
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Template Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Template Preview</h1>
              <p className="mt-2 text-gray-600">{template.name}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Back to Templates
            </button>
          </div>
        </div>

        {/* Template Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Template Name</h3>
              <p className="text-lg font-semibold text-gray-900">{template.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Subject Line</h3>
              <p className="text-lg text-gray-900">{template.subject}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email Preview</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(template.html);
                        newWindow.document.close();
                      }
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <iframe
                srcDoc={template.html}
                className="w-full h-96 border-0"
                title="Email Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>

        {/* HTML Source */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">HTML Source</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">{template.html}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

