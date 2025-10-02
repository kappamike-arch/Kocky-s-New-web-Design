'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Send, Eye, Edit, Trash2, 
  DollarSign, Calendar, CheckCircle, XCircle,
  Clock, CreditCard, Filter, Search, Download, Mail
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Quote {
  id: string;
  quoteNumber: string;
  amount: number;
  status: string;
  validUntil: string;
  sentAt?: string;
  acceptedAt?: string;
  paidAt?: string;
  inquiry: {
    id: string;
    name: string;
    email: string;
    serviceType: string;
    companyName?: string;
  };
  quoteItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export default function QuotesPage() {
  console.log('🔍 Quotes page component mounted');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [testClick, setTestClick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('🔍 Quotes page useEffect - setting mounted to true');
    console.log('✅ useEffect is working! Client-side JavaScript is executing.');
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('🔍 Quotes page useEffect called, filter:', filter);
    if (mounted) {
      console.log('🔍 Component is mounted, fetching quotes...');
      fetchQuotes();
    } else {
      console.log('🔍 Component not mounted yet, skipping fetch');
    }
  }, [filter, mounted]);

  const fetchQuotes = async () => {
    try {
      console.log('🔍 Fetching quotes...');
      const response = await api.get('/quotes');
      const data = response.data;
      console.log('📊 Quotes response:', data);
      
      if (data && data.success) {
        setQuotes(data.quotes || []);
        console.log('✅ Loaded', data.quotes?.length || 0, 'quotes');
      } else {
        setQuotes([]);
        console.log('❌ No quotes found');
      }
    } catch (error: any) {
      console.error('❌ Error fetching quotes:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      const response = await api.patch(`/quotes/${quoteId}`, { status });

      if (response.data && response.data.success) {
        toast.success(`Quote status updated to ${status}`);
        fetchQuotes();
      } else {
        toast.error('Failed to update quote status');
      }
    } catch (error: any) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote status');
    }
  };

  const sendQuote = async (quoteId: string) => {
    try {
      const response = await api.post(`/quotes/${quoteId}/send-email`);

      if (response.data && response.data.success) {
        toast.success('Quote sent successfully');
        fetchQuotes();
      } else {
        toast.error('Failed to send quote');
      }
    } catch (error: any) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote');
    }
  };

  const downloadPDF = async (quoteId: string, quoteNumber: string) => {
    try {
      const response = await api.get(`/quotes/${quoteId}/pdf`, {
        responseType: 'blob'
      });
      
      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-${quoteNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF downloaded successfully');
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const emailQuotePDF = async (quoteId: string) => {
    try {
      const response = await api.post(`/quotes/${quoteId}/pdf/email`, {
        message: 'Thank you for your inquiry. Please find attached our quote for your event.',
        cc: []
      });

      if (response.data && response.data.success) {
        toast.success(`Quote emailed to ${response.data.recipient}`);
        fetchQuotes();
      } else {
        toast.error('Failed to email quote');
      }
    } catch (error: any) {
      console.error('Error emailing quote:', error);
      toast.error('Failed to email quote');
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const response = await api.delete(`/quotes/${quoteId}`);

      if (response.data && response.data.success) {
        toast.success('Quote deleted successfully');
        fetchQuotes();
      } else {
        toast.error('Failed to delete quote');
      }
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'VIEWED': return 'bg-purple-100 text-purple-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'PAID': return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'SENT': return <Send className="w-4 h-4" />;
      case 'VIEWED': return <Eye className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'PAID': return <CreditCard className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      case 'EXPIRED': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredQuotes = quotes.filter(quote => 
    quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.inquiry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Quote Management</h1>
        <p className="text-gray-600">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quote Management</h1>
          <p className="text-gray-600">Create and manage quotes for inquiries</p>
          <button 
            onClick={() => {
              console.log('🔍 Test button clicked!');
              setTestClick(testClick + 1);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded mt-2"
          >
            Test JS ({testClick})
          </button>
        </div>
        <Link 
          href="/crm"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Quote from Inquiry
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quotes</p>
              <p className="text-2xl font-bold">{quotes.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold">
                {quotes.filter(q => q.status === 'SENT').length}
              </p>
            </div>
            <Send className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold">
                {quotes.filter(q => q.status === 'ACCEPTED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold">
                {quotes.filter(q => q.status === 'PAID').length}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">
                ${quotes.reduce((sum, q) => sum + (q.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'PAID', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quote #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  Loading quotes...
                </td>
              </tr>
            ) : filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  No quotes found
                </td>
              </tr>
            ) : (
              filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link 
                      href={`/quotes/${quote.id}/edit`}
                      className="text-primary hover:underline font-medium"
                    >
                      {quote.quoteNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{quote.inquiry.name}</div>
                      <div className="text-sm text-gray-500">{quote.inquiry.email}</div>
                      {quote.inquiry.companyName && (
                        <div className="text-sm text-gray-500">{quote.inquiry.companyName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {quote.inquiry.serviceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ${quote.amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(quote.status)}`}>
                      {getStatusIcon(quote.status)}
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {quote.validUntil ? format(new Date(quote.validUntil), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/quotes/${quote.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View/Edit"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/quotes/${quote.id}/edit`}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => downloadPDF(quote.id, quote.quoteNumber)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => emailQuotePDF(quote.id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Email PDF"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      {quote.status === 'DRAFT' && (
                        <button
                          onClick={() => sendQuote(quote.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Send"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {quote.status === 'SENT' && (
                        <button
                          onClick={() => updateQuoteStatus(quote.id, 'ACCEPTED')}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Accepted"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {quote.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateQuoteStatus(quote.id, 'PAID')}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="Mark as Paid"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}