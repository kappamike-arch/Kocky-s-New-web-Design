'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Settings, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Server,
  User,
  Key,
  List,
  Plus,
  X,
  TestTube,
  Save,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api/client';

interface EmailSettings {
  fromEmail: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  allowedEmails: string[];
  isConfigured: boolean;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    fromEmail: '',
    fromName: "Kocky's Bar & Grill",
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    allowedEmails: [],
    isConfigured: false
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [newAllowedEmail, setNewAllowedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/email/settings');
      setSettings(response.data.data);
    } catch (error) {
      toast.error('Failed to load email settings');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/email/logs?limit=10');
      setLogs(response.data.data.logs);
      setShowLogs(true);
    } catch (error) {
      toast.error('Failed to load email logs');
    }
  };

  const handleSaveSettings = async () => {
    // Validation
    if (!settings.fromEmail || !settings.smtpUser || !settings.smtpPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!settings.fromEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/email/settings', settings);
      if (response.data.success) {
        toast.success('Email settings saved and verified successfully');
        await fetchSettings(); // Refresh settings
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save email settings';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    if (!settings.isConfigured) {
      toast.error('Please configure email settings first');
      return;
    }

    setTesting(true);
    try {
      const response = await api.post('/email/test', { 
        toEmail: testEmail
        // fromEmail is optional - will use default from settings
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send test email';
      toast.error(message);
    } finally {
      setTesting(false);
    }
  };

  const addAllowedEmail = () => {
    if (!newAllowedEmail) return;
    if (!newAllowedEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (settings.allowedEmails.includes(newAllowedEmail)) {
      toast.error('This email is already in the list');
      return;
    }

    setSettings({
      ...settings,
      allowedEmails: [...settings.allowedEmails, newAllowedEmail]
    });
    setNewAllowedEmail('');
  };

  const removeAllowedEmail = (email: string) => {
    setSettings({
      ...settings,
      allowedEmails: settings.allowedEmails.filter(e => e !== email)
    });
  };

  const resendEmail = async (logId: string) => {
    try {
      const response = await api.post(`/email/logs/${logId}/resend`);
      if (response.data.success) {
        toast.success('Email resent successfully');
        fetchLogs(); // Refresh logs
      }
    } catch (error) {
      toast.error('Failed to resend email');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Mail className="h-8 w-8 text-orange-600" />
          Email Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure Office 365 (GoDaddy) email integration for automated emails
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.isConfigured ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-600 dark:text-green-400">Email System Configured</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sending from: {settings.fromEmail || 'Not configured'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-600 dark:text-yellow-400">Email System Not Configured</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please configure your SMTP settings below
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={fetchLogs}
              variant="outline"
              size="sm"
            >
              <List className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              SMTP Configuration
            </CardTitle>
            <CardDescription>
              Office 365 / GoDaddy email server settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host *</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                placeholder="smtp.office365.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">For Office 365: smtp.office365.com</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port *</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                placeholder="587"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Use 587 for TLS (recommended)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Username (Full Email) *</Label>
              <Input
                id="smtpUser"
                type="email"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                placeholder="info@kockysbar.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Your full Office 365 email address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password / App Password *</Label>
              <div className="relative">
                <Input
                  id="smtpPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  placeholder="••••••••"
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <X className="h-4 w-4" /> : <Key className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Use App Password if 2FA is enabled</p>
            </div>
          </CardContent>
        </Card>

        {/* From Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sender Configuration
            </CardTitle>
            <CardDescription>
              Configure how emails appear to recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email Address *</Label>
              <Input
                id="fromEmail"
                type="email"
                value={settings.fromEmail}
                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                placeholder="info@kockysbar.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Must match or be allowed by your SMTP server</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">From Name *</Label>
              <Input
                id="fromName"
                value={settings.fromName}
                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                placeholder="Kocky's Bar & Grill"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">Display name shown to recipients</p>
            </div>

            <div className="space-y-2">
              <Label>Allowed From Emails</Label>
              <div className="flex gap-2">
                <Input
                  value={newAllowedEmail}
                  onChange={(e) => setNewAllowedEmail(e.target.value)}
                  placeholder="Add email address"
                  className="bg-gray-800 border-gray-700 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addAllowedEmail()}
                />
                <Button onClick={addAllowedEmail} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {settings.allowedEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded">
                    <span className="text-sm text-gray-300">{email}</span>
                    <button
                      onClick={() => removeAllowedEmail(email)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving & Verifying...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>

            <div className="flex gap-2 flex-1">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button
                onClick={handleTestEmail}
                disabled={testing || !settings.isConfigured}
                variant="outline"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Email Logs</CardTitle>
              <Button
                onClick={() => setShowLogs(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No email logs found</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.status === 'SENT' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : log.status === 'FAILED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {log.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {log.type}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{log.subject}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            To: {log.recipient}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {log.status === 'FAILED' && (
                          <Button
                            onClick={() => resendEmail(log.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Resend
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Help */}
      <Alert className="mt-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Office 365 Configuration Tips:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Enable "SMTP AUTH" in your Office 365 admin center</li>
            <li>• If using 2FA, create an App Password instead of using your regular password</li>
            <li>• Ensure the from email matches your SMTP username or is an allowed alias</li>
            <li>• Test with your own email first to ensure delivery</li>
            <li>• Check spam folder if test emails don't appear in inbox</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
