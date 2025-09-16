'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { getEvents, type Event } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAssetUrl } from '@/lib/asset-config';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Only fetch events on client side
    if (typeof window !== 'undefined') {
      fetchEvents();
    }
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      setLoading(true);
      const response = await getEvents({ 
        page: pagination.page, 
        limit: pagination.limit 
      });
      console.log('Events response:', response);
      setEvents(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isUpcoming = (dateString: string) => {
    // Only calculate on client side to avoid hydration mismatches
    if (!isClient) return true; // Default to upcoming during SSR
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Upcoming <span className="text-yellow-500">Events</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join us for exciting events, live music, special dinners, and more at Kocky's Bar & Grill
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="container mx-auto px-4 py-16">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-24 w-24 text-gray-600 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">No Events Scheduled</h2>
            <p className="text-gray-300 mb-8">
              We're working on some exciting events for you. Check back soon!
            </p>
            <Button
              onClick={() => router.push('/contact')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Contact Us for Private Events
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-6">
                    {/* Event Image */}
                    {event.heroImageUrl && (
                      <div className="mb-6 overflow-hidden rounded-lg">
                        <img 
                          src={getAssetUrl(event.heroImageUrl)}
                          alt={event.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Event Date Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`${isUpcoming(event.startAt) ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                        {isUpcoming(event.startAt) ? 'Upcoming' : 'Past'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Users className="h-4 w-4" />
                        {event._count?.rsvps || 0} RSVPs
                      </div>
                    </div>

                    {/* Event Title */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-500 transition-colors">
                      {event.title}
                    </h3>

                    {/* Event Date & Time */}
                    <div className="flex items-center gap-2 mb-3 text-gray-300">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">{formatDate(event.startAt)}</span>
                    </div>

                    {/* Event Location */}
                    {event.venueName && (
                      <div className="flex items-center gap-2 mb-4 text-gray-300">
                        <MapPin className="h-5 w-5 text-yellow-500" />
                        <span className="truncate">{event.venueName}</span>
                      </div>
                    )}

                    {/* Event Description */}
                    {event.description && (
                      <p className="text-gray-400 mb-6 line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    {/* Action Button */}
                    <Link href={`/events/${event.slug}`}>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white group-hover:bg-yellow-500 transition-colors">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                    fetchEvents();
                  }}
                  disabled={pagination.page === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                
                <span className="text-gray-300 px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <Button
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                    fetchEvents();
                  }}
                  disabled={pagination.page === pagination.pages}
                  className="bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Planning a Private Event?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Let us help you create an unforgettable experience for your special occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/contact')}
              className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
            >
              Contact Us
            </Button>
            <Button
              onClick={() => router.push('/services/catering')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-yellow-600 px-8 py-3 rounded-lg font-semibold"
            >
              View Catering Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



