'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api/auth';
import { apiJson, ListResp, extractArray } from '@/lib/api';
import { LoadingPage, SkeletonList } from '@/components/Skeleton';
import { EmptyContacts } from '@/components/EmptyState';

interface Contact {
  id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  createdAt: string;
}

export default function EmailContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchContacts();
  }, [router]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const resp = await apiJson<ListResp<Contact>>('/email/contacts');
      const contacts = extractArray<Contact>(resp);
      setContacts(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      if ((error as Error).message === "UNAUTHORIZED") {
        router.push("/login");
        return;
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading contacts..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Contacts</h1>
              <p className="mt-2 text-gray-600">Manage your email subscribers and contacts</p>
            </div>
            <Link
              href="/email"
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to Email Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">+</span>
              Add Contact
            </button>
            <button
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="mr-2">📥</span>
              Import Contacts
            </button>
            <button
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <span className="mr-2">📊</span>
              Export Contacts
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Contacts</h3>
            <p className="text-sm text-gray-500">Your email subscribers and contacts</p>
          </div>
          <div className="p-6">
            {contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{contact.name || contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-xs text-gray-400">
                        Added: {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        contact.subscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {contact.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyContacts />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
