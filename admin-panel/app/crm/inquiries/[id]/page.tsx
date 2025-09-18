'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  Edit,
  Save,
  Plus,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { crmAPI } from '@/lib/api/crm';

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchInquiry();
  }, [params.id]);

  const fetchInquiry = async () => {
    try {
      const response = await crmAPI.getInquiryById(params.id as string);
      console.log('Inquiry response:', response);
      if (response.data && response.data.success) {
        setInquiry(response.data.data);
        setEditData(response.data.data);
      } else if (response.data) {
        // Handle if the data is directly in response.data without success wrapper
        setInquiry(response.data);
        setEditData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch inquiry:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load inquiry details';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await crmAPI.updateInquiry(params.id as string, {
        status: editData.status,
        priority: editData.priority,
        assignedTo: editData.assignedTo,
      });

      if (response.data) {
        toast.success('Inquiry updated successfully');
        setEditMode(false);
        fetchInquiry();
      }
    } catch (error: any) {
      console.error('Failed to update inquiry:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update inquiry';
      toast.error(errorMessage);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setAddingNote(true);
    try {
      const response = await crmAPI.addNote(params.id as string, newNote, true);

      if (response.data) {
        toast.success('Note added successfully');
        setNewNote('');
        fetchInquiry();
      }
    } catch (error: any) {
      console.error('Failed to add note:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add note';
      toast.error(errorMessage);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Loading inquiry details...</div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Inquiry not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/crm">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to CRM
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{inquiry.name}</h1>
              <p className="text-muted-foreground">
                {inquiry.confirmationCode && `#${inquiry.confirmationCode} • `}
                Created {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button onClick={handleUpdate} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)} size="sm">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Link href={`/crm/inquiries/${params.id}/quote`}>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Create Quote
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Inquiry Details */}
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium">{inquiry.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Message</Label>
                <p className="whitespace-pre-wrap">{inquiry.message}</p>
              </div>
              {inquiry.eventDate && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Event Date</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(inquiry.eventDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  {inquiry.guestCount && (
                    <div>
                      <Label className="text-muted-foreground">Guest Count</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {inquiry.guestCount} guests
                      </p>
                    </div>
                  )}
                </div>
              )}
              {inquiry.eventLocation && (
                <div>
                  <Label className="text-muted-foreground">Event Location</Label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {inquiry.eventLocation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Quotes</CardTitle>
                <Link href={`/crm/inquiries/${params.id}/quote`}>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Quote
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {inquiry.quotes && inquiry.quotes.length > 0 ? (
                <div className="space-y-4">
                  {inquiry.quotes.map((quote: any) => (
                    <div key={quote.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{quote.quoteNumber}</span>
                            <Badge variant={quote.status === 'ACCEPTED' ? 'default' : 'outline'}>
                              {quote.status}
                            </Badge>
                          </div>
                          {quote.amount && (
                            <p className="text-2xl font-bold mt-2">${quote.amount}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Created {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/quotes/${quote.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          {!quote.sentToCustomer && (
                            <Button size="sm">
                              Send to Customer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No quotes created yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inquiry.notes && inquiry.notes.length > 0 && (
                  <div className="space-y-3">
                    {inquiry.notes.map((note: any) => (
                      <div key={note.id} className="border-l-2 border-muted pl-4">
                        <p className="text-sm">{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.createdBy} • {format(new Date(note.createdAt), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddNote} 
                    disabled={addingNote || !newNote.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email History */}
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiry.emailLogs && inquiry.emailLogs.length > 0 ? (
                <div className="space-y-3">
                  {inquiry.emailLogs.map((email: any) => (
                    <div key={email.id} className="flex items-start gap-3 p-3 border rounded">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{email.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {email.type} • Sent {format(new Date(email.sentAt || email.createdAt), 'MMM dd, h:mm a')}
                        </p>
                        {email.status && (
                          <Badge variant="outline" className="mt-1">
                            {email.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No emails sent yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${inquiry.email}`} className="text-sm hover:underline">
                  {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${inquiry.phone}`} className="text-sm hover:underline">
                    {inquiry.phone}
                  </a>
                </div>
              )}
              {inquiry.companyName && (
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="text-sm font-medium">{inquiry.companyName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                {editMode ? (
                  <Select 
                    value={editData.status} 
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="QUOTED">Quoted</SelectItem>
                      <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="mt-2">{inquiry.status}</Badge>
                )}
              </div>
              <div>
                <Label>Priority</Label>
                {editMode ? (
                  <Select 
                    value={editData.priority} 
                    onValueChange={(value) => setEditData({ ...editData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="mt-2">{inquiry.priority}</Badge>
                )}
              </div>
              <div>
                <Label>Service Type</Label>
                <Badge variant="secondary" className="mt-2">
                  {inquiry.serviceType?.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <Label>Assigned To</Label>
                {editMode ? (
                  <Input
                    value={editData.assignedTo || ''}
                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                    placeholder="Enter name..."
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {inquiry.assignedTo || <span className="text-muted-foreground">Unassigned</span>}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

