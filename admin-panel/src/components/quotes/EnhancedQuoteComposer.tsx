'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Save, Send, Plus, Trash2, DollarSign, Calendar, FileText,
  Download, User, Mail, Phone, MapPin, Users, Clock, Percent, Calculator,
  ChefHat, Wine, Truck, Settings, AlertCircle
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// UUID generation utility
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Pre-defined packages
const FOOD_PACKAGES = [
  { id: 'gold-taco', name: 'Gold Tier Taco Package', price: 25, perPerson: true, description: 'Premium taco bar with 3 protein options, sides, and toppings' },
  { id: 'silver-taco', name: 'Silver Tier Taco Package', price: 18, perPerson: true, description: 'Standard taco bar with 2 protein options and sides' },
  { id: 'bronze-taco', name: 'Bronze Tier Taco Package', price: 12, perPerson: true, description: 'Basic taco bar with 1 protein option' },
  { id: 'premium-bar', name: 'Premium Bar Package', price: 35, perPerson: true, description: 'Top shelf liquors, craft cocktails, beer & wine' },
  { id: 'standard-bar', name: 'Standard Bar Package', price: 25, perPerson: true, description: 'Well drinks, domestic beer, house wine' },
];

const A_LA_CARTE_ITEMS = [
  { id: 'guac', name: 'Side of Guacamole', price: 8.99, unit: 'serving' },
  { id: 'salsa', name: 'Fresh Salsa Bar', price: 6.99, unit: 'serving' },
  { id: 'margarita', name: 'Specialty Margarita', price: 12, unit: 'drink' },
  { id: 'cocktail', name: 'Craft Cocktail', price: 14, unit: 'drink' },
  { id: 'dessert', name: 'Churros Station', price: 5, unit: 'person' },
];

const STAFF_ROLES = [
  { id: 'chef', name: 'Chef', defaultRate: 35 },
  { id: 'bartender', name: 'Bartender', defaultRate: 30 },
  { id: 'server', name: 'Server', defaultRate: 25 },
  { id: 'coordinator', name: 'Event Coordinator', defaultRate: 40 },
];

const EVENT_TYPES = [
  'Wedding', 'Corporate Event', 'Private Party', 'Birthday', 
  'Anniversary', 'Graduation', 'Holiday Party', 'Fundraiser', 'Other'
];

interface LineItem {
  id: string;
  category: 'food' | 'labor' | 'equipment';
  description: string;
  quantity: number;
  unitPrice: number;
  hours?: number;
  taxable: boolean;
  total: number;
  notes?: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface QuoteDTO {
  id: string;
  quoteNumber: string;
  amount: number;
  status: string;
  validUntil: string;
  serviceDetails: string;
  terms?: string;
  notes?: string;
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    serviceType: string;
    eventDate?: string;
    eventLocation?: string;
    guestCount?: number;
  };
  quoteItems: LineItem[];
}

export interface InquiryDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  serviceType: string;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
  message?: string;
}

export interface EnhancedQuoteComposerProps {
  mode: 'create' | 'edit';
  quoteId?: string;
  initialQuote?: QuoteDTO;
  inquiryContext?: InquiryDTO | null;
  onSaved?: (quote: QuoteDTO) => void;
}

