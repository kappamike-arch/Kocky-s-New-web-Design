'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Send, Eye, FileText, Copy, Download,
  Mail, CreditCard, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuoteActions, EmailAccount } from '@/hooks/useQuoteActions';

interface QuoteActionBarProps {
  quoteId: string;
  quoteNumber: string;
  customerEmail?: string;
  onSave?: () => void;
  onSaved?: () => void;
  disabled?: boolean;
}

export function QuoteActionBar({ 
  quoteId, 
  quoteNumber, 
  customerEmail,
  onSave,
  onSaved,
  disabled = false 
}: QuoteActionBarProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [emailForm, setEmailForm] = useState({
    to: customerEmail || '',
    cc: '',
    fromEmail: '',
    subject: `Quote ${quoteNumber} - Kocky's Bar & Grill`,
    message: ''
  });

  const {
    saveQuote,
    downloadPdf,
    copyStripeLink,
    previewEmail,
    sendEmail,
    getEmailAccounts,
    loading
  } = useQuoteActions();

  const handleSave = async () => {
    try {
      if (onSave) {
        onSave();
      }
      toast.success('Quote saved successfully');
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadPdf(quoteId, `quote-${quoteNumber}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleCopyStripeLink = async () => {
    try {
      await copyStripeLink(quoteId);
    } catch (error) {
      console.error('Error copying Stripe link:', error);
    }
  };

  const handlePreviewEmail = async () => {
    try {
      const preview = await previewEmail(quoteId);
      setShowPreviewModal(true);
      // You could set the preview content here
    } catch (error) {
      console.error('Error previewing email:', error);
      toast.error('Failed to preview email');
    }
  };

  const handleSendEmail = async () => {
    try {
      const ccList = emailForm.cc ? emailForm.cc.split(',').map(email => email.trim()) : [];
      
      await sendEmail(quoteId, {
        to: emailForm.to,
        cc: ccList,
        fromEmail: emailForm.fromEmail,
        subject: emailForm.subject,
        message: emailForm.message
      });

      toast.success('Quote sent successfully');
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const loadEmailAccounts = async () => {
    try {
      const accounts = await getEmailAccounts();
      setEmailAccounts(accounts);
      const defaultAccount = accounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setEmailForm(prev => ({ ...prev, fromEmail: defaultAccount.email }));
      }
    } catch (error) {
      console.error('Error loading email accounts:', error);
    }
  };

  const openEmailModal = () => {
    setShowEmailModal(true);
    if (emailAccounts.length === 0) {
      loadEmailAccounts();
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-white border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={disabled || loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Quote'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadPdf}
          disabled={disabled || loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyStripeLink}
          disabled={disabled || loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-4 h-4" />
          Copy Payment Link
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePreviewEmail}
          disabled={disabled || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          Preview Email
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openEmailModal}
          disabled={disabled || loading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Send to Customer
        </motion.button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Quote to Customer</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Email
                </label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CC (optional)
                </label>
                <input
                  type="text"
                  value={emailForm.cc}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, cc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="cc@example.com, another@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <select
                  value={emailForm.fromEmail}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  {emailAccounts.map((account) => (
                    <option key={account.email} value={account.email}>
                      {account.displayName} ({account.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Add a personal message to the email..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailForm.to || loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                Send Quote
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-gray-600">Email preview content would be displayed here...</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}



