'use client';

import { useState, useEffect, useRef } from 'react';
import { calendarAPI } from '@/lib/api/calendar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  RefreshCw,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  Truck,
  Wine,
  Utensils,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  type: 'reservation' | 'food-truck' | 'mobile-bar' | 'catering';
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  location?: string;
  guestCount?: number;
  description?: string;
  color?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const calendarRef = useRef<FullCalendar>(null);
  
  const subscriptionUrl = calendarAPI.getICalUrl();

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [filterType]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType !== 'all') {
        params.type = filterType;
      }
      
      const response = await calendarAPI.getEvents(params);
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await calendarAPI.getStats();
      setStats(response.data.stats || response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const copySubscriptionUrl = () => {
    navigator.clipboard.writeText(subscriptionUrl);
    toast.success('Subscription URL copied to clipboard!');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'food-truck':
        return <Truck className="h-4 w-4" />;
      case 'mobile-bar':
        return <Wine className="h-4 w-4" />;
      case 'catering':
        return <Utensils className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'WON':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'LOST':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* FullCalendar cursor overrides - inline styles for maximum specificity */}
      <style jsx global>{`
        .fc .fc-event,
        .fc .fc-daygrid-event,
        .fc .fc-timegrid-event,
        .fc .fc-h-event,
        .fc .fc-v-event,
        .fc-event,
        .fc-daygrid-event,
        .fc-timegrid-event,
        .fc-h-event,
        .fc-v-event,
        .fc .fc-daygrid-day-events,
        .fc .fc-daygrid-event-harness,
        .fc .fc-event-main,
        .fc .fc-event-main-frame,
        .fc-daygrid-day-events,
        .fc-daygrid-event-harness,
        .fc-event-main,
        .fc-event-main-frame {
          cursor: pointer !important;
        }
        
        .fc .fc-daygrid-day,
        .fc .fc-daygrid-day-frame,
        .fc .fc-daygrid-day-top,
        .fc .fc-daygrid-day-number,
        .fc-daygrid-day,
        .fc-daygrid-day-frame,
        .fc-daygrid-day-top,
        .fc-daygrid-day-number {
          cursor: pointer !important;
        }
      `}</style>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Event Calendar</h1>
        <p className="text-muted-foreground">View and manage all reservations, bookings, and events</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">Today's Events</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.today.reservations} reservations, {stats.today.foodTruck} food truck, {stats.today.mobileBar} mobile bar
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.thisWeek.reservations} res, {stats.thisWeek.foodTruck} FT, {stats.thisWeek.mobileBar} MB
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                All upcoming events
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending.total}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Requires confirmation
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Calendar</CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="reservation">Reservations</SelectItem>
                  <SelectItem value="food-truck">Food Truck</SelectItem>
                  <SelectItem value="mobile-bar">Mobile Bar</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={fetchEvents} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-muted-foreground">Loading calendar...</div>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              events={events.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                backgroundColor: event.color,
                borderColor: event.color,
                extendedProps: event,
              }))}
              eventClick={handleEventClick}
              eventDisplay="block"
              height="auto"
              dayMaxEvents={3}
              moreLinkClick="popover"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Calendar Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to this calendar in your personal calendar app (Google Calendar, Apple Calendar, Outlook, etc.)
          </p>
          <div className="flex gap-2">
            <Input 
              value={subscriptionUrl} 
              readOnly 
              className="flex-1"
            />
            <Button onClick={copySubscriptionUrl} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <a href={subscriptionUrl} download="kockys-events.ics">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download .ics
              </Button>
            </a>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p><strong>How to subscribe:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Google Calendar:</strong> Settings → Add calendar → From URL → Paste the URL above</li>
              <li><strong>Apple Calendar:</strong> File → New Calendar Subscription → Paste the URL above</li>
              <li><strong>Outlook:</strong> Add Calendar → Subscribe from web → Paste the URL above</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getEventIcon(selectedEvent.type)}
                  <CardTitle>{selectedEvent.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {selectedEvent.type.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedEvent.start), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedEvent.start), 'h:mm a')} - 
                      {format(new Date(selectedEvent.end), 'h:mm a')}
                    </span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  {selectedEvent.guestCount && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.guestCount} guests</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t">
                  <p className="font-medium mb-2">Customer Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedEvent.customerEmail}`} className="hover:underline">
                        {selectedEvent.customerEmail}
                      </a>
                    </div>
                    {selectedEvent.customerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedEvent.customerPhone}`} className="hover:underline">
                          {selectedEvent.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <div className="pt-3 border-t">
                    <p className="font-medium mb-2">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
