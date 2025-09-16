'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, EyeOff, Upload, X, Copy, ExternalLink } from 'lucide-react';
import { getEvent, updateEvent, uploadEventImage, uploadEventVideo, type Event, type CreateEventData } from '../../../lib/api/events';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    venueName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    videoUrl: '',
    isPublished: false
  });
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await getEvent(eventId);
      const eventData = response.data;
      setEvent(eventData);
      
      // Format dates for datetime-local input
      const startAt = new Date(eventData.startAt);
      const endAt = eventData.endAt ? new Date(eventData.endAt) : '';
      
      setFormData({
        title: eventData.title,
        description: eventData.description || '',
        startAt: startAt.toISOString().slice(0, 16),
        endAt: endAt ? new Date(endAt).toISOString().slice(0, 16) : '',
        venueName: eventData.venueName || '',
        addressLine1: eventData.addressLine1 || '',
        addressLine2: eventData.addressLine2 || '',
        city: eventData.city || '',
        state: eventData.state || '',
        zip: eventData.zip || '',
        videoUrl: eventData.videoUrl || '',
        isPublished: eventData.isPublished
      });

      // Set existing image preview
      if (eventData.heroImageUrl) {
        setHeroImagePreview(`http://72.167.227.205:5001${eventData.heroImageUrl}`);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateEventData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setHeroImage(null);
    setHeroImagePreview('');
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startAt) {
      alert('Title and start date are required');
      return;
    }

    try {
      setSaving(true);
      
      // Upload video first if provided
      if (videoFile) {
        const videoResponse = await uploadEventVideo(videoFile);
        formData.videoUrl = videoResponse.data.url;
      }
      
      // Update event with image
      await updateEvent(eventId, formData, heroImage || undefined);
      
      router.push('/events');
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getPublicEventUrl = () => {
    if (!event) return '';
    return `http://72.167.227.205:3003/events/${event.slug}`;
  };

  const getICSUrl = () => {
    if (!event) return '';
    return `http://72.167.227.205:5001/api/events/${event.id}/ics`;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-h1">Edit Event</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="admin-loading">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-h1">Event Not Found</h1>
        </div>
        <Card className="admin-card">
          <div className="p-6 text-center">
            <p className="admin-help">The event you're looking for doesn't exist.</p>
            <Button 
              onClick={() => router.push('/events')}
              className="admin-button admin-button-primary mt-4"
            >
              Back to Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            className="admin-button admin-button-secondary"
          >
            <ArrowLeft className="admin-icon" />
            Back
          </Button>
          <div>
            <h1 className="admin-h1">Edit Event</h1>
            <p className="admin-help">Update event details and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="admin-card">
              <div className="p-6">
                <h2 className="admin-h2 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="admin-label">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter event title"
                      className="admin-input"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="admin-label">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your event..."
                      className="admin-input"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startAt" className="admin-label">Start Date & Time *</Label>
                      <Input
                        id="startAt"
                        type="datetime-local"
                        value={formData.startAt}
                        onChange={(e) => handleInputChange('startAt', e.target.value)}
                        className="admin-input"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="endAt" className="admin-label">End Date & Time</Label>
                      <Input
                        id="endAt"
                        type="datetime-local"
                        value={formData.endAt}
                        onChange={(e) => handleInputChange('endAt', e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Information */}
            <Card className="admin-card">
              <div className="p-6">
                <h2 className="admin-h2 mb-4">Location Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="venueName" className="admin-label">Venue Name</Label>
                    <Input
                      id="venueName"
                      value={formData.venueName}
                      onChange={(e) => handleInputChange('venueName', e.target.value)}
                      placeholder="Enter venue name"
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="admin-label">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder="Street address"
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="admin-label">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder="Apartment, suite, etc."
                      className="admin-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="admin-label">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state" className="admin-label">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="zip" className="admin-label">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        placeholder="ZIP"
                        className="admin-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Status & Stats */}
            <Card className="admin-card">
              <div className="p-6">
                <h2 className="admin-h2 mb-4">Event Status</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="admin-label">Status</span>
                    <Badge 
                      className={event.isPublished ? 'admin-status admin-status-success' : 'admin-status admin-status-warning'}
                    >
                      {event.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="admin-label">RSVPs</span>
                    <span className="admin-help">{event._count?.rsvps || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="admin-label">Created</span>
                    <span className="admin-help text-sm">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Share Links */}
            <Card className="admin-card">
              <div className="p-6">
                <h2 className="admin-h2 mb-4">Share Links</h2>
                
                <div className="space-y-3">
                  <div>
                    <Label className="admin-label text-sm">Public Event URL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={getPublicEventUrl()}
                        readOnly
                        className="admin-input text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => copyToClipboard(getPublicEventUrl())}
                        className="admin-button admin-button-secondary"
                        size="sm"
                      >
                        <Copy className="admin-icon" size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="admin-label text-sm">ICS Calendar File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={getICSUrl()}
                        readOnly
                        className="admin-input text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => copyToClipboard(getICSUrl())}
                        className="admin-button admin-button-secondary"
                        size="sm"
                      >
                        <Copy className="admin-icon" size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={() => window.open(getPublicEventUrl(), '_blank')}
                    className="admin-button admin-button-secondary w-full"
                    size="sm"
                  >
                    <ExternalLink className="admin-icon" size={16} />
                    Preview Event
                  </Button>
                </div>
              </div>
            </Card>

            {/* Media Upload */}
            <Card className="admin-card">
              <div className="p-6">
                <h2 className="admin-h2 mb-4">Media</h2>
                
                <div className="space-y-4">
                  {/* Hero Image */}
                  <div>
                    <Label className="admin-label">Hero Image</Label>
                    {heroImagePreview ? (
                      <div className="relative">
                        <img 
                          src={heroImagePreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <Button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 admin-button admin-button-danger"
                          size="sm"
                        >
                          <X className="admin-icon" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="admin-icon mx-auto mb-2 opacity-50" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="heroImage"
                        />
                        <Label htmlFor="heroImage" className="admin-button admin-button-secondary cursor-pointer">
                          Upload Image
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div>
                    <Label className="admin-label">Video (Optional)</Label>
                    {videoPreview ? (
                      <div className="relative">
                        <video 
                          src={videoPreview} 
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          controls
                        />
                        <Button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-2 right-2 admin-button admin-button-danger"
                          size="sm"
                        >
                          <X className="admin-icon" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="admin-icon mx-auto mb-2 opacity-50" />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          id="videoFile"
                        />
                        <Label htmlFor="videoFile" className="admin-button admin-button-secondary cursor-pointer">
                          Upload Video
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* External Video URL */}
                  <div>
                    <Label htmlFor="videoUrl" className="admin-label">Or Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Publish Settings */}
            <Card className="admin-card">
              <div className="p-6">
                <h2 className="admin-h2 mb-4">Publish Settings</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="admin-label">Publish Event</Label>
                    <p className="admin-help text-sm">Make this event visible to the public</p>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                  />
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="admin-card">
              <div className="p-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="admin-button admin-button-primary w-full"
                  >
                    <Save className="admin-icon" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    className="admin-button admin-button-secondary w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}













