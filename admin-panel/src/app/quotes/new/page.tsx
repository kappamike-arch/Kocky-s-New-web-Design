'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { quotes } from '@/lib/api/quotes';
import { inquiries } from '@/lib/api/inquiries';
import { 
  Plus, Trash2, Save, Send, FileText, Package, Users, 
  DollarSign, Calendar, MapPin, ChevronLeft, Copy,
  Percent, Hash
} from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customerId: z.string().optional(),
  inquiryId: z.string().optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  guestCount: z.number().min(1).optional(),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be positive'),
    isOptional: z.boolean().optional(),
  })),
  packages: z.array(z.object({
    name: z.string().min(1, 'Package name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be positive'),
    isOptional: z.boolean().optional(),
  })).optional(),
  laborItems: z.array(z.object({
    description: z.string().min(1, 'Labor description is required'),
    hours: z.number().min(0, 'Hours must be positive'),
    rate: z.number().min(0, 'Rate must be positive'),
    staffName: z.string().optional(),
    isOptional: z.boolean().optional(),
  })).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(['FIXED', 'PERCENTAGE']).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  validityDays: z.number().min(1).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewQuotePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      items: [{ name: '', description: '', quantity: 1, unitPrice: 0 }],
      packages: [],
      laborItems: [],
      taxRate: 8.5,
      discountType: 'FIXED',
      validityDays: 30,
      termsAndConditions: `- 50% deposit required to secure booking
- Final payment due on day of event
- Cancellation must be made 7 days in advance for full refund`,
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control,
    name: 'packages',
  });

  const { fields: laborFields, append: appendLabor, remove: removeLabor } = useFieldArray({
    control,
    name: 'laborItems',
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['quote-templates'],
    queryFn: quotes.getTemplates,
  });

  // Fetch recent inquiries for linking
  const { data: recentInquiries } = useQuery({
    queryKey: ['recent-inquiries'],
    queryFn: () => inquiries.getAll({ limit: 10 }),
  });

  // Create quote mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => quotes.createFull({
      ...data,
      generatePaymentLink: true,
    }),
    onSuccess: (data) => {
      toast.success('Quote created successfully');
      router.push(`/admin/quotes/${data.id}`);
    },
    onError: () => {
      toast.error('Failed to create quote');
    },
  });

  // Load template
  const loadTemplate = (templateId: string) => {
    const template = templates?.find((t: any) => t.id === templateId);
    if (template) {
      setValue('title', template.name);
      if (template.defaultItems) {
        setValue('items', template.defaultItems);
      }
      if (template.defaultPackages) {
        setValue('packages', template.defaultPackages);
      }
      if (template.defaultLabor) {
        setValue('laborItems', template.defaultLabor);
      }
      toast.success(`Template "${template.name}" loaded`);
    }
  };

  // Calculate totals
  const watchedItems = watch('items') || [];
  const watchedPackages = watch('packages') || [];
  const watchedLabor = watch('laborItems') || [];
  const taxRate = watch('taxRate') || 0;
  const discount = watch('discount') || 0;
  const discountType = watch('discountType') || 'FIXED';

  const itemsTotal = watchedItems.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unitPrice || 0));
  }, 0);

  const packagesTotal = watchedPackages.reduce((sum, pkg) => {
    return sum + (pkg.price || 0);
  }, 0);

  const laborTotal = watchedLabor.reduce((sum, labor) => {
    return sum + ((labor.hours || 0) * (labor.rate || 0));
  }, 0);

  const subtotal = itemsTotal + packagesTotal + laborTotal;
  
  let discountAmount = 0;
  if (discount) {
    if (discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * discount) / 100;
    } else {
      discountAmount = discount;
    }
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/quotes" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Quotes
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create New Quote</h1>
        <p className="text-gray-600">Build a professional quote for your customer</p>
      </div>

      {/* Template Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Start with a Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {templates?.map((template: any) => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedTemplate(template.id);
                loadTemplate(template.id);
              }}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                selectedTemplate === template.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-medium">{template.name}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title*</label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g., Food Truck Service - Smith Wedding"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link to Inquiry</label>
              <select
                {...register('inquiryId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="">Select inquiry (optional)</option>
                {recentInquiries?.data?.map((inquiry: any) => (
                  <option key={inquiry.id} value={inquiry.id}>
                    {inquiry.name} - {inquiry.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief description of the services..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Event Date</label>
              <input
                {...register('eventDate')}
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Event Location</label>
              <input
                {...register('eventLocation')}
                type="text"
                placeholder="Event venue or address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Guest Count</label>
              <input
                {...register('guestCount', { valueAsNumber: true })}
                type="number"
                placeholder="Expected number of guests"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Validity (Days)</label>
              <input
                {...register('validityDays', { valueAsNumber: true })}
                type="number"
                placeholder="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Items Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-600" />
              Line Items
            </h2>
            <button
              type="button"
              onClick={() => appendItem({ name: '', description: '', quantity: 1, unitPrice: 0 })}
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {itemFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <input
                      {...register(`items.${index}.name`)}
                      type="text"
                      placeholder="Item name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <input
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      placeholder="Qty"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <input
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      {...register(`items.${index}.isOptional`)}
                      type="checkbox"
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Optional item</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Packages Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-600" />
              Package Deals (Optional)
            </h2>
            <button
              type="button"
              onClick={() => appendPackage({ name: '', description: '', price: 0 })}
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Package
            </button>
          </div>

          {packageFields.length > 0 && (
            <div className="space-y-4">
              {packageFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <input
                        {...register(`packages.${index}.name`)}
                        type="text"
                        placeholder="Package name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        {...register(`packages.${index}.description`)}
                        type="text"
                        placeholder="What's included"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`packages.${index}.price`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="Package price"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        {...register(`packages.${index}.isOptional`)}
                        type="checkbox"
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Optional package</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removePackage(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Labor Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Labor & Service (Optional)
            </h2>
            <button
              type="button"
              onClick={() => appendLabor({ description: '', hours: 0, rate: 0 })}
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Labor
            </button>
          </div>

          {laborFields.length > 0 && (
            <div className="space-y-4">
              {laborFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <input
                        {...register(`laborItems.${index}.description`)}
                        type="text"
                        placeholder="Labor description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`laborItems.${index}.hours`, { valueAsNumber: true })}
                        type="number"
                        step="0.5"
                        placeholder="Hours"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`laborItems.${index}.rate`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="Rate/hr"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`laborItems.${index}.staffName`)}
                        type="text"
                        placeholder="Staff name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        {...register(`laborItems.${index}.isOptional`)}
                        type="checkbox"
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Optional labor</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeLabor(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pricing & Totals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-600" />
            Pricing & Totals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                {...register('taxRate', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="8.5"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount</label>
              <div className="flex gap-2">
                <input
                  {...register('discount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  min="0"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <select
                  {...register('discountType')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="FIXED">$</option>
                  <option value="PERCENTAGE">%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Items Total:</span>
                <span>${itemsTotal.toFixed(2)}</span>
              </div>
              {packagesTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Packages Total:</span>
                  <span>${packagesTotal.toFixed(2)}</span>
                </div>
              )}
              {laborTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Labor Total:</span>
                  <span>${laborTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-orange-500">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Notes visible to the customer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Internal Notes</label>
              <textarea
                {...register('internalNotes')}
                rows={3}
                placeholder="Internal notes (not visible to customer)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
              <textarea
                {...register('termsAndConditions')}
                rows={5}
                placeholder="Enter terms and conditions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link href="/admin/quotes">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </Link>

          <div className="flex gap-3">
            <motion.button
              type="submit"
              disabled={createMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              Save as Draft
            </motion.button>

            <motion.button
              type="submit"
              disabled={createMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Create & Send
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
