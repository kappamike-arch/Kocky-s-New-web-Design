'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api/auth';
import { 
  getAzureEmailStatus, 
  testAzureEmail, 
  setEmailProvider,
  AzureEmailStatus 
} from '@/lib/azure-email-api';
import { LoadingPage } from '@/components/Skeleton';

export default function AzureEmailPage() {
  const [status, setStatus] = useState<AzureEmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testProvider, setTestProvider] = useState<'smtp' | 'azure' | 'auto'>('auto');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchStatus();
  }, [router]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await getAzureEmailStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      showMessage('Failed to fetch email status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showMessage('Please enter an email address', 'error');
      return;
    }

    try {
      setTesting(true);
      const response = await testAzureEmail({
        toEmail: testEmail,
        provider: testProvider
      });

      if (response.success) {
        showMessage('Test email sent successfully!', 'success');
      } else {
        showMessage('Failed to send test email', 'error');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      showMessage('Failed to send test email', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSetProvider = async (provider: 'smtp' | 'azure' | 'auto') => {
    try {
      const response = await setEmailProvider({ provider });
      if (response.success) {
        showMessage(`Email provider set to: ${provider}`, 'success');
        fetchStatus(); // Refresh status
      } else {
        showMessage('Failed to set email provider', 'error');
      }
    } catch (error) {
      console.error('Error setting provider:', error);
      showMessage('Failed to set email provider', 'error');
    }
  };

  if (loading) {
    return <LoadingPage message="Loading Azure email configuration..." />;
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load</h2>
          <p className="text-gray-600 mb-4">Unable to load email configuration</p>
          <button 
            onClick={fetchStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Azure Email Configuration</h1>
          <p className="mt-2 text-gray-600">
            Manage your email service providers and test email functionality
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Provider Status */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Email Provider Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Azure Status */}
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  status.providers.azure ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={`text-2xl ${status.providers.azure ? 'text-green-600' : 'text-red-600'}`}>
                    {status.providers.azure ? '✅' : '❌'}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Azure OAuth2</h3>
                <p className={`text-sm ${status.providers.azure ? 'text-green-600' : 'text-red-600'}`}>
                  {status.providers.azure ? 'Configured' : 'Not Configured'}
                </p>
                {status.providers.azure && (
                  <button
                    onClick={() => handleSetProvider('azure')}
                    className={`mt-2 px-3 py-1 text-xs rounded-full ${
                      status.providers.preferred === 'azure'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {status.providers.preferred === 'azure' ? 'Active' : 'Set as Active'}
                  </button>
                )}
              </div>

              {/* SMTP Status */}
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  status.providers.smtp ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={`text-2xl ${status.providers.smtp ? 'text-green-600' : 'text-red-600'}`}>
                    {status.providers.smtp ? '✅' : '❌'}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">SMTP</h3>
                <p className={`text-sm ${status.providers.smtp ? 'text-green-600' : 'text-red-600'}`}>
                  {status.providers.smtp ? 'Configured' : 'Not Configured'}
                </p>
                {status.providers.smtp && (
                  <button
                    onClick={() => handleSetProvider('smtp')}
                    className={`mt-2 px-3 py-1 text-xs rounded-full ${
                      status.providers.preferred === 'smtp'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {status.providers.preferred === 'smtp' ? 'Active' : 'Set as Active'}
                  </button>
                )}
              </div>

              {/* Auto Mode */}
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  status.providers.preferred === 'auto' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <span className={`text-2xl ${status.providers.preferred === 'auto' ? 'text-blue-600' : 'text-gray-600'}`}>
                    🔄
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Auto Mode</h3>
                <p className="text-sm text-gray-600">Automatic Selection</p>
                <button
                  onClick={() => handleSetProvider('auto')}
                  className={`mt-2 px-3 py-1 text-xs rounded-full ${
                    status.providers.preferred === 'auto'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {status.providers.preferred === 'auto' ? 'Active' : 'Set as Active'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Configuration Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Azure Configuration */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Azure Configuration</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Client ID:</span>
                    <span className="text-sm font-mono">{status.environment.azureClientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tenant ID:</span>
                    <span className="text-sm font-mono">{status.environment.azureTenantId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Client Secret:</span>
                    <span className="text-sm font-mono">{status.environment.azureClientSecret}</span>
                  </div>
                </div>
              </div>

              {/* SMTP Configuration */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">SMTP Configuration</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SMTP Host:</span>
                    <span className="text-sm font-mono">{status.environment.smtpHost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SMTP User:</span>
                    <span className="text-sm font-mono">{status.environment.smtpUser}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Test Email Service</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  value={testProvider}
                  onChange={(e) => setTestProvider(e.target.value as 'smtp' | 'azure' | 'auto')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="azure">Azure OAuth2</option>
                  <option value="smtp">SMTP</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {testing ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Send a test email to verify your email configuration is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

