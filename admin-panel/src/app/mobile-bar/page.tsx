'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { inquiries } from '@/lib/api/inquiries';
import { api } from '@/lib/api/client';
import {
  Wine, Calendar, MapPin, Users, Phone, Mail,
  Check, X, Eye, DollarSign, Clock, MessageCircle, Beer,
  Plus, Send, Loader, Search, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MobileBarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    location: '',
    guestCount: '',
    budget: '',
    eventDetails: '',
    additionalRequests: ''
  });

  // Fetch mobile bar requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['mobile-bar-requests', statusFilter],
    queryFn: () => api.get('/crm/inquiries', { 
      params: {
        serviceType: 'MOBILE_BAR',
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }
    }).then(res => res.data),
    retry: 1,
  });

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Submit to backend
      const response = await inquiries.submit({
        type: 'MOBILE_BAR',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventDate: formData.eventDate,
        guestCount: parseInt(formData.guestCount) || 0,
        message: `Event Time: ${formData.eventTime}\nLocation: ${formData.location}\nBudget: ${formData.budget}\nEvent Details: ${formData.eventDetails}\nAdditional Requests: ${formData.additionalRequests}`,
        budget: formData.budget,
        location: formData.location,
      });

      // Send to CRM (simulated)
      await fetch('/api/crm/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mobile_bar_inquiry',
          ...formData,
          submittedAt: new Date().toISOString()
        })
      }).catch(err => console.error('CRM submission failed:', err));

      // Trigger auto-email will be handled by backend
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-bar-requests'] });
      toast.success('Mobile bar request submitted successfully! You will receive an email confirmation shortly.');
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit request. Please try again.');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      inquiries.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-bar-requests'] });
      toast.success('Request status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: (id: string) => inquiries.createQuote(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-bar-requests'] });
      
      // Show success message with quote number
      const quoteNumber = data.data?.quoteNumber || 'Quote';
      const status = data.data?.status || 'CREATED';
      toast.success(
        status === 'EXISTING'
          ? `Opened existing ${quoteNumber}`
          : `Created ${quoteNumber} successfully!`
      );
      
      // Redirect to quote edit page
      if (data.data?.editUrl) {
        window.location.href = data.data.editUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create quote');
    },
  });

  const filteredRequests = data?.data?.filter((request: any) =>
    request.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      eventTime: '',
      location: '',
      guestCount: '',
      budget: '',
      eventDetails: '',
      additionalRequests: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.eventDetails) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitMutation.mutate(formData);
  };

  // Mock data if API not available
  const mockRequests = [
    {
      id: '1',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '555-7890',
      type: 'MOBILE_BAR',
      eventDate: new Date('2024-02-20').toISOString(),
      location: 'Riverside Wedding Venue',
      guestCount: 100,
      budget: '$3000-4000',
      message: 'Wedding reception, need signature cocktails and wine service',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Robert Martinez',
      email: 'robert@example.com',
      phone: '555-3456',
      type: 'MOBILE_BAR',
      eventDate: new Date('2024-03-10').toISOString(),
      location: 'Corporate Office Building',
      guestCount: 75,
      budget: '$2500',
      message: 'Company anniversary party, premium cocktail service requested',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    },
  ];

  const displayRequests = error ? mockRequests : filteredRequests;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Mobile Bar Requests</h1>
          <p className="text-gray-600">Manage mobile bar service bookings for events</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold">{displayRequests.length}</p>
            </div>
            <Wine className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">
                {displayRequests.filter((r: any) => r.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold">
                {displayRequests.filter((r: any) => r.status === 'APPROVED').length}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">
                {displayRequests.filter((r: any) => r.status === 'COMPLETED').length}
              </p>
            </div>
            <Beer className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : displayRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Wine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No mobile bar requests found</p>
          </div>
        ) : (
          <div className="divide-y">
            {displayRequests.map((request: any) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{request.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {request.email}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {request.phone}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-500">Event Date</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(request.eventDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {request.location || 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Guest Count</p>
                        <p className="font-medium flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {request.guestCount || 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Budget</p>
                        <p className="font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {request.budget || 'TBD'}
                        </p>
                      </div>
                    </div>

                    {request.message && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Event Details</p>
                        <p className="text-sm bg-gray-50 p-3 rounded">{request.message}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Submitted {format(new Date(request.createdAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.quotes && request.quotes.length > 0 ? (
                          <button
                            onClick={() => router.push(`/quotes/${request.quotes[0].id}/edit`)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                            title="View Existing Quote"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => createQuoteMutation.mutate(request.id)}
                            disabled={createQuoteMutation.isPending}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm disabled:opacity-50"
                            title="Create Quote"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatusMutation.mutate({ 
                                id: request.id, 
                                status: 'APPROVED' 
                              })}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateStatusMutation.mutate({ 
                                id: request.id, 
                                status: 'REJECTED' 
                              })}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Request Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">New Mobile Bar Request</h2>
                <p className="text-gray-600 mt-1">Submit a new mobile bar service inquiry</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Event Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Guest Count
                    </label>
                    <input
                      type="number"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Venue name and address"
                    />
                  </div>

                  {/* Budget */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select budget range</option>
                      <option value="Under $1000">Under $1000</option>
                      <option value="$1000-$2000">$1000 - $2000</option>
                      <option value="$2000-$3000">$2000 - $3000</option>
                      <option value="$3000-$5000">$3000 - $5000</option>
                      <option value="$5000+">$5000+</option>
                    </select>
                  </div>

                  {/* Event Details */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.eventDetails}
                      onChange={(e) => setFormData({ ...formData, eventDetails: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Tell us about your event (type of event, special requirements, etc.)"
                      required
                    />
                  </div>

                  {/* Additional Requests */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Requests
                    </label>
                    <textarea
                      value={formData.additionalRequests}
                      onChange={(e) => setFormData({ ...formData, additionalRequests: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Any special requests or requirements?"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Request Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Request Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedRequest.eventDate), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guest Count</p>
                    <p className="font-medium">{selectedRequest.guestCount || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{selectedRequest.location || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">{selectedRequest.budget || 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Message</p>
                    <p className="bg-gray-50 p-3 rounded">{selectedRequest.message}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}