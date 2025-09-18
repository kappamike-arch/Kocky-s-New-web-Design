'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { auth } from '@/lib/api/auth';

export default function TestPage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const results: any = {};
      
      // Test 1: Check if we're on client side
      results.isClientSide = typeof window !== 'undefined';
      
      // Test 2: Check auth token
      try {
        results.authToken = auth.isAuthenticated();
        results.cookieValue = typeof document !== 'undefined' ? document.cookie : 'N/A';
      } catch (e: any) {
        results.authTokenError = e.message;
      }
      
      // Test 3: Check localStorage
      try {
        results.localStorageUser = auth.getCurrentUser();
      } catch (e: any) {
        results.localStorageError = e.message;
      }
      
      // Test 4: Test API connection
      try {
        const response = await api.get('/health');
        results.apiHealth = response.data;
      } catch (e: any) {
        results.apiError = {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data
        };
      }
      
      // Test 5: Check environment variables
      results.envVars = {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL
      };
      
      setStatus(results);
      setLoading(false);
    };
    
    runTests();
  }, []);

  if (loading) {
    return <div className="p-8">Running diagnostics...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel Diagnostics</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Client Side Check</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ isClientSide: status.isClientSide }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Authentication Status</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              isAuthenticated: status.authToken,
              cookies: status.cookieValue,
              error: status.authTokenError
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Local Storage</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              user: status.localStorageUser,
              error: status.localStorageError
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">API Connection</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              health: status.apiHealth,
              error: status.apiError
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Environment Variables</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(status.envVars, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8 space-x-4">
        <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
          Go to Login
        </a>
        <a href="/dashboard" className="bg-green-500 text-white px-4 py-2 rounded">
          Try Dashboard
        </a>
      </div>
    </div>
  );
}


