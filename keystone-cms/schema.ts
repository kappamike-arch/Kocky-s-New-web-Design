import { list } from '@keystone-6/core';
import { 
  text, 
  password, 
  relationship, 
  select, 
  timestamp, 
  decimal,
  checkbox,
  integer,
  json,
  image,
  file,
  virtual
} from '@keystone-6/fields';
import { document } from '@keystone-6/fields-document';
import type { Lists } from '.keystone/types';

export const lists: Lists = {
  // User management for CMS access
  User: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: ({ session }) => session?.data.role === 'ADMIN',
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ 
        validation: { isRequired: true },
        isIndexed: 'unique',
      }),
      password: password({ validation: { isRequired: true } }),
      role: select({
        options: [
          { label: 'Admin', value: 'ADMIN' },
          { label: 'Staff', value: 'STAFF' },
          { label: 'Customer', value: 'CUSTOMER' },
        ],
        defaultValue: 'STAFF',
        validation: { isRequired: true },
      }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'email', 'role', 'createdAt'],
      },
    },
  }),

  // Menu Items with image upload
  MenuItem: list({
    access: {
      operation: {
        query: () => true, // Public can view
        create: ({ session }) => !!session,
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      name: text({ 
        validation: { isRequired: true },
        ui: { 
          description: 'Name of the menu item (e.g., "Grilled Chicken Sandwich")'
        }
      }),
      description: text({ 
        ui: { 
          displayMode: 'textarea',
          description: 'Appetizing description of the dish'
        }
      }),
      category: select({
        options: [
          { label: 'Appetizers', value: 'APPETIZERS' },
          { label: 'Entrees', value: 'ENTREES' },
          { label: 'Desserts', value: 'DESSERTS' },
          { label: 'Beverages', value: 'BEVERAGES' },
          { label: 'Specials', value: 'SPECIALS' },
          { label: 'Kids Menu', value: 'KIDS' },
        ],
        validation: { isRequired: true },
        ui: { description: 'Category for menu organization' }
      }),
      price: decimal({
        validation: { isRequired: true, min: '0' },
        precision: 10,
        scale: 2,
        ui: { description: 'Price in dollars (e.g., 12.99)' }
      }),
      image: image({ 
        storage: 'local_images',
        ui: { description: 'Photo of the dish (recommended: 800x600px)' }
      }),
      isAvailable: checkbox({ 
        defaultValue: true,
        ui: { description: 'Toggle to show/hide item on website' }
      }),
      isVegetarian: checkbox({ 
        ui: { description: 'Mark if suitable for vegetarians' }
      }),
      isGlutenFree: checkbox({ 
        ui: { description: 'Mark if gluten-free' }
      }),
      spicyLevel: select({
        options: [
          { label: 'Not Spicy', value: '0' },
          { label: 'Mild', value: '1' },
          { label: 'Medium', value: '2' },
          { label: 'Hot', value: '3' },
          { label: 'Extra Hot', value: '4' },
        ],
        ui: { description: 'Spice level indicator' }
      }),
      calories: integer({
        ui: { description: 'Calorie count (optional)' }
      }),
      allergens: text({
        ui: { 
          displayMode: 'textarea',
          description: 'List any allergens (e.g., "Contains nuts, dairy")' 
        }
      }),
      preparationTime: integer({
        ui: { description: 'Estimated prep time in minutes' }
      }),
      featured: checkbox({
        ui: { description: 'Show in featured section on homepage' }
      }),
      displayOrder: integer({
        defaultValue: 0,
        ui: { description: 'Order to display (lower numbers show first)' }
      }),
      createdAt: timestamp({ 
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }
      }),
      updatedAt: timestamp({ 
        db: { updatedAt: true },
        ui: { itemView: { fieldMode: 'read' } }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'category', 'price', 'isAvailable', 'featured'],
      },
      label: 'Menu Items',
      singular: 'Menu Item',
      plural: 'Menu Items',
      description: 'Manage your restaurant menu items',
    },
  }),

  // Page Management with backgrounds
  Page: list({
    access: {
      operation: {
        query: () => true,
        create: ({ session }) => !!session,
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      title: text({ 
        validation: { isRequired: true },
        ui: { description: 'Page title (appears in browser tab)' }
      }),
      slug: text({ 
        validation: { isRequired: true },
        isIndexed: 'unique',
        ui: { description: 'URL path (e.g., "about-us")' }
      }),
      content: document({
        formatting: true,
        dividers: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        ui: { 
          views: './components/component-blocks',
          description: 'Main page content with rich text editor' 
        }
      }),
      backgroundType: select({
        options: [
          { label: 'None', value: 'NONE' },
          { label: 'Color', value: 'COLOR' },
          { label: 'Image', value: 'IMAGE' },
          { label: 'Video', value: 'VIDEO' },
        ],
        defaultValue: 'NONE',
        ui: { description: 'Type of background for this page' }
      }),
      backgroundColor: text({
        ui: { 
          description: 'Hex color code (e.g., #FF5733)',
          displayMode: 'segmented-control' 
        }
      }),
      backgroundImage: image({ 
        storage: 'local_images',
        ui: { description: 'Background image (recommended: 1920x1080px)' }
      }),
      backgroundVideo: file({ 
        storage: 'local_files',
        ui: { description: 'Background video (MP4 format, max 20MB)' }
      }),
      metaTitle: text({
        ui: { description: 'SEO title (50-60 characters)' }
      }),
      metaDescription: text({
        ui: { 
          displayMode: 'textarea',
          description: 'SEO description (150-160 characters)' 
        }
      }),
      isPublished: checkbox({ 
        defaultValue: true,
        ui: { description: 'Make page visible on website' }
      }),
      publishedAt: timestamp({
        ui: { description: 'Schedule publication date' }
      }),
      createdAt: timestamp({ 
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['title', 'slug', 'isPublished', 'publishedAt'],
      },
      label: 'Pages',
      description: 'Manage website pages and their backgrounds',
    },
  }),

  // Theme Settings with color picker
  ThemeSettings: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: ({ session }) => session?.data.role === 'ADMIN',
        update: ({ session }) => session?.data.role === 'ADMIN',
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      name: text({ 
        validation: { isRequired: true },
        ui: { description: 'Theme name (e.g., "Summer 2024")' }
      }),
      isActive: checkbox({
        ui: { description: 'Set as active theme' }
      }),
      // Brand Colors
      primaryColor: text({
        validation: { isRequired: true },
        defaultValue: '#FF6B35',
        ui: { description: 'Primary brand color (hex code)' }
      }),
      secondaryColor: text({
        defaultValue: '#004E64',
        ui: { description: 'Secondary brand color (hex code)' }
      }),
      accentColor: text({
        defaultValue: '#25A18E',
        ui: { description: 'Accent color for highlights (hex code)' }
      }),
      // Background Colors
      backgroundColor: text({
        defaultValue: '#FFFFFF',
        ui: { description: 'Main background color (hex code)' }
      }),
      surfaceColor: text({
        defaultValue: '#F8F9FA',
        ui: { description: 'Card/surface background color (hex code)' }
      }),
      // Text Colors
      textPrimary: text({
        defaultValue: '#212529',
        ui: { description: 'Primary text color (hex code)' }
      }),
      textSecondary: text({
        defaultValue: '#6C757D',
        ui: { description: 'Secondary text color (hex code)' }
      }),
      textOnPrimary: text({
        defaultValue: '#FFFFFF',
        ui: { description: 'Text color on primary background (hex code)' }
      }),
      // Status Colors
      successColor: text({
        defaultValue: '#28A745',
        ui: { description: 'Success/positive color (hex code)' }
      }),
      errorColor: text({
        defaultValue: '#DC3545',
        ui: { description: 'Error/danger color (hex code)' }
      }),
      warningColor: text({
        defaultValue: '#FFC107',
        ui: { description: 'Warning color (hex code)' }
      }),
      infoColor: text({
        defaultValue: '#17A2B8',
        ui: { description: 'Info color (hex code)' }
      }),
      // Typography
      fontFamily: select({
        options: [
          { label: 'System Default', value: 'system' },
          { label: 'Poppins', value: 'Poppins' },
          { label: 'Roboto', value: 'Roboto' },
          { label: 'Open Sans', value: 'Open Sans' },
          { label: 'Montserrat', value: 'Montserrat' },
          { label: 'Playfair Display', value: 'Playfair Display' },
        ],
        defaultValue: 'Poppins',
        ui: { description: 'Primary font family' }
      }),
      fontSize: select({
        options: [
          { label: 'Small', value: '14px' },
          { label: 'Medium', value: '16px' },
          { label: 'Large', value: '18px' },
        ],
        defaultValue: '16px',
        ui: { description: 'Base font size' }
      }),
      // Layout
      borderRadius: select({
        options: [
          { label: 'Sharp', value: '0px' },
          { label: 'Small', value: '4px' },
          { label: 'Medium', value: '8px' },
          { label: 'Large', value: '16px' },
          { label: 'Round', value: '999px' },
        ],
        defaultValue: '8px',
        ui: { description: 'Border radius for cards and buttons' }
      }),
      // Logo
      logo: image({
        storage: 'local_images',
        ui: { description: 'Restaurant logo (SVG or PNG with transparency)' }
      }),
      darkLogo: image({
        storage: 'local_images',
        ui: { description: 'Logo for dark backgrounds (optional)' }
      }),
      createdAt: timestamp({ 
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'isActive', 'primaryColor', 'secondaryColor'],
      },
      label: 'Theme Settings',
      singular: 'Theme',
      plural: 'Themes',
      description: 'Manage website themes and color schemes',
    },
  }),

  // Quote Templates with rich text
  QuoteTemplate: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: ({ session }) => !!session,
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      name: text({ 
        validation: { isRequired: true },
        ui: { description: 'Template name (internal use)' }
      }),
      type: select({
        options: [
          { label: 'Food Truck Service', value: 'FOOD_TRUCK' },
          { label: 'Mobile Bar', value: 'MOBILE_BAR' },
          { label: 'Catering', value: 'CATERING' },
          { label: 'Private Event', value: 'PRIVATE_EVENT' },
        ],
        validation: { isRequired: true },
        ui: { description: 'Type of service this template is for' }
      }),
      subject: text({
        validation: { isRequired: true },
        ui: { description: 'Email subject line' }
      }),
      header: document({
        formatting: true,
        dividers: true,
        links: true,
        ui: { description: 'Quote header content' }
      }),
      body: document({
        formatting: true,
        dividers: true,
        links: true,
        ui: { description: 'Main quote content (use {{variables}} for dynamic data)' }
      }),
      footer: document({
        formatting: true,
        dividers: true,
        links: true,
        ui: { description: 'Quote footer content' }
      }),
      logo: image({
        storage: 'local_images',
        ui: { description: 'Logo to appear on quotes' }
      }),
      termsAndConditions: document({
        formatting: true,
        ui: { description: 'Terms and conditions text' }
      }),
      validityDays: integer({
        defaultValue: 30,
        ui: { description: 'How many days the quote is valid' }
      }),
      includePaymentLink: checkbox({
        defaultValue: true,
        ui: { description: 'Include Stripe payment link in quotes' }
      }),
      variables: json({
        ui: { 
          description: 'Available variables: {{customerName}}, {{eventDate}}, {{totalAmount}}, {{items}}',
          itemView: { fieldMode: 'read' }
        }
      }),
      isActive: checkbox({
        defaultValue: true,
        ui: { description: 'Use this template for new quotes' }
      }),
      createdAt: timestamp({ 
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'type', 'isActive', 'validityDays'],
      },
      label: 'Quote Templates',
      description: 'Manage templates for quotes and proposals',
    },
  }),

  // Email Subscribers with CSV import
  EmailSubscriber: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: ({ session }) => !!session,
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      email: text({ 
        validation: { isRequired: true },
        isIndexed: 'unique',
        ui: { description: 'Subscriber email address' }
      }),
      firstName: text({
        ui: { description: 'Subscriber first name' }
      }),
      lastName: text({
        ui: { description: 'Subscriber last name' }
      }),
      status: select({
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Unsubscribed', value: 'UNSUBSCRIBED' },
          { label: 'Bounced', value: 'BOUNCED' },
        ],
        defaultValue: 'ACTIVE',
        ui: { description: 'Subscription status' }
      }),
      tags: json({
        defaultValue: [],
        ui: { 
          description: 'Tags for segmentation (e.g., ["vip", "newsletter"])',
          views: './components/tags-field'
        }
      }),
      source: text({
        ui: { description: 'How they subscribed (e.g., "website", "event")' }
      }),
      subscribedAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { description: 'Subscription date' }
      }),
      unsubscribedAt: timestamp({
        ui: { description: 'Unsubscribe date (if applicable)' }
      }),
      totalEmailsSent: integer({
        defaultValue: 0,
        ui: { 
          description: 'Total emails sent to this subscriber',
          itemView: { fieldMode: 'read' }
        }
      }),
      totalOpens: integer({
        defaultValue: 0,
        ui: { 
          description: 'Total email opens',
          itemView: { fieldMode: 'read' }
        }
      }),
      totalClicks: integer({
        defaultValue: 0,
        ui: { 
          description: 'Total link clicks',
          itemView: { fieldMode: 'read' }
        }
      }),
      importBatch: text({
        ui: { description: 'CSV import batch identifier' }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['email', 'firstName', 'status', 'source', 'subscribedAt'],
        initialSort: { field: 'subscribedAt', direction: 'DESC' },
        pageSize: 50,
      },
      label: 'Email Subscribers',
      description: 'Manage email list subscribers',
    },
  }),

  // Analytics Dashboard (Read-only)
  AnalyticsSummary: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: () => false, // Read-only
        update: () => false, // Read-only
        delete: () => false, // Read-only
      },
    },
    fields: {
      date: timestamp({
        validation: { isRequired: true },
        ui: { 
          description: 'Analytics date',
          itemView: { fieldMode: 'read' }
        }
      }),
      totalVisitors: integer({
        ui: { 
          description: 'Total unique visitors',
          itemView: { fieldMode: 'read' }
        }
      }),
      pageViews: integer({
        ui: { 
          description: 'Total page views',
          itemView: { fieldMode: 'read' }
        }
      }),
      averageSessionDuration: decimal({
        precision: 10,
        scale: 2,
        ui: { 
          description: 'Average session duration (minutes)',
          itemView: { fieldMode: 'read' }
        }
      }),
      bounceRate: decimal({
        precision: 5,
        scale: 2,
        ui: { 
          description: 'Bounce rate percentage',
          itemView: { fieldMode: 'read' }
        }
      }),
      topPages: json({
        ui: { 
          description: 'Most visited pages',
          itemView: { fieldMode: 'read' }
        }
      }),
      topReferrers: json({
        ui: { 
          description: 'Top traffic sources',
          itemView: { fieldMode: 'read' }
        }
      }),
      deviceBreakdown: json({
        ui: { 
          description: 'Desktop vs Mobile vs Tablet',
          itemView: { fieldMode: 'read' }
        }
      }),
      conversions: json({
        ui: { 
          description: 'Conversion metrics',
          itemView: { fieldMode: 'read' }
        }
      }),
      revenue: decimal({
        precision: 10,
        scale: 2,
        ui: { 
          description: 'Total revenue for the day',
          itemView: { fieldMode: 'read' }
        }
      }),
      orders: integer({
        ui: { 
          description: 'Total orders',
          itemView: { fieldMode: 'read' }
        }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['date', 'totalVisitors', 'pageViews', 'bounceRate', 'revenue'],
        initialSort: { field: 'date', direction: 'DESC' },
      },
      label: 'Analytics Dashboard',
      singular: 'Analytics',
      plural: 'Analytics',
      description: 'View website analytics and performance metrics (read-only)',
      itemView: {
        defaultFieldMode: 'read',
      },
    },
  }),

  // Customer Relationship Management
  Customer: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: ({ session }) => !!session,
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      firstName: text({
        validation: { isRequired: true },
        ui: { description: 'Customer first name' }
      }),
      lastName: text({
        validation: { isRequired: true },
        ui: { description: 'Customer last name' }
      }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        ui: { description: 'Customer email' }
      }),
      phone: text({
        ui: { description: 'Phone number' }
      }),
      company: text({
        ui: { description: 'Company name (if applicable)' }
      }),
      notes: text({
        ui: { 
          displayMode: 'textarea',
          description: 'Internal notes about customer' 
        }
      }),
      vipStatus: checkbox({
        ui: { description: 'Mark as VIP customer' }
      }),
      totalSpent: decimal({
        precision: 10,
        scale: 2,
        defaultValue: '0',
        ui: { 
          description: 'Total amount spent',
          itemView: { fieldMode: 'read' }
        }
      }),
      lastOrderDate: timestamp({
        ui: { 
          description: 'Date of last order',
          itemView: { fieldMode: 'read' }
        }
      }),
      tags: json({
        defaultValue: [],
        ui: { description: 'Customer tags for segmentation' }
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['firstName', 'lastName', 'email', 'vipStatus', 'totalSpent'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
      label: 'Customers',
      description: 'Customer relationship management',
    },
  }),

  // Inquiries Management
  Inquiry: list({
    access: {
      operation: {
        query: ({ session }) => !!session,
        create: () => true, // Public can submit
        update: ({ session }) => !!session,
        delete: ({ session }) => session?.data.role === 'ADMIN',
      },
    },
    fields: {
      type: select({
        options: [
          { label: 'General Inquiry', value: 'GENERAL' },
          { label: 'Food Truck Service', value: 'FOOD_TRUCK' },
          { label: 'Mobile Bar', value: 'MOBILE_BAR' },
          { label: 'Catering', value: 'CATERING' },
          { label: 'Private Event', value: 'PRIVATE_EVENT' },
          { label: 'Reservation', value: 'RESERVATION' },
        ],
        validation: { isRequired: true },
        ui: { description: 'Type of inquiry' }
      }),
      status: select({
        options: [
          { label: 'New', value: 'NEW' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Quoted', value: 'QUOTED' },
          { label: 'Closed', value: 'CLOSED' },
        ],
        defaultValue: 'NEW',
        ui: { description: 'Current status' }
      }),
      priority: select({
        options: [
          { label: 'Low', value: 'LOW' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'High', value: 'HIGH' },
          { label: 'Urgent', value: 'URGENT' },
        ],
        defaultValue: 'MEDIUM',
        ui: { description: 'Priority level' }
      }),
      name: text({
        validation: { isRequired: true },
        ui: { description: 'Contact name' }
      }),
      email: text({
        validation: { isRequired: true },
        ui: { description: 'Contact email' }
      }),
      phone: text({
        ui: { description: 'Contact phone' }
      }),
      eventDate: timestamp({
        ui: { description: 'Requested event date' }
      }),
      guestCount: integer({
        ui: { description: 'Expected number of guests' }
      }),
      message: text({
        validation: { isRequired: true },
        ui: { 
          displayMode: 'textarea',
          description: 'Inquiry message' 
        }
      }),
      budget: text({
        ui: { description: 'Budget range' }
      }),
      location: text({
        ui: { description: 'Event location' }
      }),
      internalNotes: text({
        ui: { 
          displayMode: 'textarea',
          description: 'Staff notes (not visible to customer)' 
        }
      }),
      assignedTo: relationship({
        ref: 'User',
        ui: { description: 'Staff member handling this inquiry' }
      }),
      customer: relationship({
        ref: 'Customer',
        ui: { description: 'Link to customer record' }
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
        ui: { itemView: { fieldMode: 'read' } }
      }),
      respondedAt: timestamp({
        ui: { description: 'When staff responded' }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'type', 'status', 'priority', 'createdAt'],
        initialSort: { field: 'createdAt', direction: 'DESC' },
      },
      label: 'Inquiries',
      description: 'Manage customer inquiries and leads',
    },
  }),
};
