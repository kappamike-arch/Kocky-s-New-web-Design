export const stockQuoteTemplates = [
  {
    name: 'Food Truck Service - Standard',
    type: 'FOOD_TRUCK',
    subject: 'Food Truck Service Quote - Kocky\'s Bar & Grill',
    headerContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Food Truck Service Quote' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Thank you for considering Kocky\'s Bar & Grill for your event!' },
          ],
        },
      ],
    },
    defaultItems: [
      {
        name: 'Food Truck Setup & Service',
        description: 'Complete food truck service including setup, cooking, and cleanup',
        category: 'Service',
        quantity: 1,
        unitPrice: 500,
      },
      {
        name: 'Per Person Food Package',
        description: 'Choice of burgers, hot dogs, or sandwiches with sides',
        category: 'Food',
        quantity: 50,
        unitPrice: 15,
      },
    ],
    defaultLabor: [
      {
        description: 'Chef & Service Staff (2 people)',
        hours: 4,
        rate: 35,
      },
    ],
    termsAndConditions: `
      - 50% deposit required to secure booking
      - Final headcount due 48 hours before event
      - Cancellation must be made 7 days in advance for full refund
      - Travel fees may apply for locations over 25 miles
      - Service includes setup 1 hour before and cleanup after event
    `,
    validityDays: 30,
    includePaymentLink: true,
    primaryColor: '#FF6B35',
    secondaryColor: '#004E64',
  },
  {
    name: 'Mobile Bar Service - Premium',
    type: 'MOBILE_BAR',
    subject: 'Mobile Bar Service Quote - Kocky\'s Bar & Grill',
    headerContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Premium Mobile Bar Service' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Elevate your event with our professional mobile bar service!' },
          ],
        },
      ],
    },
    defaultPackages: [
      {
        name: 'Premium Open Bar Package',
        description: 'Unlimited beer, wine, and mixed drinks for your guests',
        items: [
          'Premium spirits selection',
          'Craft beer options',
          'Wine selection',
          'Mixers and garnishes',
          'Professional bar setup',
        ],
        price: 2500,
      },
    ],
    defaultItems: [
      {
        name: 'Signature Cocktail',
        description: 'Custom cocktail created for your event',
        category: 'Beverage',
        quantity: 100,
        unitPrice: 8,
      },
    ],
    defaultLabor: [
      {
        description: 'Professional Bartender',
        hours: 5,
        rate: 45,
      },
      {
        description: 'Bar Back Assistant',
        hours: 5,
        rate: 25,
      },
    ],
    termsAndConditions: `
      - All alcohol must be provided through our licensed service
      - Responsible service of alcohol policies strictly enforced
      - Valid ID required for all guests consuming alcohol
      - 50% deposit required upon booking
      - Gratuity not included in quoted price
    `,
    validityDays: 30,
    includePaymentLink: true,
    primaryColor: '#FF6B35',
    secondaryColor: '#004E64',
  },
  {
    name: 'Catering - Corporate Event',
    type: 'CATERING',
    subject: 'Corporate Catering Quote - Kocky\'s Bar & Grill',
    headerContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Corporate Catering Services' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Professional catering for your business event' },
          ],
        },
      ],
    },
    defaultPackages: [
      {
        name: 'Business Lunch Package',
        description: 'Complete lunch service for corporate meetings',
        items: [
          'Assorted sandwiches and wraps',
          'Fresh salad bar',
          'Hot entrée options',
          'Beverages and desserts',
          'Disposable plates and utensils',
        ],
        price: 1200,
      },
    ],
    defaultItems: [
      {
        name: 'Coffee & Beverage Station',
        description: 'All-day coffee, tea, and soft drinks',
        category: 'Beverage',
        quantity: 1,
        unitPrice: 150,
      },
      {
        name: 'Morning Pastry Platter',
        description: 'Assorted muffins, croissants, and danish',
        category: 'Food',
        quantity: 3,
        unitPrice: 75,
      },
    ],
    defaultLabor: [
      {
        description: 'Catering Staff (2 people)',
        hours: 4,
        rate: 30,
      },
    ],
    termsAndConditions: `
      - Minimum order of 20 people required
      - Orders must be placed 72 hours in advance
      - Delivery and setup included within 15-mile radius
      - Dietary restrictions accommodated with advance notice
      - Full payment due on day of event
    `,
    validityDays: 30,
    includePaymentLink: true,
    primaryColor: '#FF6B35',
    secondaryColor: '#004E64',
  },
  {
    name: 'Private Event - Wedding',
    type: 'PRIVATE_EVENT',
    subject: 'Wedding Reception Quote - Kocky\'s Bar & Grill',
    headerContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Wedding Reception Services' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Make your special day unforgettable with Kocky\'s!' },
          ],
        },
      ],
    },
    defaultPackages: [
      {
        name: 'Wedding Reception Package',
        description: 'Complete wedding reception service',
        items: [
          'Cocktail hour with appetizers',
          'Three-course plated dinner',
          'Wedding cake cutting service',
          'Champagne toast',
          'Dance floor and lighting',
        ],
        price: 7500,
      },
      {
        name: 'Premium Bar Package',
        description: 'Open bar service for entire reception',
        items: [
          'Premium spirits',
          'Beer and wine selection',
          'Signature cocktails',
          'Non-alcoholic beverages',
        ],
        price: 3500,
      },
    ],
    defaultLabor: [
      {
        description: 'Event Coordinator',
        hours: 8,
        rate: 75,
      },
      {
        description: 'Service Staff (6 people)',
        hours: 6,
        rate: 35,
      },
      {
        description: 'Bartenders (2 people)',
        hours: 6,
        rate: 45,
      },
    ],
    termsAndConditions: `
      - 25% deposit required to secure date
      - Second payment of 50% due 30 days before event
      - Final payment due 7 days before event
      - Guest count guarantee required 10 days in advance
      - Vendor meals available at discounted rate
      - Service charge and gratuity not included
    `,
    validityDays: 60,
    includePaymentLink: true,
    primaryColor: '#FF6B35',
    secondaryColor: '#004E64',
  },
  {
    name: 'Happy Hour Special Event',
    type: 'PRIVATE_EVENT',
    subject: 'Happy Hour Event Quote - Kocky\'s Bar & Grill',
    headerContent: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Happy Hour Private Event' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Host your happy hour with us!' },
          ],
        },
      ],
    },
    defaultItems: [
      {
        name: 'Happy Hour Appetizer Platter',
        description: 'Wings, nachos, sliders, and veggie platter',
        category: 'Food',
        quantity: 5,
        unitPrice: 65,
      },
      {
        name: 'Drink Tickets',
        description: 'Redeemable for beer, wine, or well drinks',
        category: 'Beverage',
        quantity: 100,
        unitPrice: 5,
      },
    ],
    defaultLabor: [
      {
        description: 'Dedicated Server',
        hours: 3,
        rate: 25,
      },
      {
        description: 'Bartender',
        hours: 3,
        rate: 35,
      },
    ],
    termsAndConditions: `
      - Minimum of 25 guests required
      - 2-hour minimum booking
      - Private area subject to availability
      - 20% gratuity added to final bill
      - Full payment due at conclusion of event
    `,
    validityDays: 30,
    includePaymentLink: true,
    primaryColor: '#FF6B35',
    secondaryColor: '#004E64',
  },
];
