'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import toast from 'react-hot-toast';

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
  hours?: number; // For labor items
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

export default function EnhancedQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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

  // Financial details
  const [financial, setFinancial] = useState({
    taxRate: 8.5,
    depositType: 'percentage' as 'percentage' | 'fixed',
    depositValue: 50, // 50% or $50 depending on type
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

  // Load inquiry data
  useEffect(() => {
    fetchInquiry();
  }, [params.id]);

  const fetchInquiry = async () => {
    try {
      const response = await fetch(`https://api.staging.kockys.com/api/crm/inquiries/${params.id}`);
      
      if (!response.ok) {
        toast.error('Failed to load inquiry');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      const inquiry = data.data || data;
      
      // Pre-fill client info
      setClientInfo({
        name: inquiry.name || '',
        company: inquiry.companyName || '',
        email: inquiry.email || '',
        phone: inquiry.phone || '',
      });
      
      // Pre-fill event info
      setEventInfo(prev => ({
        ...prev,
        date: inquiry.eventDate ? format(new Date(inquiry.eventDate), 'yyyy-MM-dd') : '',
        venue: inquiry.eventLocation || '',
        guestCount: inquiry.guestCount || 0,
      }));
      
      // Add default line items based on service type
      const defaultItems: LineItem[] = [];
      
      if (inquiry.serviceType === 'FOOD_TRUCK') {
        defaultItems.push({
          id: crypto.randomUUID(),
          category: 'food',
          description: 'Silver Tier Taco Package',
          quantity: inquiry.guestCount || 1,
          unitPrice: 18,
          taxable: true,
          total: (inquiry.guestCount || 1) * 18,
        });
        defaultItems.push({
          id: crypto.randomUUID(),
          category: 'equipment',
          description: 'Food Truck Service Fee',
          quantity: 1,
          unitPrice: 500,
          taxable: false,
          total: 500,
        });
      } else if (inquiry.serviceType === 'MOBILE_BAR') {
        defaultItems.push({
          id: crypto.randomUUID(),
          category: 'food',
          description: 'Standard Bar Package',
          quantity: inquiry.guestCount || 1,
          unitPrice: 25,
          taxable: true,
          total: (inquiry.guestCount || 1) * 25,
        });
        defaultItems.push({
          id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        category: 'labor',
        description: 'Bartender',
        quantity: 2,
        unitPrice: 30,
        hours: 4,
        taxable: false,
        total: 2 * 30 * 4,
      });
      
      setLineItems(defaultItems);
      
    } catch (error) {
      console.error('Error loading inquiry:', error);
      toast.error('Failed to load inquiry');
    } finally {
      setLoading(false);
    }
  };

  // Add line item functions
  const addFoodPackage = (packageId: string) => {
    const pkg = FOOD_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    
    const quantity = eventInfo.guestCount || 1;
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      category: 'food',
      description: `${pkg.name} - ${pkg.description}`,
      quantity: pkg.perPerson ? quantity : 1,
      unitPrice: pkg.price,
      taxable: true,
      total: pkg.perPerson ? quantity * pkg.price : pkg.price,
    };
    
    setLineItems([...lineItems, newItem]);
    toast.success(`Added ${pkg.name}`);
  };

  const addALaCarteItem = (itemId: string) => {
    const item = A_LA_CARTE_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      category: 'food',
      description: item.name,
      quantity: 1,
      unitPrice: item.price,
      taxable: true,
      total: item.price,
    };
    
    setLineItems([...lineItems, newItem]);
    toast.success(`Added ${item.name}`);
  };

  const addStaffMember = (roleId: string) => {
    const role = STAFF_ROLES.find(r => r.id === roleId);
    if (!role) return;
    
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      category: 'labor',
      description: role.name,
      quantity: 1,
      unitPrice: role.defaultRate,
      hours: 4, // Default 4 hours
      taxable: false,
      total: 1 * role.defaultRate * 4,
    };
    
    setLineItems([...lineItems, newItem]);
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
      id: crypto.randomUUID(),
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
      if (item.category === 'labor' && item.hours) {
        updated.total = updated.quantity * updated.unitPrice * updated.hours;
      } else {
        updated.total = updated.quantity * updated.unitPrice;
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
      id: crypto.randomUUID(),
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
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTaxableAmount = () => {
    return lineItems.filter(item => item.taxable).reduce((sum, item) => sum + item.total, 0);
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
      
      const response = await fetch(`https://api.staging.kockys.com/api/crm/inquiries/${params.id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quote');
      }
      
      toast.success(sendToClient ? 'Quote sent to client!' : 'Quote saved successfully!');
      router.push(`/crm/inquiries/${params.id}`);
      
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
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
          <Link href={`/crm/inquiries/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Quote Generator</h1>
            <p className="text-gray-600">Create professional quotes for your catering services</p>
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

              {/* Event Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Event Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Type</Label>
                    <Select value={eventInfo.type} onValueChange={(value) => setEventInfo({...eventInfo, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={addFoodPackage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a package..." />
                      </SelectTrigger>
                      <SelectContent>
                        {FOOD_PACKAGES.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - ${pkg.price}{pkg.perPerson ? '/person' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={addALaCarteItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a la carte..." />
                      </SelectTrigger>
                      <SelectContent>
                        {A_LA_CARTE_ITEMS.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - ${item.price}/{item.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="labor" className="space-y-4">
                  <div className="flex gap-2">
                    <Select onValueChange={addStaffMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add staff member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_ROLES.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name} - ${role.defaultRate}/hour
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          ${item.total.toFixed(2)}
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

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payments Received</CardTitle>
              <CardDescription>Track payments made by the client</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={addPayment} variant="outline" className="mb-4">
                <Plus className="h-4 w-4 mr-2" /> Add Payment
              </Button>
              
              {payments.map((payment) => (
                <div key={payment.id} className="flex gap-2 mb-2">
                  <Input 
                    type="date"
                    value={payment.date}
                    onChange={(e) => updatePayment(payment.id, 'date', e.target.value)}
                    className="w-40"
                  />
                  <Input 
                    type="number"
                    value={payment.amount}
                    onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="Amount"
                    className="w-32"
                    step="0.01"
                  />
                  <Select 
                    value={payment.method}
                    onValueChange={(value) => updatePayment(payment.id, 'method', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Venmo">Venmo</SelectItem>
                      <SelectItem value="Zelle">Zelle</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    value={payment.notes || ''}
                    onChange={(e) => updatePayment(payment.id, 'notes', e.target.value)}
                    placeholder="Notes"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removePayment(payment.id)}
                    variant="ghost"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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

              {/* Deposit */}
              <div className="space-y-2">
                <Label>Deposit Required</Label>
                <div className="flex gap-2">
                  <Select 
                    value={financial.depositType}
                    onValueChange={(value: 'percentage' | 'fixed') => setFinancial({...financial, depositType: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number"
                    value={financial.depositValue}
                    onChange={(e) => setFinancial({...financial, depositValue: parseFloat(e.target.value) || 0})}
                    className="flex-1"
                    step={financial.depositType === 'percentage' ? '5' : '50'}
                  />
                  {financial.depositType === 'percentage' && <span className="self-center">%</span>}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deposit Amount:</span>
                  <span className="font-semibold">${calculateDeposit().toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Balance */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Payments:</span>
                  <span className="font-semibold">${calculateTotalPayments().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Remaining Balance:</span>
                  <span className={calculateBalance() > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${calculateBalance().toFixed(2)}
                  </span>
                </div>
                <div>
                  <Label>Balance Due Date</Label>
                  <Input 
                    type="date"
                    value={financial.balanceDueDate}
                    onChange={(e) => setFinancial({...financial, balanceDueDate: e.target.value})}
                  />
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
                  disabled
                  className="w-full"
                  variant="secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {calculateBalance() > 0 && calculateTotalPayments() > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Outstanding Balance</p>
                    <p className="text-sm text-yellow-700">
                      Client has an outstanding balance of ${calculateBalance().toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
