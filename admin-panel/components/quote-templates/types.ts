export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  price?: number;
  total?: number;
  image?: string;
}

export interface QuoteTemplateProps {
  quoteNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  event: {
    date: string;
    location: string;
    type: string;
    guestCount?: number;
  };
  items: QuoteItem[];
  pricing: {
    subtotal: number;
    tax: number;
    taxRate?: number;
    gratuity?: number;
    gratuityRate?: number;
    total: number;
    deposit?: number;
  };
  notes?: string;
  termsAndConditions?: string;
  stripePaymentUrl?: string;
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  // Display options
  displayOptions?: {
    showLogo?: boolean;
    showItemDescription?: boolean;
    showItemQuantity?: boolean;
    showItemPrice?: boolean;
    showSubtotal?: boolean;
    showTax?: boolean;
    showGratuity?: boolean;
    showNotes?: boolean;
    showTerms?: boolean;
    showPaymentButton?: boolean;
  };
}



