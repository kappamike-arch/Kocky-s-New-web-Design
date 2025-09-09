'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiries } from '@/lib/api/inquiries';
import {
  Calendar, Clock, Users, MapPin, Phone, Mail,
  Check, X, Eye, Edit, Trash2, Plus, Search, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ReservationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch reservations
  const { data, isLoading, error } = useQuery({
    queryKey: ['reservations', statusFilter],
    queryFn: () => inquiries.getAll({
      type: 'RESERVATION',
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inquiries.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => inquiries.update(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reservation cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel reservation');
    },
  });

  const filteredReservations = data?.data?.filter((reservation: any) =>
    reservation.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.phone?.includes(searchQuery)
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error loading reservations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Reservations Management</h1>
        <p className="text-gray-600">View and manage restaurant reservations</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Reservation
            </motion.button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
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
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
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
                  {filteredReservations.map((reservation: any) => (
                    <motion.tr
                      key={reservation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {reservation.eventDate
                              ? format(new Date(reservation.eventDate), 'MMM dd, yyyy')
                              : 'No date'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{reservation.guestCount || 0} guests</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{reservation.email}</span>
                          </div>
                          {reservation.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{reservation.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedReservation(reservation)}
                            className="text-gray-600 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>

                          {reservation.status === 'PENDING' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateStatusMutation.mutate({
                                  id: reservation.id,
                                  status: 'APPROVED'
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
                                  id: reservation.id,
                                  status: 'REJECTED'
                                })}
                                className="text-gray-600 hover:text-red-600"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (confirm('Cancel this reservation?')) {
                                deleteMutation.mutate(reservation.id);
                              }
                            }}
                            className="text-gray-600 hover:text-red-600"
                            title="Cancel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {filteredReservations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reservations found</p>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Reservation Details</h2>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Customer Name</span>
                  <p className="font-medium">{selectedReservation.name}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Contact</span>
                  <p>{selectedReservation.email}</p>
                  {selectedReservation.phone && <p>{selectedReservation.phone}</p>}
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Event Details</span>
                  <p>Date: {selectedReservation.eventDate ? format(new Date(selectedReservation.eventDate), 'MMMM dd, yyyy') : 'Not set'}</p>
                  <p>Guests: {selectedReservation.guestCount || 0}</p>
                </div>
                
                {selectedReservation.message && (
                  <div>
                    <span className="text-sm text-gray-600">Special Requests</span>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedReservation.message}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-gray-600">Status</span>
                  <p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

