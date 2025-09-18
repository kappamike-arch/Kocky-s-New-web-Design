'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotes } from '@/lib/api/quotes';
import { 
  Plus, Search, Filter, Send, Eye, Edit, Copy, Trash2, 
  DollarSign, Calendar, User, FileText, CheckCircle, XCircle,
  Clock, CreditCard, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminQuotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const queryClient = useQueryClient();

  // Fetch quotes
  const { data: quotesData, isLoading } = useQuery({
    queryKey: ['admin-quotes', statusFilter],
    queryFn: () => quotes.getAll({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['quote-statistics'],
    queryFn: () => quotes.getStatistics(),
  });

  // Delete quote mutation
  const deleteMutation = useMutation({
    mutationFn: quotes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast.success('Quote deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete quote');
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) => 
      quotes.sendEmail(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast.success('Quote sent successfully');
    },
    onError: () => {
      toast.error('Failed to send quote');
    },
  });

  // Duplicate quote mutation
  const duplicateMutation = useMutation({
    mutationFn: quotes.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast.success('Quote duplicated successfully');
    },
    onError: () => {
      toast.error('Failed to duplicate quote');
    },
  });

  const filteredQuotes = quotesData?.data?.filter((quote: any) =>
    quote.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'SENT': return 'bg-blue-100 text-blue-700';
      case 'VIEWED': return 'bg-purple-100 text-purple-700';
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PAID': return 'bg-green-500 text-white';
      case 'EXPIRED': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'SENT': return <Send className="w-4 h-4" />;
      case 'VIEWED': return <Eye className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'PAID': return <CreditCard className="w-4 h-4" />;
      case 'EXPIRED': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quote Management</h1>
        <p className="text-gray-600">Create, manage, and track customer quotes</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Quotes</span>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats?.totalQuotes || 0}</div>
          <div className="text-sm text-gray-500 mt-1">All time</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Value</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            ${stats?.totalValue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Potential revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Acceptance Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {stats?.acceptanceRate?.toFixed(1) || '0'}%
          </div>
          <div className="text-sm text-gray-500 mt-1">Conversion rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Avg Quote Value</span>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            ${stats?.averageQuoteValue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Per quote</div>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quotes..."
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
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="VIEWED">Viewed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAID">Paid</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <Link href="/admin/quotes/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Quote
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredQuotes.map((quote: any) => (
                    <motion.tr
                      key={quote.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.quoteNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quote.customer?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {quote.customer?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{quote.title}</div>
                        {quote.eventDate && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(quote.eventDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${quote.total?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/quotes/${quote.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-blue-600"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          </Link>

                          <Link href={`/admin/quotes/${quote.id}/edit`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-orange-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                          </Link>

                          {quote.status === 'DRAFT' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => sendEmailMutation.mutate({ 
                                id: quote.id, 
                                email: quote.customer?.email 
                              })}
                              className="text-gray-600 hover:text-green-600"
                              title="Send Email"
                            >
                              <Send className="w-4 h-4" />
                            </motion.button>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => duplicateMutation.mutate(quote.id)}
                            className="text-gray-600 hover:text-purple-600"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this quote?')) {
                                deleteMutation.mutate(quote.id);
                              }
                            }}
                            className="text-gray-600 hover:text-red-600"
                            title="Delete"
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

        {filteredQuotes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No quotes found</p>
            <Link href="/admin/quotes/new">
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Create Your First Quote
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
