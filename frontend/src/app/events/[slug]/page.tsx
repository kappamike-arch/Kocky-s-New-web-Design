'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { getEventBySlug, createRSVP, subscribeToReminders, getICSFileUrl, generateGoogleCalendarUrl, generateAppleCalendarUrl, generateOutlookCalendarUrl, type Event, type RSVPData } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getAssetUrl } from '@/lib/asset-config';

function EventDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [rsvpData, setRsvpData] = useState<RSVPData>({
    name: '',
    email: '',
    phone: '',
    wantsSms: false,
    wantsEmail: true
  });
  const [reminderData, setReminderData] = useState({
    email: '',
    phone: '',
    wantsSms: false,
    wantsEmail: true
  });

  useEffect(() => {
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await getEventBySlug(slug);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !rsvpData.name || !rsvpData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      setRsvpLoading(true);
      const response = await createRSVP(event.id, rsvpData);
      if (response.success) {
        setRsvpSuccess(true);
        setRsvpData({ name: '', email: '', phone: '', wantsSms: false, wantsEmail: true });
      } else {
        throw new Error(response.message || 'Failed to create RSVP');
      }
    } catch (error) {
      console.error('Failed to create RSVP:', error);
      alert(`Failed to RSVP: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || (!reminderData.email && !reminderData.phone)) {
      alert('Email or phone is required');
      return;
    }

    try {
      setReminderLoading(true);
      const response = await subscribeToReminders(event.id, reminderData);
      if (response.success) {
        setReminderSuccess(true);
        setReminderData({ email: '', phone: '', wantsSms: false, wantsEmail: true });
      } else {
        throw new Error(response.message || 'Failed to subscribe to reminders');
      }
    } catch (error) {
      console.error('Failed to subscribe to reminders:', error);
      alert(`Failed to subscribe to reminders: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setReminderLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Event Not Found</h1>
            <p className="text-gray-300 mb-8">The event you're looking for doesn't exist.</p>
            <Button
              onClick={() => router.push('/events')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Button
          onClick={() => router.back()}
          className="bg-gray-700 hover:bg-gray-600 text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Event Media */}
          <div className="space-y-6">
            {event.heroImageUrl && (
              <div className="overflow-hidden rounded-2xl">
                <img 
                  src={getAssetUrl(event.heroImageUrl)}
                  alt={event.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}
            
            {event.videoUrl && (
              <div className="overflow-hidden rounded-2xl">
                <video 
                  src={getAssetUrl(event.videoUrl)}
                  controls
                  className="w-full h-96 object-cover"
                />
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            {/* Event Status */}
            <div className="flex items-center gap-4">
              <Badge className={`${isUpcoming(event.startAt) ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                {isUpcoming(event.startAt) ? 'Upcoming' : 'Past Event'}
              </Badge>
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="h-5 w-5" />
                {event._count?.rsvps || 0} RSVPs
              </div>
            </div>

            {/* Event Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {event.title}
            </h1>

            {/* Event Date & Time */}
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-lg">{formatDate(event.startAt)}</p>
                {event.endAt && (
                  <p className="text-sm">Ends at {formatTime(event.endAt)}</p>
                )}
              </div>
            </div>

            {/* Event Location */}
            {event.venueName && (
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <p className="font-semibold text-lg">{event.venueName}</p>
                  {event.addressLine1 && (
                    <p className="text-sm">{event.addressLine1}</p>
                  )}
                  {event.addressLine2 && (
                    <p className="text-sm">{event.addressLine2}</p>
                  )}
                  {(event.city || event.state || event.zip) && (
                    <p className="text-sm">
                      {[event.city, event.state, event.zip].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Event Description */}
            {event.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Add to Calendar */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Add to Calendar</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => window.open(generateGoogleCalendarUrl(event), '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  onClick={() => window.open(generateAppleCalendarUrl(event), '_blank')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apple
                </Button>
                <Button
                  onClick={() => window.open(generateOutlookCalendarUrl(event), '_blank')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Outlook
                </Button>
                <Button
                  onClick={() => window.open(getICSFileUrl(event.id), '_blank')}
                  className="bg-gray-700 hover:bg-gray-800 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP and Reminders Section */}
      {isUpcoming(event.startAt) && (
        <div className="bg-gray-800/50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* RSVP Form */}
              <Card className="bg-gray-800/50 border-gray-700">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">RSVP for This Event</h2>
                  
                  {rsvpSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">RSVP Confirmed!</h3>
                      <p className="text-gray-300">Thank you for RSVPing. We'll see you at the event!</p>
                    </div>
                  ) : (
                    <form onSubmit={handleRSVPSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="rsvp-name" className="text-white">Name *</Label>
                        <Input
                          id="rsvp-name"
                          value={rsvpData.name}
                          onChange={(e) => setRsvpData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="rsvp-email" className="text-white">Email *</Label>
                        <Input
                          id="rsvp-email"
                          type="email"
                          value={rsvpData.email}
                          onChange={(e) => setRsvpData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="rsvp-phone" className="text-white">Phone (Optional)</Label>
                        <Input
                          id="rsvp-phone"
                          type="tel"
                          value={rsvpData.phone}
                          onChange={(e) => setRsvpData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="rsvp-email-notifications"
                            checked={rsvpData.wantsEmail}
                            onChange={(e) => setRsvpData(prev => ({ ...prev, wantsEmail: e.target.checked }))}
                            className="rounded border-gray-600 bg-gray-700 text-yellow-500"
                          />
                          <Label htmlFor="rsvp-email-notifications" className="text-gray-300">
                            Send me email updates about this event
                          </Label>
                        </div>
                        
                        {rsvpData.phone && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="rsvp-sms-notifications"
                              checked={rsvpData.wantsSms}
                              onChange={(e) => setRsvpData(prev => ({ ...prev, wantsSms: e.target.checked }))}
                              className="rounded border-gray-600 bg-gray-700 text-yellow-500"
                            />
                            <Label htmlFor="rsvp-sms-notifications" className="text-gray-300">
                              Send me SMS reminders
                            </Label>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={rsvpLoading}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {rsvpLoading ? 'RSVPing...' : 'RSVP Now'}
                      </Button>
                    </form>
                  )}
                </div>
              </Card>

              {/* Reminders Form */}
              <Card className="bg-gray-800/50 border-gray-700">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Get Event Reminders</h2>
                  
                  {reminderSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Reminders Set!</h3>
                      <p className="text-gray-300">We'll send you reminders before the event.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReminderSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="reminder-email" className="text-white">Email</Label>
                        <Input
                          id="reminder-email"
                          type="email"
                          value={reminderData.email}
                          onChange={(e) => setReminderData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="reminder-phone" className="text-white">Phone</Label>
                        <Input
                          id="reminder-phone"
                          type="tel"
                          value={reminderData.phone}
                          onChange={(e) => setReminderData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reminder-email-notifications"
                            checked={reminderData.wantsEmail}
                            onChange={(e) => setReminderData(prev => ({ ...prev, wantsEmail: e.target.checked }))}
                            className="rounded border-gray-600 bg-gray-700 text-yellow-500"
                          />
                          <Label htmlFor="reminder-email-notifications" className="text-gray-300">
                            Email reminders
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reminder-sms-notifications"
                            checked={reminderData.wantsSms}
                            onChange={(e) => setReminderData(prev => ({ ...prev, wantsSms: e.target.checked }))}
                            className="rounded border-gray-600 bg-gray-700 text-yellow-500"
                          />
                          <Label htmlFor="reminder-sms-notifications" className="text-gray-300">
                            SMS reminders
                          </Label>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={reminderLoading}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                      >
                        {reminderLoading ? 'Setting Reminders...' : 'Set Reminders'}
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <ErrorBoundary>
      <EventDetailPageContent />
    </ErrorBoundary>
  );
}




