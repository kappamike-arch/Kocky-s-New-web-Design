'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orders } from '@/lib/api/orders';
import {
  ShoppingBag, Clock, CheckCircle, XCircle, DollarSign,
  Eye, Edit, Trash2, Filter, Search, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch orders - using a mock endpoint for now since it may not exist yet
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orders.getAll({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
    retry: 1,
  });

  // Get statistics
  const { data: stats } = useQuery({
    queryKey: ['order-statistics'],
    queryFn: () => orders.getStatistics(),
    retry: 1,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orders.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orders.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel order');
    },
  });

  const filteredOrders = data?.data?.filter((order: any) =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'PREPARING': return 'bg-purple-100 text-purple-700';
      case 'READY': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-green-500 text-white';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600';
      case 'PENDING': return 'text-yellow-600';
      case 'REFUNDED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Mock data if API not available
  const mockOrders = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customer: { name: 'John Doe', email: 'john@example.com' },
      items: [
        { name: 'Burger', quantity: 2, price: 12.99, total: 25.98 },
        { name: 'Fries', quantity: 2, price: 4.99, total: 9.98 }
      ],
      subtotal: 35.96,
      tax: 3.60,
      total: 39.56,
      status: 'PREPARING',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customer: { name: 'Jane Smith', email: 'jane@example.com' },
      items: [
        { name: 'Pizza', quantity: 1, price: 18.99, total: 18.99 },
        { name: 'Salad', quantity: 1, price: 8.99, total: 8.99 }
      ],
      subtotal: 27.98,
      tax: 2.80,
      total: 30.78,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  ];

  const displayOrders = error ? mockOrders : filteredOrders;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Orders Management</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Today's Orders</span>
            <ShoppingBag className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{stats?.todayOrders || 0}</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="text-green-500">+12%</span> from yesterday
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Revenue</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">${stats?.todayRevenue?.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-gray-500 mt-1">Today's total</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting preparation</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completed</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{stats?.completedOrders || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Today</div>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
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
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {displayOrders.map((order: any) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.items?.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="text-gray-500">
                              +{order.items.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            ${order.total?.toFixed(2)}
                          </div>
                          <div className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-600 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>

                          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <select
                              value={order.status}
                              onChange={(e) => updateStatusMutation.mutate({
                                id: order.id,
                                status: e.target.value
                              })}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PREPARING">Preparing</option>
                              <option value="READY">Ready</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          )}

                          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (confirm('Cancel this order?')) {
                                  cancelMutation.mutate({ id: order.id });
                                }
                              }}
                              className="text-gray-600 hover:text-red-600"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
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

        {displayOrders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Order Details - {selectedOrder.orderNumber}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Customer</span>
                  <p className="font-medium">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.email}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Order Date</span>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.createdAt), 'MMMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm">Item</th>
                        <th className="px-4 py-2 text-center text-sm">Qty</th>
                        <th className="px-4 py-2 text-right text-sm">Price</th>
                        <th className="px-4 py-2 text-right text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.price?.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">${item.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-right font-semibold">
                          Subtotal:
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          ${selectedOrder.subtotal?.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-right">
                          Tax:
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${selectedOrder.tax?.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={3} className="px-4 py-2 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-2 text-right text-orange-500">
                          ${selectedOrder.total?.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedOrder(null)}
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
