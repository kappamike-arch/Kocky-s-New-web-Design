'use client';

import { useState, useEffect } from 'react';
import { UPLOADS_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { getEvents, deleteEvent, toggleEventPublish, type Event } from '../../lib/api/events';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents({ 
        page: pagination.page, 
        limit: pagination.limit 
      });
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

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete.id);
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleTogglePublish = async (event: Event) => {
    try {
      const response = await toggleEventPublish(event.id);
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, isPublished: response.data.isPublished } : e
      ));
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-h1">Events Management</h1>
          <p className="admin-help">Manage your restaurant events and RSVPs</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="admin-loading">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-h1">Events Management</h1>
          <p className="admin-help">Manage your restaurant events and RSVPs</p>
        </div>
        <Button 
          onClick={() => router.push('/events/new')}
          className="admin-button admin-button-primary"
        >
          <Plus className="admin-icon" />
          Create Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="admin-card">
          <div className="text-center py-12">
            <Calendar className="admin-icon mx-auto mb-4 opacity-50" size={48} />
            <h3 className="admin-h3 mb-2">No Events Yet</h3>
            <p className="admin-help mb-6">Create your first event to start managing RSVPs and promoting your restaurant.</p>
            <Button 
              onClick={() => router.push('/events/new')}
              className="admin-button admin-button-primary"
            >
              <Plus className="admin-icon" />
              Create Your First Event
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="admin-card">
              <div className="p-6">
                {/* Event Image */}
                {event.heroImageUrl && (
                  <div className="mb-4">
                    <img 
                      src={`${UPLOADS_URL}${event.heroImageUrl}`}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Event Status */}
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    className={event.isPublished ? 'admin-status admin-status-success' : 'admin-status admin-status-warning'}
                  >
                    {event.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm admin-help">
                    <Users className="admin-icon" size={16} />
                    {event._count?.rsvps || 0} RSVPs
                  </div>
                </div>

                {/* Event Title */}
                <h3 className="admin-h3 mb-2 line-clamp-2">{event.title}</h3>

                {/* Event Date & Time */}
                <div className="flex items-center gap-2 mb-2 text-sm admin-help">
                  <Clock className="admin-icon" size={16} />
                  {formatDate(event.startAt)}
                </div>

                {/* Event Location */}
                {event.venueName && (
                  <div className="flex items-center gap-2 mb-3 text-sm admin-help">
                    <MapPin className="admin-icon" size={16} />
                    <span className="truncate">{event.venueName}</span>
                  </div>
                )}

                {/* Event Description */}
                {event.description && (
                  <p className="admin-help text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="admin-button admin-button-secondary flex-1"
                    size="sm"
                  >
                    <Edit className="admin-icon" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => handleTogglePublish(event)}
                    className={`admin-button ${event.isPublished ? 'admin-button-warning' : 'admin-button-success'}`}
                    size="sm"
                  >
                    {event.isPublished ? <EyeOff className="admin-icon" /> : <Eye className="admin-icon" />}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setEventToDelete(event);
                      setDeleteDialogOpen(true);
                    }}
                    className="admin-button admin-button-danger"
                    size="sm"
                  >
                    <Trash2 className="admin-icon" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={() => {
              setPagination(prev => ({ ...prev, page: prev.page - 1 }));
              fetchEvents();
            }}
            disabled={pagination.page === 1}
            className="admin-button admin-button-secondary"
          >
            Previous
          </Button>
          
          <span className="admin-help">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <Button
            onClick={() => {
              setPagination(prev => ({ ...prev, page: prev.page + 1 }));
              fetchEvents();
            }}
            disabled={pagination.page === pagination.pages}
            className="admin-button admin-button-secondary"
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone and will also delete all associated RSVPs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="admin-button admin-button-danger"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}













