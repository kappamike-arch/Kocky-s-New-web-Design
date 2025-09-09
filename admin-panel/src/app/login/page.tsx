'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    if (auth.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the backend API to authenticate
      const response = await auth.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.user) {
        // Check if user has admin privileges
        const userRole = response.user.role;
        console.log('User role:', userRole);
        
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'STAFF') {
          toast.success('Login successful!');
          console.log('Redirecting to dashboard...');
          
          // Small delay to ensure cookies are set
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
        } else {
          setError('Access denied. Admin privileges required.');
          // Logout the non-admin user
          await auth.logout();
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        setError('Invalid email or password.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.message?.includes('Network')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-600">Kocky's Bar & Grill Management System</p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ This is a secure area. Unauthorized access attempts are monitored and will be prosecuted.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="admin@kockysbar.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="Enter secure password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-admin-primary text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Admin Portal URL: https://staging.kockys.com/admin</p>
            <p className="mt-2">For security issues, contact IT support</p>
          </div>

          {/* Test Credentials Box (Remove in production) */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Test Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Super Admin:</span> admin@kockysbar.com / AdminPassword123!
              </div>
              <div>
                <span className="font-medium">Manager:</span> manager@kockysbar.com / ManagerPassword123!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
