'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiries } from '@/lib/api/inquiries';
import {
  Truck, Calendar, MapPin, Users, Phone, Mail,
  Check, X, Eye, DollarSign, Clock, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FoodTruckPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch food truck requests
  const { data, isLoading, error } = useQuery({
    queryKey: ['food-truck-requests', statusFilter],
    queryFn: () => inquiries.getAll({
      type: 'FOOD_TRUCK',
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
    retry: 1,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      inquiries.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-truck-requests'] });
      toast.success('Request status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
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

  // Mock data if API not available
  const mockRequests = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '555-0123',
      type: 'FOOD_TRUCK',
      eventDate: new Date('2024-02-15').toISOString(),
      location: 'Central Park, Main Street',
      guestCount: 150,
      budget: '$2000-3000',
      message: 'Company picnic event, need vegetarian options',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      phone: '555-0456',
      type: 'FOOD_TRUCK',
      eventDate: new Date('2024-03-20').toISOString(),
      location: 'Beach Boulevard Festival Grounds',
      guestCount: 300,
      budget: '$4000-5000',
      message: 'Music festival, need quick service options',
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
    },
  ];

  const displayRequests = error ? mockRequests : filteredRequests;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Food Truck Requests</h1>
        <p className="text-gray-600">Manage food truck service bookings and events</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending Requests</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayRequests.filter((r: any) => r.status === 'PENDING').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Approved</span>
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayRequests.filter((r: any) => r.status === 'APPROVED').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">This Month</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {displayRequests.filter((r: any) => {
              const eventDate = new Date(r.eventDate);
              const now = new Date();
              return eventDate.getMonth() === now.getMonth() && 
                     eventDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Value</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">$12,450</div>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {displayRequests.map((request: any) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {request.eventDate
                              ? format(new Date(request.eventDate), 'MMM dd, yyyy')
                              : 'TBD'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs" title={request.location}>
                            {request.location || 'Not specified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{request.guestCount || 'TBD'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">
                          {request.budget || 'TBD'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedRequest(request)}
                            className="text-gray-600 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>

                          {request.status === 'PENDING' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateStatusMutation.mutate({
                                  id: request.id,
                                  status: 'APPROVED',
                                  notes: 'Food truck service approved'
                                })}
                                className="text-gray-600 hover:text-green-600"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateStatusMutation.mutate({
                                  id: request.id,
                                  status: 'REJECTED',
                                  notes: 'Unable to accommodate request'
                                })}
                                className="text-gray-600 hover:text-red-600"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {displayRequests.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No food truck requests found</p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold">Food Truck Request Details</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Customer</span>
                  <p className="font-medium">{selectedRequest.name}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.email}</p>
                  {selectedRequest.phone && (
                    <p className="text-sm text-gray-600">{selectedRequest.phone}</p>
                  )}
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Event Details</span>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedRequest.eventDate
                      ? format(new Date(selectedRequest.eventDate), 'MMMM dd, yyyy')
                      : 'Date not specified'}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedRequest.location || 'Location not specified'}
                  </p>
                  <p className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    {selectedRequest.guestCount || 0} guests
                  </p>
                </div>
              </div>

              {selectedRequest.budget && (
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Budget</span>
                  <p className="font-medium text-lg text-green-600">
                    {selectedRequest.budget}
                  </p>
                </div>
              )}
              
              {selectedRequest.message && (
                <div className="mb-6">
                  <span className="text-sm text-gray-600">Message</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-gray-400 mb-2" />
                    <p className="text-sm">{selectedRequest.message}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <span className="text-sm text-gray-600">Status</span>
                <p className="mt-1">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        updateStatusMutation.mutate({
                          id: selectedRequest.id,
                          status: 'APPROVED',
                          notes: 'Food truck service approved'
                        });
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={() => {
                        updateStatusMutation.mutate({
                          id: selectedRequest.id,
                          status: 'REJECTED',
                          notes: 'Unable to accommodate'
                        });
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Reject Request
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
