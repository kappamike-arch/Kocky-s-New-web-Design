'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Edit, 
  Image as ImageIcon, 
  Type, 
  Link2, 
  Loader2,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'image' | 'hero' | 'link';
  value: any;
  description?: string;
}

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, ContentSection>>({});
  const [onlineOrderingUrl, setOnlineOrderingUrl] = useState('');
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    fromName: '',
    emailLogo: '',
    emailFooter: ''
  });

  // Sample content sections
  const contentSections: ContentSection[] = [
    {
      id: 'hero_home',
      title: 'Home Page Hero',
      type: 'hero',
      value: {
        title: "Welcome to Kocky's",
        subtitle: 'Bar & Grill',
        description: 'Where Great Food Meets Unforgettable Moments',
        image: '/images/home-hero.jpg',
        video: null
      }
    },
    {
      id: 'about_text',
      title: 'About Us Text',
      type: 'text',
      value: 'Family owned and operated since 2010, Kocky\'s Bar & Grill has been serving the community with delicious food and great times.',
      description: 'This text appears on the About section of the homepage'
    },
    {
      id: 'happy_hour_times',
      title: 'Happy Hour Times',
      type: 'text',
      value: 'Monday - Friday: 3PM - 6PM\nSaturday - Sunday: 2PM - 5PM',
      description: 'Display times for Happy Hour specials'
    },
    {
      id: 'location_address',
      title: 'Location Address',
      type: 'text',
      value: '123 Main Street\nCity, State 12345',
      description: 'Physical address displayed on website'
    },
    {
      id: 'contact_phone',
      title: 'Contact Phone',
      type: 'text',
      value: '(555) 123-4567',
      description: 'Main contact phone number'
    },
    {
      id: 'contact_email',
      title: 'Contact Email',
      type: 'text',
      value: 'info@kockysbar.com',
      description: 'Main contact email address'
    },
    {
      id: 'online_ordering_url',
      title: 'Online Ordering URL',
      type: 'link',
      value: '',
      description: 'ChowNow, Toast, or other ordering platform URL'
    },
    {
      id: 'facebook_url',
      title: 'Facebook Page',
      type: 'link',
      value: 'https://facebook.com/kockysbar',
      description: 'Facebook page URL'
    },
    {
      id: 'instagram_url',
      title: 'Instagram Profile',
      type: 'link',
      value: 'https://instagram.com/kockysbar',
      description: 'Instagram profile URL'
    }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch settings
      const response = await fetch('https://api.staging.kockys.com/api/settings');
      const data = await response.json();
      
      if (data) {
        // Map settings to content sections
        const mappedContent: Record<string, ContentSection> = {};
        contentSections.forEach(section => {
          mappedContent[section.id] = {
            ...section,
            value: data[section.id] || section.value
          };
        });
        
        setContent(mappedContent);
        setOnlineOrderingUrl(data.onlineOrderingUrl || '');
        
        // Set email settings
        setEmailSettings({
          smtpHost: data.smtpHost || '',
          smtpPort: data.smtpPort || '',
          smtpUser: data.smtpUser || '',
          fromName: data.emailFromName || 'Kocky\'s Bar & Grill',
          emailLogo: data.emailLogo || '',
          emailFooter: data.emailFooter || '© 2024 Kocky\'s Bar & Grill'
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
      
      // Use default content
      const defaultContent: Record<string, ContentSection> = {};
      contentSections.forEach(section => {
        defaultContent[section.id] = section;
      });
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (sectionId: string, newValue: any) => {
    setSaving(sectionId);
    
    try {
      const response = await fetch('https://api.staging.kockys.com/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [sectionId]: newValue
        })
      });

      if (response.ok) {
        toast.success('Content updated successfully');
        setContent(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            value: newValue
          }
        }));
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(null);
    }
  };

  const saveOnlineOrderingUrl = async () => {
    setSaving('online_ordering');
    
    try {
      const response = await fetch('https://api.staging.kockys.com/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onlineOrderingUrl: onlineOrderingUrl
        })
      });

      if (response.ok) {
        toast.success('Online ordering URL updated');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving URL:', error);
      toast.error('Failed to save online ordering URL');
    } finally {
      setSaving(null);
    }
  };

  const saveEmailSettings = async () => {
    setSaving('email_settings');
    
    try {
      const response = await fetch('https://api.staging.kockys.com/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });

      if (response.ok) {
        toast.success('Email settings updated');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setSaving(null);
    }
  };

  const testEmailConfiguration = async () => {
    try {
      const response = await fetch('https://api.staging.kockys.com/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailSettings.smtpUser,
          subject: 'Test Email Configuration',
          includePaymentLink: true
        })
      });

      if (response.ok) {
        toast.success('Test email sent! Check your inbox.');
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('Failed to send test email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Content Management</h1>
        <p className="text-gray-400">Manage all website content, sample data, and integrations</p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="content">Website Content</TabsTrigger>
          <TabsTrigger value="ordering">Online Ordering</TabsTrigger>
          <TabsTrigger value="email">Email & Payments</TabsTrigger>
        </TabsList>

        {/* Website Content Tab */}
        <TabsContent value="content">
          <div className="grid gap-6">
            {Object.values(content).map((section) => (
              <Card key={section.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-100 flex items-center gap-2">
                    {section.type === 'text' && <Type className="h-5 w-5" />}
                    {section.type === 'image' && <ImageIcon className="h-5 w-5" />}
                    {section.type === 'hero' && <ImageIcon className="h-5 w-5" />}
                    {section.type === 'link' && <Link2 className="h-5 w-5" />}
                    {section.title}
                  </CardTitle>
                  {section.description && (
                    <p className="text-sm text-gray-400">{section.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {section.type === 'text' && (
                    <div className="space-y-4">
                      <Textarea
                        value={section.value}
                        onChange={(e) => {
                          setContent(prev => ({
                            ...prev,
                            [section.id]: {
                              ...prev[section.id],
                              value: e.target.value
                            }
                          }));
                        }}
                        className="bg-gray-800 border-gray-700 text-gray-100"
                        rows={4}
                      />
                      <Button
                        onClick={() => saveContent(section.id, section.value)}
                        disabled={saving === section.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {saving === section.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}

                  {section.type === 'link' && (
                    <div className="space-y-4">
                      <Input
                        value={section.value}
                        onChange={(e) => {
                          setContent(prev => ({
                            ...prev,
                            [section.id]: {
                              ...prev[section.id],
                              value: e.target.value
                            }
                          }));
                        }}
                        placeholder="Enter URL"
                        className="bg-gray-800 border-gray-700 text-gray-100"
                      />
                      <Button
                        onClick={() => saveContent(section.id, section.value)}
                        disabled={saving === section.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {saving === section.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save URL
                      </Button>
                    </div>
                  )}

                  {section.type === 'hero' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Title</Label>
                        <Input
                          value={section.value.title}
                          onChange={(e) => {
                            setContent(prev => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                value: {
                                  ...prev[section.id].value,
                                  title: e.target.value
                                }
                              }
                            }));
                          }}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Subtitle</Label>
                        <Input
                          value={section.value.subtitle}
                          onChange={(e) => {
                            setContent(prev => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                value: {
                                  ...prev[section.id].value,
                                  subtitle: e.target.value
                                }
                              }
                            }));
                          }}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Description</Label>
                        <Textarea
                          value={section.value.description}
                          onChange={(e) => {
                            setContent(prev => ({
                              ...prev,
                              [section.id]: {
                                ...prev[section.id],
                                value: {
                                  ...prev[section.id].value,
                                  description: e.target.value
                                }
                              }
                            }));
                          }}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                          rows={2}
                        />
                      </div>
                      <Button
                        onClick={() => saveContent(section.id, section.value)}
                        disabled={saving === section.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {saving === section.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Hero Content
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Online Ordering Tab */}
        <TabsContent value="ordering">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Online Ordering Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Supported Platforms:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                      <li>ChowNow: https://ordering.chownow.com/order/...</li>
                      <li>Toast: https://www.toasttab.com/...</li>
                      <li>Square: https://square.link/...</li>
                      <li>Custom ordering system URL</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="ordering-url" className="text-gray-300">Online Ordering URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="ordering-url"
                    value={onlineOrderingUrl}
                    onChange={(e) => setOnlineOrderingUrl(e.target.value)}
                    placeholder="https://ordering.chownow.com/order/..."
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                  {onlineOrderingUrl && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(onlineOrderingUrl, '_blank')}
                      className="border-gray-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="embed-mode" defaultChecked />
                <Label htmlFor="embed-mode" className="text-gray-300">
                  Embed ordering in website (iframe)
                </Label>
              </div>

              <Button
                onClick={saveOnlineOrderingUrl}
                disabled={saving === 'online_ordering'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving === 'online_ordering' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Ordering Configuration
              </Button>

              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-medium text-gray-200 mb-2">Test Configuration</h4>
                <p className="text-sm text-gray-400 mb-4">
                  After saving, visit the Order Online page to test the integration.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://staging.kockys.com/order', '_blank')}
                  className="border-gray-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Order Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email & Payments Tab */}
        <TabsContent value="email">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Email & Payment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host" className="text-gray-300">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.office365.com"
                      className="bg-gray-800 border-gray-700 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port" className="text-gray-300">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                      placeholder="587"
                      className="bg-gray-800 border-gray-700 text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtp-user" className="text-gray-300">Email Address</Label>
                  <Input
                    id="smtp-user"
                    type="email"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="your-email@yourdomain.com"
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="from-name" className="text-gray-300">From Name</Label>
                  <Input
                    id="from-name"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="Kocky's Bar & Grill"
                    className="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="email-footer" className="text-gray-300">Email Footer Text</Label>
                  <Textarea
                    id="email-footer"
                    value={emailSettings.emailFooter}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFooter: e.target.value }))}
                    placeholder="© 2024 Kocky's Bar & Grill | 123 Main Street"
                    className="bg-gray-800 border-gray-700 text-gray-100"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveEmailSettings}
                  disabled={saving === 'email_settings'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving === 'email_settings' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Email Settings
                </Button>

                <Button
                  variant="outline"
                  onClick={testEmailConfiguration}
                  className="border-gray-700"
                >
                  Send Test Email
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-medium text-gray-200 mb-4">Payment Link Integration</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <p className="font-medium mb-1">Stripe Integration Active</p>
                        <p className="text-gray-400">
                          Payment links are automatically generated when creating quotes.
                          Configure your Stripe keys in the environment variables.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Test Payment Flow:</h5>
                    <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1">
                      <li>Submit a test inquiry from the frontend</li>
                      <li>Create a quote in the CRM with a payment amount</li>
                      <li>Send the quote email to the customer</li>
                      <li>Click the payment link in the email</li>
                      <li>Complete the test payment with Stripe test card: 4242 4242 4242 4242</li>
                    </ol>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => window.open('https://staging.kockys.com/admin/crm', '_blank')}
                    className="border-gray-700"
                  >
                    Open CRM to Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
