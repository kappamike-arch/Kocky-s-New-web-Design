"use client";
import { useEffect, useState } from "react";
import { listTemplates } from "@/lib/email-templates-api";
import Link from "next/link";
import { ensureArray } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LoadingPage, SkeletonList } from "@/components/Skeleton";
import { EmptyTemplates } from "@/components/EmptyState";

export default function TemplatesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => { 
    setLoading(true);
    listTemplates().then(r => {
      // Safe array conversion
      const templates = ensureArray(r.templates);
      setData(templates);
    }).catch(error => {
      console.error('Error fetching templates:', error);
      if ((error as Error).message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
      setData([]);
    }).finally(() => {
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <LoadingPage message="Loading templates..." />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Email Templates</h1>
        <div className="flex space-x-3">
          <Link href="/admin/email-studio" className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
            🎨 Visual Studio
          </Link>
          <Link href="/admin/email-templates/editor" className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            ⚙️ Template Editor
          </Link>
          <Link href="/admin/email-templates/new" className="px-3 py-2 rounded-lg bg-black text-white">Create Template</Link>
        </div>
      </div>
      <div className="mt-6">
        {data.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {data.map(t => (
              <div key={t.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        t.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t.isActive ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{t.subject}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Link 
                    href={`/admin/email-templates/${t.id}/edit`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    ✏️ Edit
                  </Link>
                  <button 
                    onClick={() => window.open(`/admin/email-templates/${t.id}/preview`, '_blank')}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    👁️ Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyTemplates />
        )}
      </div>
    </div>
  );
}