'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Settings, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  Key,
  Link2,
  LogIn,
  Users,
  FileText,
  Edit,
  Plus,
  Trash2,
  Save,
  TestTube,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api/client';

interface EmailAccount {
  email: string;
  displayName: string;
  isDefault: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  headerHtml?: string;
  footerHtml?: string;
  variables?: string[];
}

interface AuthStatus {
  isConfigured: boolean;
  isAuthenticated: boolean;
  authenticatedEmail?: string;
  expiresAt?: string;
  hasClientCredentials: boolean;
  clientId?: string;
  emailAccounts: EmailAccount[];
}

export const dynamic = 'force-dynamic';

function EmailOAuthInner() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('setup');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Microsoft App Configuration
  const [appConfig, setAppConfig] = useState({
    clientId: '',
    clientSecret: '',
    tenantId: ''
  });
  
  // Email Accounts
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [newAccount, setNewAccount] = useState({ email: '', displayName: '' });
  
  // Email Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState(false);
  
  // Test Email
  const [testEmail, setTestEmail] = useState('');
  const [selectedFromEmail, setSelectedFromEmail] = useState('');

  useEffect(() => {
    fetchAuthStatus();
    
    // Handle OAuth callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (success === 'true' && message) {
      toast.success(decodeURIComponent(message));
      fetchAuthStatus(); // Refresh status after successful auth
    } else if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  const fetchAuthStatus = async () => {
    try {
      const response = await api.get('/graph-email/status');
      setAuthStatus(response.data.data);
      setEmailAccounts(response.data.data.emailAccounts || []);
      
      if (response.data.data.isAuthenticated) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to fetch auth status:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/graph-email/templates');
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to load email templates');
    }
  };

  const handleSaveAppConfig = async () => {
    if (!appConfig.clientId || !appConfig.clientSecret) {
      toast.error('Client ID and Client Secret are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/graph-email/configure', appConfig);
      toast.success('Microsoft App configuration saved');
      await fetchAuthStatus();
      setActiveTab('authenticate');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      const response = await api.get('/graph-email/auth-url');
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start authentication');
    }
  };

  const handleAddEmailAccount = () => {
    if (!newAccount.email || !newAccount.displayName) {
      toast.error('Email and display name are required');
      return;
    }

    const updated = [...emailAccounts, { ...newAccount, isDefault: emailAccounts.length === 0 }];
    setEmailAccounts(updated);
    setNewAccount({ email: '', displayName: '' });
  };

  const handleSetDefaultAccount = (email: string) => {
    const updated = emailAccounts.map(acc => ({
      ...acc,
      isDefault: acc.email === email
    }));
    setEmailAccounts(updated);
  };

  const handleRemoveAccount = (email: string) => {
    const updated = emailAccounts.filter(acc => acc.email !== email);
    if (updated.length > 0 && !updated.some(acc => acc.isDefault)) {
      updated[0].isDefault = true;
    }
    setEmailAccounts(updated);
  };

  const handleSaveAccounts = async () => {
    setLoading(true);
    try {
      await api.put('/graph-email/accounts', { accounts: emailAccounts });
      toast.success('Email accounts updated');
      await fetchAuthStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save email accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      await api.put(`/graph-email/templates/${selectedTemplate.id}`, {
        subject: selectedTemplate.subject,
        bodyHtml: selectedTemplate.bodyHtml,
        headerHtml: selectedTemplate.headerHtml,
        footerHtml: selectedTemplate.footerHtml
      });
      toast.success('Template saved successfully');
      setEditingTemplate(false);
      await fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setTesting(true);
    try {
      const response = await api.post('/graph-email/test', {
        toEmail: testEmail,
        fromEmail: selectedFromEmail || undefined
      });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 text-white">
          <Mail className="h-10 w-10 text-orange-500" />
          Microsoft 365 Email Integration
        </h1>
        <p className="text-gray-300 mt-3 text-lg">
          Secure OAuth2 email integration with Microsoft Graph API
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6 bg-gray-900 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {authStatus?.isAuthenticated ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="font-semibold text-green-400 text-lg">Authenticated</p>
                    <p className="text-sm text-gray-300">
                      Connected as: <span className="text-white font-medium">{authStatus.authenticatedEmail}</span>
                    </p>
                  </div>
                </>
              ) : authStatus?.hasClientCredentials ? (
                <>
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-400 text-lg">Authentication Required</p>
                    <p className="text-sm text-gray-300">
                      App configured, please authenticate with Microsoft
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-400 text-lg">Not Configured</p>
                    <p className="text-sm text-gray-300">
                      Please configure Microsoft App registration
                    </p>
                  </div>
                </>
              )}
            </div>
            {authStatus?.hasClientCredentials && !authStatus?.isAuthenticated && (
              <Button onClick={handleAuthenticate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2">
                <LogIn className="h-5 w-5 mr-2" />
                Authenticate with Microsoft
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="authenticate">Authenticate</TabsTrigger>
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Microsoft App Registration
              </CardTitle>
              <CardDescription>
                Configure your Microsoft Azure App registration for OAuth2
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-gray-800 border-gray-700">
                <Shield className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-gray-200">
                  <strong className="text-white">Setup Instructions:</strong>
                  <ol className="mt-3 space-y-2 list-decimal list-inside text-sm">
                    <li className="text-gray-300">Go to <a href="https://portal.azure.com" target="_blank" className="text-blue-400 underline hover:text-blue-300">Azure Portal</a></li>
                    <li className="text-gray-300">Navigate to "App registrations" and create a new app</li>
                    <li className="text-gray-300">Set Redirect URI to: <code className="bg-gray-900 text-orange-400 px-2 py-1 rounded text-xs">{process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}'}/api/graph-email/oauth/callback</code></li>
                    <li className="text-gray-300">Grant API permissions: <span className="text-orange-400">Mail.Send, Mail.ReadWrite, User.Read</span></li>
                    <li className="text-gray-300">Create a client secret and copy the values below</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-gray-200 font-medium">Application (Client) ID *</Label>
                <Input
                  id="clientId"
                  value={appConfig.clientId}
                  onChange={(e) => setAppConfig({ ...appConfig, clientId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret" className="text-gray-200 font-medium">Client Secret *</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={appConfig.clientSecret}
                  onChange={(e) => setAppConfig({ ...appConfig, clientSecret: e.target.value })}
                  placeholder="Enter your client secret"
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantId" className="text-gray-200 font-medium">Directory (Tenant) ID (Optional)</Label>
                <Input
                  id="tenantId"
                  value={appConfig.tenantId}
                  onChange={(e) => setAppConfig({ ...appConfig, tenantId: e.target.value })}
                  placeholder="common (for multi-tenant) or your tenant ID"
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-400">Leave empty to use 'common' for multi-tenant</p>
              </div>

              <Button 
                onClick={handleSaveAppConfig} 
                disabled={loading} 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authenticate Tab */}
        <TabsContent value="authenticate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Microsoft Authentication
              </CardTitle>
              <CardDescription>
                Sign in with your Microsoft 365 account to enable email sending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authStatus?.isAuthenticated ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2 text-white">Successfully Authenticated!</h3>
                  <p className="text-gray-300 mb-4">
                    Connected as: <span className="text-white font-medium">{authStatus.authenticatedEmail}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Token expires: {authStatus.expiresAt ? new Date(authStatus.expiresAt).toLocaleString() : 'Unknown'}
                  </p>
                  <Button onClick={handleAuthenticate} variant="outline" className="mt-4 border-gray-600 text-white hover:bg-gray-800">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-authenticate
                  </Button>
                </div>
              ) : authStatus?.hasClientCredentials ? (
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2 text-white">Ready to Authenticate</h3>
                  <p className="text-gray-300 mb-6">
                    Click the button below to sign in with your Microsoft 365 account
                  </p>
                  <Button onClick={handleAuthenticate} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in with Microsoft
                  </Button>
                </div>
              ) : (
                <Alert className="bg-gray-800 border-gray-700">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription>
                    Please configure your Microsoft App registration first in the Setup tab.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Email Accounts
              </CardTitle>
              <CardDescription>
                Manage which email addresses can be used for sending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {emailAccounts.map((account) => (
                  <div key={account.email} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">{account.displayName}</p>
                        <p className="text-sm text-gray-400">{account.email}</p>
                      </div>
                      {account.isDefault && (
                        <Badge variant="secondary" className="bg-green-600 text-white">Default</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!account.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefaultAccount(account.email)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAccount(account.email)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  placeholder="email@kockysbar.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Input
                  value={newAccount.displayName}
                  onChange={(e) => setNewAccount({ ...newAccount, displayName: e.target.value })}
                  placeholder="Display Name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button onClick={handleAddEmailAccount}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button onClick={handleSaveAccounts} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Accounts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Customize email templates for different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authStatus?.isAuthenticated ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-400 mb-2">{template.subject}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables?.map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">{selectedTemplate.name}</h3>
                        <Button
                          onClick={() => setEditingTemplate(!editingTemplate)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {editingTemplate ? 'Cancel' : 'Edit'}
                        </Button>
                      </div>

                      {editingTemplate ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Subject</Label>
                            <Input
                              value={selectedTemplate.subject}
                              onChange={(e) => setSelectedTemplate({
                                ...selectedTemplate,
                                subject: e.target.value
                              })}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label>Body HTML</Label>
                            <textarea
                              value={selectedTemplate.bodyHtml}
                              onChange={(e) => setSelectedTemplate({
                                ...selectedTemplate,
                                bodyHtml: e.target.value
                              })}
                              className="w-full h-64 bg-gray-800 border-gray-700 text-white rounded-md p-3"
                            />
                          </div>
                          <Button onClick={handleSaveTemplate} disabled={loading}>
                            {loading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Template
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-400 mb-2">Subject: {selectedTemplate.subject}</p>
                          <div
                            className="bg-gray-800 p-4 rounded"
                            dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please authenticate with Microsoft to manage email templates.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Email
              </CardTitle>
              <CardDescription>
                Send a test email to verify your configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From Email</Label>
                <select
                  value={selectedFromEmail}
                  onChange={(e) => setSelectedFromEmail(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2"
                >
                  <option value="">Default ({emailAccounts.find(a => a.isDefault)?.email})</option>
                  {emailAccounts.map((account) => (
                    <option key={account.email} value={account.email}>
                      {account.displayName} ({account.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>To Email</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={handleSendTestEmail}
                disabled={testing || !authStatus?.isConfigured}
                className="w-full"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>

              {!authStatus?.isConfigured && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please complete setup and authentication before sending test emails.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EmailOAuthPage() {
  return (
    <Suspense>
      <EmailOAuthInner />
    </Suspense>
  );
}