export function EnhancedQuoteComposer({ 
  mode, 
  quoteId, 
  initialQuote, 
  inquiryContext,
  onSaved 
}: EnhancedQuoteComposerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  // Generate unique quote ID
  const generateQuoteId = () => {
    const date = new Date();
    const dateStr = format(date, 'yyyy-MM-dd');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q-${dateStr}-${random}`;
  };

  // Quote details
  const [quoteDetails, setQuoteDetails] = useState({
    quoteId: generateQuoteId(),
    dateCreated: new Date().toISOString(),
    validUntil: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    status: 'DRAFT' as 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'INVOICED',
  });

  // Client information
  const [clientInfo, setClientInfo] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
  });

  // Event information
  const [eventInfo, setEventInfo] = useState({
    type: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    address: '',
    guestCount: 0,
  });

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  // Select values for dropdowns
  const [packageSelectValue, setPackageSelectValue] = useState<string>('');
  const [alaCarteSelectValue, setAlaCarteSelectValue] = useState<string>('');
  const [staffSelectValue, setStaffSelectValue] = useState<string>('');

  // Email accounts
  const [emailAccounts, setEmailAccounts] = useState<Array<{key: string, name: string, email: string}>>([]);
  const [selectedEmailAccount, setSelectedEmailAccount] = useState<string>('quotes');

  // Inquiry state for Status and Priority dropdowns
  const [inquiryInfo, setInquiryInfo] = useState({
    status: 'NEW',
    priority: 'NORMAL',
    serviceType: '',
    assignedTo: '',
  });

  // Financial details
  const [financial, setFinancial] = useState({
    taxRate: 8.5,
    depositType: 'percentage' as 'percentage' | 'fixed',
    depositValue: 50,
    balanceDueDate: '',
  });

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);

  // Notes & Terms
  const [notes, setNotes] = useState({
    customNotes: '',
    terms: `PAYMENT TERMS:
• ${financial.depositType === 'percentage' ? financial.depositValue + '%' : '$' + financial.depositValue} deposit required to confirm booking
• Balance due 7 days before event
• Accepted payment methods: Cash, Check, Credit Card, Venmo

SERVICE INCLUDES:
• Professional uniformed staff
• Complete setup and breakdown
• All necessary equipment and supplies
• Service time as specified in quote

CANCELLATION POLICY:
• 30+ days before event: Full refund of deposit
• 14-30 days before event: 50% refund of deposit
• Less than 14 days: No refund of deposit

ADDITIONAL TERMS:
• Final guest count due 7 days before event
• Travel fees apply for venues 20+ miles from base location
• Prices subject to change based on market conditions
• 18% service charge will be added for parties of 20 or more`,
  });

  // Load data based on mode
  useEffect(() => {
    if (mode === 'edit' && quoteId && !initialQuote) {
      fetchQuote();
    } else if (mode === 'create' && inquiryContext) {
      initializeFromInquiry();
    } else if (initialQuote) {
      initializeFromQuote();
    }
    fetchEmailAccounts();
  }, [mode, quoteId, initialQuote, inquiryContext]);

  const fetchEmailAccounts = async () => {
    try {
      const response = await api.get('/crm/email-accounts');
      setEmailAccounts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch email accounts:', error);
      setEmailAccounts([
        { key: 'quotes', name: "Kocky's Quotes Team", email: 'quotes@kockysbar.com' },
        { key: 'support', name: "Kocky's Support", email: 'support@kockysbar.com' },
        { key: 'general', name: "Kocky's Bar & Grill", email: 'info@kockysbar.com' }
      ]);
    }
  };

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quotes/${quoteId}`);
      
      if (response.data.success && response.data.quote) {
        const quote = response.data.quote;
        initializeFromQuote(quote);
      } else {
        throw new Error('Quote not found');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Failed to load quote');
      router.push('/quotes');
    } finally {
      setLoading(false);
    }
  };

  const initializeFromQuote = (quote?: QuoteDTO) => {
    const quoteData = quote || initialQuote;
    if (!quoteData) return;

    setQuoteDetails({
      quoteId: quoteData.quoteNumber || generateQuoteId(),
      dateCreated: quoteData.id ? new Date().toISOString() : new Date().toISOString(),
      validUntil: quoteData.validUntil ? format(new Date(quoteData.validUntil), 'yyyy-MM-dd') : format(addDays(new Date(), 14), 'yyyy-MM-dd'),
      status: quoteData.status as any || 'DRAFT',
    });

    setClientInfo({
      name: quoteData.inquiry.name || '',
      company: quoteData.inquiry.companyName || '',
      email: quoteData.inquiry.email || '',
      phone: quoteData.inquiry.phone || '',
    });

    setEventInfo({
      type: quoteData.inquiry.serviceType || '',
      date: quoteData.inquiry.eventDate ? format(new Date(quoteData.inquiry.eventDate), 'yyyy-MM-dd') : '',
      startTime: '',
      endTime: '',
      venue: quoteData.inquiry.eventLocation || '',
      address: quoteData.inquiry.eventLocation || '',
      guestCount: quoteData.inquiry.guestCount || 0,
    });

    setInquiryInfo({
      status: 'QUOTED',
      priority: 'NORMAL',
      serviceType: quoteData.inquiry.serviceType || '',
      assignedTo: '',
    });

    // Convert quote items to ensure numeric values
    const convertedItems = (quoteData.quoteItems || []).map(item => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      hours: item.hours ? Number(item.hours) : undefined,
    }));
    setLineItems(convertedItems);
    setNotes({
      customNotes: quoteData.notes || '',
      terms: quoteData.terms || notes.terms,
    });
  };

  const initializeFromInquiry = () => {
    if (!inquiryContext) return;

    setClientInfo({
      name: inquiryContext.name || '',
      company: inquiryContext.companyName || '',
      email: inquiryContext.email || '',
      phone: inquiryContext.phone || '',
    });
    
    setInquiryInfo({
      status: 'NEW',
      priority: 'NORMAL',
      serviceType: inquiryContext.serviceType || '',
      assignedTo: '',
    });
    
    setEventInfo(prev => ({
      ...prev,
      type: inquiryContext.serviceType || '',
      date: inquiryContext.eventDate ? format(new Date(inquiryContext.eventDate), 'yyyy-MM-dd') : '',
      venue: inquiryContext.eventLocation || '',
      guestCount: inquiryContext.guestCount || 0,
    }));
    
    // Add default line items based on service type
    const defaultItems: LineItem[] = [];
    
    if (inquiryContext.serviceType === 'FOOD_TRUCK') {
      defaultItems.push({
        id: generateUUID(),
        category: 'food',
        description: 'Silver Tier Taco Package',
        quantity: inquiryContext.guestCount || 1,
        unitPrice: 18,
        taxable: true,
        total: (inquiryContext.guestCount || 1) * 18,
      });
      defaultItems.push({
        id: generateUUID(),
        category: 'equipment',
        description: 'Food Truck Service Fee',
        quantity: 1,
        unitPrice: 500,
        taxable: false,
        total: 500,
      });
    } else if (inquiryContext.serviceType === 'MOBILE_BAR') {
      defaultItems.push({
        id: generateUUID(),
        category: 'food',
        description: 'Standard Bar Package',
        quantity: inquiryContext.guestCount || 1,
        unitPrice: 25,
        taxable: true,
        total: (inquiryContext.guestCount || 1) * 25,
      });
      defaultItems.push({
        id: generateUUID(),
        category: 'equipment',
        description: 'Mobile Bar Setup Fee',
        quantity: 1,
        unitPrice: 350,
        taxable: false,
        total: 350,
      });
    }
    
    // Add default labor
    defaultItems.push({
      id: generateUUID(),
      category: 'labor',
      description: 'Bartender',
      quantity: 2,
      unitPrice: 30,
      hours: 4,
      taxable: false,
      total: 2 * 30 * 4,
    });
    
    setLineItems(defaultItems);
  };

  // Add line item functions
  const addFoodPackage = (packageId: string) => {
    const pkg = FOOD_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    
    const quantity = eventInfo.guestCount || 1;
    const newItem: LineItem = {
      id: generateUUID(),
      category: 'food',
      description: `${pkg.name} - ${pkg.description}`,
      quantity: pkg.perPerson ? quantity : 1,
      unitPrice: pkg.price,
      taxable: true,
      total: pkg.perPerson ? quantity * pkg.price : pkg.price,
    };
    
    setLineItems([...lineItems, newItem]);
    setPackageSelectValue(packageId);
    toast.success(`Added ${pkg.name}`);
  };

  const addALaCarteItem = (itemId: string) => {
    const item = A_LA_CARTE_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    const newItem: LineItem = {
      id: generateUUID(),
      category: 'food',
      description: item.name,
      quantity: 1,
      unitPrice: item.price,
      taxable: true,
      total: item.price,
    };
    
    setLineItems([...lineItems, newItem]);
    setAlaCarteSelectValue(itemId);
    toast.success(`Added ${item.name}`);
  };

  const addStaffMember = (roleId: string) => {
    const role = STAFF_ROLES.find(r => r.id === roleId);
    if (!role) return;
    
    const newItem: LineItem = {
      id: generateUUID(),
      category: 'labor',
      description: role.name,
      quantity: 1,
      unitPrice: role.defaultRate,
      hours: 4,
      taxable: false,
      total: 1 * role.defaultRate * 4,
    };
    
    setLineItems([...lineItems, newItem]);
    setStaffSelectValue(roleId);
    toast.success(`Added ${role.name}`);
  };

  const addServiceFee = (type: 'travel' | 'service' | 'admin') => {
    const fees = {
      travel: { description: 'Travel Fee', price: 100 },
      service: { description: 'Service Charge (18%)', price: calculateSubtotal() * 0.18 },
      admin: { description: 'Administrative Fee', price: 50 },
    };
    
    const fee = fees[type];
    const newItem: LineItem = {
      id: generateUUID(),
      category: 'equipment',
      description: fee.description,
      quantity: 1,
      unitPrice: fee.price,
      taxable: false,
      total: fee.price,
    };
    
    setLineItems([...lineItems, newItem]);
    toast.success(`Added ${fee.description}`);
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // Recalculate total
      if (item.category === 'labor' && updated.hours) {
        updated.total = Number(updated.quantity) * Number(updated.unitPrice) * Number(updated.hours);
      } else {
        updated.total = Number(updated.quantity) * Number(updated.unitPrice);
      }
      
      return updated;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  // Add payment
  const addPayment = () => {
    const newPayment: Payment = {
      id: generateUUID(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: 'Credit Card',
      notes: '',
    };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (id: string, field: string, value: any) => {
    setPayments(payments => payments.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ));
  };

  const removePayment = (id: string) => {
    setPayments(payments => payments.filter(p => p.id !== id));
  };

  // Calculations
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + Number(item.total), 0);
  };

  const calculateTaxableAmount = () => {
    return lineItems.filter(item => item.taxable).reduce((sum, item) => sum + Number(item.total), 0);
  };

  const calculateTax = () => {
    return calculateTaxableAmount() * (financial.taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const calculateDeposit = () => {
    if (financial.depositType === 'percentage') {
      return calculateGrandTotal() * (financial.depositValue / 100);
    }
    return financial.depositValue;
  };

  const calculateTotalPayments = () => {
    return payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  };

  const calculateBalance = () => {
    return calculateGrandTotal() - calculateTotalPayments();
  };

  // Save quote
  const handleSave = async (sendToClient = false) => {
    setSaving(true);
    
    try {
      const quoteData = {
        ...quoteDetails,
        client: clientInfo,
        event: eventInfo,
        lineItems,
        financial: {
          ...financial,
          subtotal: calculateSubtotal(),
          taxableAmount: calculateTaxableAmount(),
          tax: calculateTax(),
          grandTotal: calculateGrandTotal(),
          deposit: calculateDeposit(),
        },
        payments,
        notes: notes.customNotes,
        terms: notes.terms,
        sendToCustomer: sendToClient,
      };
      
      let response;
      if (mode === 'edit' && quoteId) {
        // Update existing quote
        response = await api.put(`/quotes/${quoteId}`, {
          amount: calculateGrandTotal(),
          validUntil: quoteDetails.validUntil,
          serviceDetails: JSON.stringify(quoteData),
          terms: notes.terms,
          notes: notes.customNotes,
          quoteItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            notes: item.notes || '',
          })),
        });
      } else {
        // Create new quote
        response = await api.post('/quotes', {
          amount: calculateGrandTotal(),
          validUntil: quoteDetails.validUntil,
          serviceDetails: JSON.stringify(quoteData),
          terms: notes.terms,
          notes: notes.customNotes,
          quoteItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            notes: item.notes || '',
          })),
          sendToCustomer: sendToClient,
          emailAccount: selectedEmailAccount,
        });
      }
      
      if (response.status !== 200) {
        throw new Error('Failed to save quote');
      }
      
      toast.success(sendToClient ? 'Quote sent to client!' : 'Quote saved successfully!');
      
      if (onSaved) {
        onSaved(response.data.quote || response.data);
      }
      
      if (mode === 'create') {
        router.push(`/quotes/${response.data.quote?.id || response.data?.id}/edit`);
      }
      
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF function
  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Set up colors
      const primaryColor = [0, 0, 0]; // Black
      const secondaryColor = [100, 100, 100]; // Gray
      const accentColor = [220, 38, 127]; // Pink accent
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.text('Kocky\'s', 20, 30);
      
      doc.setFontSize(16);
      doc.setTextColor(...secondaryColor);
      doc.text('Professional Catering & Mobile Bar Services', 20, 40);
      
      // Quote metadata
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text(`Quote ID: ${quoteDetails.quoteId}`, 20, 60);
      doc.text(`Date Created: ${format(new Date(quoteDetails.dateCreated), 'MMM dd, yyyy')}`, 20, 70);
      doc.text(`Valid Until: ${format(new Date(quoteDetails.validUntil), 'MMM dd, yyyy')}`, 20, 80);
      doc.text(`Status: ${quoteDetails.status}`, 20, 90);
      
      // Client Information
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Client Information', 20, 110);
      
      doc.setFontSize(12);
      doc.setTextColor(...secondaryColor);
      doc.text(`Name: ${clientInfo.name}`, 20, 125);
      doc.text(`Email: ${clientInfo.email}`, 20, 135);
      doc.text(`Phone: ${clientInfo.phone}`, 20, 145);
      if (clientInfo.company) {
        doc.text(`Company: ${clientInfo.company}`, 20, 155);
      }
      
      // Event Details
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Event Details', 20, 175);
      
      doc.setFontSize(12);
      doc.setTextColor(...secondaryColor);
      doc.text(`Event Type: ${eventInfo.type}`, 20, 190);
      doc.text(`Date: ${format(new Date(eventInfo.date), 'MMM dd, yyyy')}`, 20, 200);
      doc.text(`Time: ${eventInfo.startTime} - ${eventInfo.endTime}`, 20, 210);
      doc.text(`Location: ${eventInfo.venue}`, 20, 220);
      if (eventInfo.address) {
        doc.text(`Address: ${eventInfo.address}`, 20, 230);
      }
      doc.text(`Guests: ${eventInfo.guestCount}`, 20, 240);
      
      // Line Items Table
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Quote Items', 20, 260);
      
      const tableData = lineItems.map(item => [
        item.description,
        item.quantity.toString(),
        `$${Number(item.unitPrice).toFixed(2)}`,
        item.category === 'labor' ? `${item.hours || 0}h` : '-',
        `$${Number(item.total).toFixed(2)}`
      ]);
      
      // Add table
      autoTable(doc, {
        startY: 270,
        head: [['Description', 'Qty', 'Unit Price', 'Hours', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 }
      });
      
      // Financial Summary
      const finalY = (doc as any).lastAutoTable?.finalY + 20 || 350;
      
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Financial Summary', 20, finalY);
      
      doc.setFontSize(12);
      doc.setTextColor(...secondaryColor);
      doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 20, finalY + 15);
      doc.text(`Taxable Amount: $${calculateTaxableAmount().toFixed(2)}`, 20, finalY + 25);
      doc.text(`Tax (${financial.taxRate}%): $${calculateTax().toFixed(2)}`, 20, finalY + 35);
      
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text(`Grand Total: $${calculateGrandTotal().toFixed(2)}`, 20, finalY + 50);
      
      // Deposit information
      doc.setFontSize(12);
      doc.setTextColor(...secondaryColor);
      const depositAmount = calculateDeposit();
      doc.text(`Deposit Required: $${depositAmount.toFixed(2)}`, 20, finalY + 65);
      
      // Footer note
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.text('This is an automatically generated quote. Final pricing subject to confirmation.', 20, pageHeight - 20);
      
      // Generate filename and download
      const filename = `Quote-${quoteDetails.quoteId}.pdf`;
      doc.save(filename);
      
      toast.success('PDF generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === 'edit' ? 'Edit' : 'Create'} Quote {quoteDetails.quoteId}
            </h1>
            <p className="text-gray-600">
              {mode === 'edit' ? 'Edit existing quote details' : 'Create professional quotes for your catering services'}
            </p>
          </div>
        </div>
        <Badge variant={quoteDetails.status === 'DRAFT' ? 'secondary' : 'default'}>
          {quoteDetails.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote & Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quote & Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quote Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quote ID</Label>
                  <Input value={quoteDetails.quoteId} disabled />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input 
                    type="date" 
                    value={quoteDetails.validUntil}
                    onChange={(e) => setQuoteDetails({...quoteDetails, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <Separator />

              {/* Client Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Client Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name*</Label>
                    <Input 
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label>Company (Optional)</Label>
                    <Input 
                      value={clientInfo.company}
                      onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                      placeholder="ABC Corp"
                    />
                  </div>
                  <div>
                    <Label>Email*</Label>
                    <Input 
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone*</Label>
                    <Input 
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Inquiry Management */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Inquiry Management
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Status</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={inquiryInfo.status} 
                      onChange={(e) => setInquiryInfo({...inquiryInfo, status: e.target.value})}
                    >
                      <option value="">Select status</option>
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUOTED">Quoted</option>
                      <option value="NEGOTIATING">Negotiating</option>
                      <option value="WON">Won</option>
                      <option value="LOST">Lost</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={inquiryInfo.priority} 
                      onChange={(e) => setInquiryInfo({...inquiryInfo, priority: e.target.value})}
                    >
                      <option value="">Select priority</option>
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <Label>Service Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={inquiryInfo.serviceType} 
                      onChange={(e) => setInquiryInfo({...inquiryInfo, serviceType: e.target.value})}
                    >
                      <option value="">Select service</option>
                      <option value="CATERING">Catering</option>
                      <option value="FOOD_TRUCK">Food Truck</option>
                      <option value="MOBILE_BAR">Mobile Bar</option>
                      <option value="RESERVATION">Reservation</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>
                  <div>
                    <Label>Assigned To</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={inquiryInfo.assignedTo} 
                      onChange={(e) => setInquiryInfo({...inquiryInfo, assignedTo: e.target.value})}
                    >
                      <option value="">Unassigned</option>
                      <option value="manager">Manager</option>
                      <option value="sales">Sales Team</option>
                      <option value="chef">Head Chef</option>
                      <option value="coordinator">Event Coordinator</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Event Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Event Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={eventInfo.type} 
                      onChange={(e) => setEventInfo({...eventInfo, type: e.target.value})}
                    >
                      <option value="">Select event type</option>
                      {EVENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Event Date</Label>
                    <Input 
                      type="date"
                      value={eventInfo.date}
                      onChange={(e) => setEventInfo({...eventInfo, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Input 
                      type="time"
                      value={eventInfo.startTime}
                      onChange={(e) => setEventInfo({...eventInfo, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input 
                      type="time"
                      value={eventInfo.endTime}
                      onChange={(e) => setEventInfo({...eventInfo, endTime: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Venue/Event Address</Label>
                    <Input 
                      value={eventInfo.address}
                      onChange={(e) => setEventInfo({...eventInfo, address: e.target.value})}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  <div>
                    <Label>Number of Guests</Label>
                    <Input 
                      type="number"
                      value={eventInfo.guestCount}
                      onChange={(e) => setEventInfo({...eventInfo, guestCount: parseInt(e.target.value) || 0})}
                      placeholder="150"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add services, products, and fees to the quote</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="food">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="food">Food & Beverage</TabsTrigger>
                  <TabsTrigger value="labor">Labor & Staffing</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment & Fees</TabsTrigger>
                </TabsList>
                
                <TabsContent value="food" className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-1">
                      <select 
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        value={packageSelectValue}
                        onChange={(e) => {
                          if (e.target.value) {
                            addFoodPackage(e.target.value);
                          } else {
                            setPackageSelectValue('');
                          }
                        }}
                      >
                        <option value="">Add a package...</option>
                        {FOOD_PACKAGES.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - ${pkg.price}{pkg.perPerson ? '/person' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 flex gap-1">
                      <select 
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        value={alaCarteSelectValue}
                        onChange={(e) => {
                          if (e.target.value) {
                            addALaCarteItem(e.target.value);
                          } else {
                            setAlaCarteSelectValue('');
                          }
                        }}
                      >
                        <option value="">Add à la carte...</option>
                        {A_LA_CARTE_ITEMS.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} - ${item.price}/{item.unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="labor" className="space-y-4">
                  <div className="flex gap-2">
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={staffSelectValue}
                      onChange={(e) => {
                        if (e.target.value) {
                          addStaffMember(e.target.value);
                        } else {
                          setStaffSelectValue('');
                        }
                      }}
                    >
                      <option value="">Add staff member...</option>
                      {STAFF_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name} - ${role.defaultRate}/hour
                        </option>
                      ))}
                    </select>
                  </div>
                </TabsContent>
                
                <TabsContent value="equipment" className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => addServiceFee('travel')} variant="outline">
                      <Truck className="h-4 w-4 mr-2" /> Add Travel Fee
                    </Button>
                    <Button onClick={() => addServiceFee('service')} variant="outline">
                      <Percent className="h-4 w-4 mr-2" /> Add Service Charge
                    </Button>
                    <Button onClick={() => addServiceFee('admin')} variant="outline">
                      <Settings className="h-4 w-4 mr-2" /> Add Admin Fee
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Line Items Table */}
              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-center py-2">Rate</th>
                      <th className="text-center py-2">Hours</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-center py-2">Tax</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">
                          <Input 
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            className="w-full"
                          />
                        </td>
                        <td className="py-2">
                          <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="py-2">
                          <Input 
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-24 text-center"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2">
                          {item.category === 'labor' ? (
                            <Input 
                              type="number"
                              value={item.hours || 0}
                              onChange={(e) => updateLineItem(item.id, 'hours', parseFloat(e.target.value) || 0)}
                              className="w-20 text-center"
                              step="0.5"
                            />
                          ) : (
                            <span className="text-gray-400 text-center block">-</span>
                          )}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          ${Number(item.total).toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <input 
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateLineItem(item.id, 'taxable', e.target.checked)}
                          />
                        </td>
                        <td className="py-2">
                          <Button
                            onClick={() => removeLineItem(item.id)}
                            variant="ghost"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Custom Notes for Client</Label>
                <Textarea
                  value={notes.customNotes}
                  onChange={(e) => setNotes({...notes, customNotes: e.target.value})}
                  placeholder="Any special notes or instructions for the client..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={notes.terms}
                  onChange={(e) => setNotes({...notes, terms: e.target.value})}
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary (Right column) */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxable Amount:</span>
                  <span>${calculateTaxableAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span>Tax:</span>
                    <Input 
                      type="number"
                      value={financial.taxRate}
                      onChange={(e) => setFinancial({...financial, taxRate: parseFloat(e.target.value) || 0})}
                      className="w-16 h-8 text-sm"
                      step="0.1"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <span className="font-semibold">${calculateTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span className="text-green-600">${calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Quote
                </Button>
                <Button 
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Save & Send to Client
                </Button>
                <Button 
                  onClick={generatePDF}
                  className="w-full"
                  variant="secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


