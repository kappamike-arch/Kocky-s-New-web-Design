'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { crmAPI } from '@/lib/api/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Plus,
  MessageSquare,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  FileText,
  User,
  Building,
  Hash,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface InquiryDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType: string;
  status: string;
  priority: string;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
  budget?: string;
  message?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  quotes?: any[];
}

export default function CRMDashboard() {
  const [inquiries, setInquiries] = useState<InquiryDetail[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    serviceType: '',
    priority: '',
    search: ''
  });
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedInquiry, setEditedInquiry] = useState<InquiryDetail | null>(null);
  const [savingInquiry, setSavingInquiry] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchInquiries();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const response = await crmAPI.getStats();
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await crmAPI.getAllInquiries(filters);
      setInquiries(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiryDetails = async (inquiryId: string) => {
    try {
      const response = await crmAPI.getInquiryById(inquiryId);
      const inquiry = response.data.data || response.data;
      setSelectedInquiry(inquiry);
      setEditedInquiry(inquiry);
      return inquiry;
    } catch (error) {
      console.error('Failed to fetch inquiry details:', error);
      toast.error('Failed to load inquiry details');
      return null;
    }
  };

  const handleInquiryClick = async (inquiry: InquiryDetail) => {
    const fullInquiry = await fetchInquiryDetails(inquiry.id);
    if (fullInquiry) {
      setSelectedInquiry(fullInquiry);
      setEditedInquiry(fullInquiry);
      setDetailModalOpen(true);
      setEditMode(false);
    }
  };

  const handleSaveInquiry = async () => {
    if (!editedInquiry) return;
    
    setSavingInquiry(true);
    try {
      await crmAPI.updateInquiry(editedInquiry.id, editedInquiry);
      toast.success('Inquiry updated successfully');
      setSelectedInquiry(editedInquiry);
      setEditMode(false);
      // Refresh the list
      fetchInquiries();
    } catch (error) {
      console.error('Failed to update inquiry:', error);
      toast.error('Failed to update inquiry');
    } finally {
      setSavingInquiry(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedInquiry || !newNote.trim()) return;
    
    setAddingNote(true);
    try {
      const response = await crmAPI.addNote(selectedInquiry.id, newNote, true);
      toast.success('Note added successfully');
      setNewNote('');
      // Refresh inquiry details to get the new note
      await fetchInquiryDetails(selectedInquiry.id);
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await crmAPI.exportInquiries('csv');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Inquiries exported successfully');
    } catch (error) {
      toast.error('Failed to export inquiries');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      NEW: { color: 'bg-blue-500', icon: AlertCircle },
      CONTACTED: { color: 'bg-yellow-500', icon: MessageSquare },
      QUOTED: { color: 'bg-purple-500', icon: DollarSign },
      NEGOTIATING: { color: 'bg-orange-500', icon: Clock },
      WON: { color: 'bg-green-500', icon: CheckCircle },
      LOST: { color: 'bg-red-500', icon: AlertCircle },
      ARCHIVED: { color: 'bg-gray-500', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.NEW;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1 px-2 py-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getServiceBadge = (service: string) => {
    const colors: any = {
      FOOD_TRUCK: 'bg-orange-600 text-white',
      MOBILE_BAR: 'bg-purple-600 text-white',
      CATERING: 'bg-green-600 text-white',
      RESERVATION: 'bg-blue-600 text-white',
      GENERAL: 'bg-gray-600 text-white'
    };
    return <Badge className={`${colors[service] || colors.GENERAL} px-2 py-1`}>
      {service.replace('_', ' ')}
    </Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      URGENT: 'bg-red-600 text-white',
      HIGH: 'bg-orange-600 text-white',
      NORMAL: 'bg-blue-600 text-white',
      LOW: 'bg-gray-600 text-white'
    };
    return <Badge className={`${colors[priority] || colors.NORMAL} px-2 py-1`}>
      {priority}
    </Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-orange-500 rounded-full p-2">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">🎯 CRM Command Center</h1>
        </div>
        <p className="text-gray-300 text-lg">Track customer inquiries, manage quotes, and close more deals</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data sync</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-200 font-semibold text-sm">📋 TOTAL CUSTOMER INQUIRIES</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform">{stats.overview.totalInquiries}</div>
              <div className="flex items-center text-sm text-blue-100 mt-3 bg-blue-800/40 rounded-full px-3 py-1.5">
                <Users className="h-4 w-4 mr-2 text-orange-400" />
                <span className="font-medium">{stats.overview.newInquiries} new this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-500 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-200 font-semibold text-sm">💰 QUOTES IN PROGRESS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform">{stats.overview.quotedInquiries}</div>
              <div className="flex items-center text-sm text-green-100 mt-3 bg-green-800/40 rounded-full px-3 py-1.5">
                <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                <span className="font-medium">{stats.overview.totalQuotes} quotes sent</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-200 font-semibold text-sm">🎉 CONFIRMED BOOKINGS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform">{stats.overview.wonInquiries}</div>
              <div className="flex items-center text-sm text-purple-100 mt-3 bg-purple-800/40 rounded-full px-3 py-1.5">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-400" />
                <span className="font-medium">{stats.overview.conversionRate}% success rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-500 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-200 font-semibold text-sm">📊 REVENUE EFFICIENCY</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white group-hover:scale-105 transition-transform">{stats.overview.quoteAcceptanceRate}<span className="text-2xl text-orange-300">%</span></div>
              <div className="flex items-center text-sm text-orange-100 mt-3 bg-orange-800/40 rounded-full px-3 py-1.5">
                <CheckCircle className="h-4 w-4 mr-2 text-orange-400" />
                <span className="font-medium">Quote → Revenue rate</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Inquiries</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone..."
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUOTED">Quoted</SelectItem>
                <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                <SelectItem value="WON">Won</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.serviceType} onValueChange={(value) => setFilters({ ...filters, serviceType: value })}>
              <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                <SelectItem value="FOOD_TRUCK">Food Truck</SelectItem>
                <SelectItem value="MOBILE_BAR">Mobile Bar</SelectItem>
                <SelectItem value="CATERING">Catering</SelectItem>
                <SelectItem value="RESERVATION">Reservation</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="w-[150px] bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inquiries Table */}
          <div className="rounded-md border border-gray-700 overflow-hidden bg-gray-900">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800">
                    <TableHead className="text-gray-300 font-semibold">Customer</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Service</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Priority</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Event Date</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Submission Date</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center text-gray-400">
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Loading inquiries...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : inquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No inquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    inquiries.map((inquiry: any) => (
                      <TableRow 
                        key={inquiry.id} 
                        className="cursor-pointer border-gray-700 hover:bg-gray-800 transition-colors duration-150"
                        onClick={() => handleInquiryClick(inquiry)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{inquiry.name}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3" />
                              {inquiry.email}
                            </div>
                            {inquiry.phone && (
                              <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3" />
                                {inquiry.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getServiceBadge(inquiry.serviceType)}</TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell>{getPriorityBadge(inquiry.priority)}</TableCell>
                        <TableCell>
                          {inquiry.eventDate ? (
                            <div className="flex items-center gap-1 text-gray-300">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              {format(new Date(inquiry.eventDate), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-300">
                            {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                            <div className="text-xs text-gray-500">
                              {format(new Date(inquiry.createdAt), 'h:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-gray-600 text-white hover:bg-gray-700"
                              onClick={() => handleInquiryClick(inquiry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link href={`/quotes/create?inquiryId=${inquiry.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-gray-600 text-white hover:bg-gray-700"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl text-white">
                  {editMode ? 'Edit Inquiry' : 'Inquiry Details'}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-2">
                  {selectedInquiry && `Inquiry #${selectedInquiry.id.slice(-8)}`}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                {!editMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMode(true);
                        setEditedInquiry(selectedInquiry);
                      }}
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Link href={`/quotes/create?inquiryId=${selectedInquiry?.id}`}>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quote
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMode(false);
                        setEditedInquiry(selectedInquiry);
                      }}
                      disabled={savingInquiry}
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveInquiry}
                      disabled={savingInquiry}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {savingInquiry ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedInquiry && (
            <div className="mt-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <User className="h-5 w-5 mr-2 text-orange-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Name</Label>
                    {editMode ? (
                      <Input
                        value={editedInquiry?.name || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, name: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">{selectedInquiry.name}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Email</Label>
                    {editMode ? (
                      <Input
                        value={editedInquiry?.email || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, email: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">{selectedInquiry.email}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Phone</Label>
                    {editMode ? (
                      <Input
                        value={editedInquiry?.phone || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, phone: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">{selectedInquiry.phone || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Company</Label>
                    {editMode ? (
                      <Input
                        value={editedInquiry?.company || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, company: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">{selectedInquiry.company || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <FileText className="h-5 w-5 mr-2 text-orange-500" />
                  Service Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Service Type</Label>
                    {editMode ? (
                      <Select 
                        value={editedInquiry?.serviceType} 
                        onValueChange={(value) => setEditedInquiry({...editedInquiry!, serviceType: value})}
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FOOD_TRUCK">Food Truck</SelectItem>
                          <SelectItem value="MOBILE_BAR">Mobile Bar</SelectItem>
                          <SelectItem value="CATERING">Catering</SelectItem>
                          <SelectItem value="RESERVATION">Reservation</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>{getServiceBadge(selectedInquiry.serviceType)}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    {editMode ? (
                      <Select 
                        value={editedInquiry?.status} 
                        onValueChange={(value) => setEditedInquiry({...editedInquiry!, status: value})}
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
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
                      <div>{getStatusBadge(selectedInquiry.status)}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Priority</Label>
                    {editMode ? (
                      <Select 
                        value={editedInquiry?.priority} 
                        onValueChange={(value) => setEditedInquiry({...editedInquiry!, priority: value})}
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>{getPriorityBadge(selectedInquiry.priority)}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Event Date</Label>
                    {editMode ? (
                      <Input
                        type="date"
                        value={editedInquiry?.eventDate ? new Date(editedInquiry.eventDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, eventDate: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">
                        {selectedInquiry.eventDate 
                          ? format(new Date(selectedInquiry.eventDate), 'MMM dd, yyyy') 
                          : 'N/A'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Location</Label>
                    {editMode ? (
                      <Input
                        value={editedInquiry?.eventLocation || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, eventLocation: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">{selectedInquiry.eventLocation || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Guest Count</Label>
                    {editMode ? (
                      <Input
                        type="number"
                        value={editedInquiry?.guestCount || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, guestCount: parseInt(e.target.value)})}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white">{selectedInquiry.guestCount || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Message & Notes */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
                  Message & Notes
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400">Customer Message</Label>
                    {editMode ? (
                      <Textarea
                        value={editedInquiry?.message || ''}
                        onChange={(e) => setEditedInquiry({...editedInquiry!, message: e.target.value})}
                        className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedInquiry.message || 'No message provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-gray-400">Internal Notes</Label>
                    <div className="space-y-3">
                      {/* Add New Note Form */}
                      <div className="flex gap-2">
                        <Textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="bg-gray-900 border-gray-700 text-white min-h-[80px] flex-1"
                          placeholder="Add a new internal note..."
                        />
                        <Button
                          onClick={handleAddNote}
                          disabled={addingNote || !newNote.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {addingNote ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Display Existing Notes */}
                      <div className="space-y-2">
                        {Array.isArray(selectedInquiry.notes) && selectedInquiry.notes.length > 0 ? (
                          selectedInquiry.notes.map((note: any) => (
                            <div key={note.id} className="p-3 bg-gray-800 rounded-lg">
                              <p className="text-gray-300 whitespace-pre-wrap">{note.note}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span className={note.isInternal ? "text-yellow-500" : "text-blue-500"}>
                                  {note.isInternal ? 'Internal' : 'External'}
                                </span>
                                <span>•</span>
                                <span>{note.createdAt ? format(new Date(note.createdAt), 'MMM dd, yyyy h:mm a') : ''}</span>
                                {note.createdBy && (
                                  <>
                                    <span>•</span>
                                    <span>by {note.createdBy}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : typeof selectedInquiry.notes === 'string' && selectedInquiry.notes ? (
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-gray-300 whitespace-pre-wrap">
                              {selectedInquiry.notes}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No notes added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Quotes */}
              {selectedInquiry.quotes && selectedInquiry.quotes.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                    <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
                    Related Quotes ({selectedInquiry.quotes.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedInquiry.quotes.map((quote: any) => (
                      <Link key={quote.id} href={`/quotes/${quote.id}`}>
                        <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                          <div>
                            <p className="font-medium text-white">Quote #{quote.quoteNumber}</p>
                            <p className="text-sm text-gray-400">
                              {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-green-600 text-white">
                              ${quote.totalAmount}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Clock className="h-5 w-5 mr-2 text-orange-500" />
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">
                      {format(new Date(selectedInquiry.createdAt), 'MMM dd, yyyy h:mm a')}
                    </span>
                  </div>
                  {selectedInquiry.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">
                        {format(new Date(selectedInquiry.updatedAt), 'MMM dd, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}