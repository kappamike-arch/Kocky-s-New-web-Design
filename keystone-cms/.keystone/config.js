"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);
var import_core2 = require("@keystone-6/core");

// schema.ts
var import_core = require("@keystone-6/core");
var import_fields = require("@keystone-6/fields");
var import_fields_document = require("@keystone-6/fields-document");
var lists = {
  // User management for CMS access
  User: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: ({ session: session2 }) => session2?.data.role === "ADMIN",
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      name: (0, import_fields.text)({ validation: { isRequired: true } }),
      email: (0, import_fields.text)({
        validation: { isRequired: true },
        isIndexed: "unique"
      }),
      password: (0, import_fields.password)({ validation: { isRequired: true } }),
      role: (0, import_fields.select)({
        options: [
          { label: "Admin", value: "ADMIN" },
          { label: "Staff", value: "STAFF" },
          { label: "Customer", value: "CUSTOMER" }
        ],
        defaultValue: "STAFF",
        validation: { isRequired: true }
      }),
      createdAt: (0, import_fields.timestamp)({ defaultValue: { kind: "now" } })
    },
    ui: {
      listView: {
        initialColumns: ["name", "email", "role", "createdAt"]
      }
    }
  }),
  // Menu Items with image upload
  MenuItem: (0, import_core.list)({
    access: {
      operation: {
        query: () => true,
        // Public can view
        create: ({ session: session2 }) => !!session2,
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      name: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: {
          description: 'Name of the menu item (e.g., "Grilled Chicken Sandwich")'
        }
      }),
      description: (0, import_fields.text)({
        ui: {
          displayMode: "textarea",
          description: "Appetizing description of the dish"
        }
      }),
      category: (0, import_fields.select)({
        options: [
          { label: "Appetizers", value: "APPETIZERS" },
          { label: "Entrees", value: "ENTREES" },
          { label: "Desserts", value: "DESSERTS" },
          { label: "Beverages", value: "BEVERAGES" },
          { label: "Specials", value: "SPECIALS" },
          { label: "Kids Menu", value: "KIDS" }
        ],
        validation: { isRequired: true },
        ui: { description: "Category for menu organization" }
      }),
      price: (0, import_fields.decimal)({
        validation: { isRequired: true, min: "0" },
        precision: 10,
        scale: 2,
        ui: { description: "Price in dollars (e.g., 12.99)" }
      }),
      image: (0, import_fields.image)({
        storage: "local_images",
        ui: { description: "Photo of the dish (recommended: 800x600px)" }
      }),
      isAvailable: (0, import_fields.checkbox)({
        defaultValue: true,
        ui: { description: "Toggle to show/hide item on website" }
      }),
      isVegetarian: (0, import_fields.checkbox)({
        ui: { description: "Mark if suitable for vegetarians" }
      }),
      isGlutenFree: (0, import_fields.checkbox)({
        ui: { description: "Mark if gluten-free" }
      }),
      spicyLevel: (0, import_fields.select)({
        options: [
          { label: "Not Spicy", value: "0" },
          { label: "Mild", value: "1" },
          { label: "Medium", value: "2" },
          { label: "Hot", value: "3" },
          { label: "Extra Hot", value: "4" }
        ],
        ui: { description: "Spice level indicator" }
      }),
      calories: (0, import_fields.integer)({
        ui: { description: "Calorie count (optional)" }
      }),
      allergens: (0, import_fields.text)({
        ui: {
          displayMode: "textarea",
          description: 'List any allergens (e.g., "Contains nuts, dairy")'
        }
      }),
      preparationTime: (0, import_fields.integer)({
        ui: { description: "Estimated prep time in minutes" }
      }),
      featured: (0, import_fields.checkbox)({
        ui: { description: "Show in featured section on homepage" }
      }),
      displayOrder: (0, import_fields.integer)({
        defaultValue: 0,
        ui: { description: "Order to display (lower numbers show first)" }
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { itemView: { fieldMode: "read" } }
      }),
      updatedAt: (0, import_fields.timestamp)({
        db: { updatedAt: true },
        ui: { itemView: { fieldMode: "read" } }
      })
    },
    ui: {
      listView: {
        initialColumns: ["name", "category", "price", "isAvailable", "featured"]
      },
      label: "Menu Items",
      singular: "Menu Item",
      plural: "Menu Items",
      description: "Manage your restaurant menu items"
    }
  }),
  // Page Management with backgrounds
  Page: (0, import_core.list)({
    access: {
      operation: {
        query: () => true,
        create: ({ session: session2 }) => !!session2,
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      title: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Page title (appears in browser tab)" }
      }),
      slug: (0, import_fields.text)({
        validation: { isRequired: true },
        isIndexed: "unique",
        ui: { description: 'URL path (e.g., "about-us")' }
      }),
      content: (0, import_fields_document.document)({
        formatting: true,
        dividers: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1]
        ],
        ui: {
          views: "./components/component-blocks",
          description: "Main page content with rich text editor"
        }
      }),
      backgroundType: (0, import_fields.select)({
        options: [
          { label: "None", value: "NONE" },
          { label: "Color", value: "COLOR" },
          { label: "Image", value: "IMAGE" },
          { label: "Video", value: "VIDEO" }
        ],
        defaultValue: "NONE",
        ui: { description: "Type of background for this page" }
      }),
      backgroundColor: (0, import_fields.text)({
        ui: {
          description: "Hex color code (e.g., #FF5733)",
          displayMode: "segmented-control"
        }
      }),
      backgroundImage: (0, import_fields.image)({
        storage: "local_images",
        ui: { description: "Background image (recommended: 1920x1080px)" }
      }),
      backgroundVideo: (0, import_fields.file)({
        storage: "local_files",
        ui: { description: "Background video (MP4 format, max 20MB)" }
      }),
      metaTitle: (0, import_fields.text)({
        ui: { description: "SEO title (50-60 characters)" }
      }),
      metaDescription: (0, import_fields.text)({
        ui: {
          displayMode: "textarea",
          description: "SEO description (150-160 characters)"
        }
      }),
      isPublished: (0, import_fields.checkbox)({
        defaultValue: true,
        ui: { description: "Make page visible on website" }
      }),
      publishedAt: (0, import_fields.timestamp)({
        ui: { description: "Schedule publication date" }
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { itemView: { fieldMode: "read" } }
      })
    },
    ui: {
      listView: {
        initialColumns: ["title", "slug", "isPublished", "publishedAt"]
      },
      label: "Pages",
      description: "Manage website pages and their backgrounds"
    }
  }),
  // Theme Settings with color picker
  ThemeSettings: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: ({ session: session2 }) => session2?.data.role === "ADMIN",
        update: ({ session: session2 }) => session2?.data.role === "ADMIN",
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      name: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: 'Theme name (e.g., "Summer 2024")' }
      }),
      isActive: (0, import_fields.checkbox)({
        ui: { description: "Set as active theme" }
      }),
      // Brand Colors
      primaryColor: (0, import_fields.text)({
        validation: { isRequired: true },
        defaultValue: "#FF6B35",
        ui: { description: "Primary brand color (hex code)" }
      }),
      secondaryColor: (0, import_fields.text)({
        defaultValue: "#004E64",
        ui: { description: "Secondary brand color (hex code)" }
      }),
      accentColor: (0, import_fields.text)({
        defaultValue: "#25A18E",
        ui: { description: "Accent color for highlights (hex code)" }
      }),
      // Background Colors
      backgroundColor: (0, import_fields.text)({
        defaultValue: "#FFFFFF",
        ui: { description: "Main background color (hex code)" }
      }),
      surfaceColor: (0, import_fields.text)({
        defaultValue: "#F8F9FA",
        ui: { description: "Card/surface background color (hex code)" }
      }),
      // Text Colors
      textPrimary: (0, import_fields.text)({
        defaultValue: "#212529",
        ui: { description: "Primary text color (hex code)" }
      }),
      textSecondary: (0, import_fields.text)({
        defaultValue: "#6C757D",
        ui: { description: "Secondary text color (hex code)" }
      }),
      textOnPrimary: (0, import_fields.text)({
        defaultValue: "#FFFFFF",
        ui: { description: "Text color on primary background (hex code)" }
      }),
      // Status Colors
      successColor: (0, import_fields.text)({
        defaultValue: "#28A745",
        ui: { description: "Success/positive color (hex code)" }
      }),
      errorColor: (0, import_fields.text)({
        defaultValue: "#DC3545",
        ui: { description: "Error/danger color (hex code)" }
      }),
      warningColor: (0, import_fields.text)({
        defaultValue: "#FFC107",
        ui: { description: "Warning color (hex code)" }
      }),
      infoColor: (0, import_fields.text)({
        defaultValue: "#17A2B8",
        ui: { description: "Info color (hex code)" }
      }),
      // Typography
      fontFamily: (0, import_fields.select)({
        options: [
          { label: "System Default", value: "system" },
          { label: "Poppins", value: "Poppins" },
          { label: "Roboto", value: "Roboto" },
          { label: "Open Sans", value: "Open Sans" },
          { label: "Montserrat", value: "Montserrat" },
          { label: "Playfair Display", value: "Playfair Display" }
        ],
        defaultValue: "Poppins",
        ui: { description: "Primary font family" }
      }),
      fontSize: (0, import_fields.select)({
        options: [
          { label: "Small", value: "14px" },
          { label: "Medium", value: "16px" },
          { label: "Large", value: "18px" }
        ],
        defaultValue: "16px",
        ui: { description: "Base font size" }
      }),
      // Layout
      borderRadius: (0, import_fields.select)({
        options: [
          { label: "Sharp", value: "0px" },
          { label: "Small", value: "4px" },
          { label: "Medium", value: "8px" },
          { label: "Large", value: "16px" },
          { label: "Round", value: "999px" }
        ],
        defaultValue: "8px",
        ui: { description: "Border radius for cards and buttons" }
      }),
      // Logo
      logo: (0, import_fields.image)({
        storage: "local_images",
        ui: { description: "Restaurant logo (SVG or PNG with transparency)" }
      }),
      darkLogo: (0, import_fields.image)({
        storage: "local_images",
        ui: { description: "Logo for dark backgrounds (optional)" }
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { itemView: { fieldMode: "read" } }
      })
    },
    ui: {
      listView: {
        initialColumns: ["name", "isActive", "primaryColor", "secondaryColor"]
      },
      label: "Theme Settings",
      singular: "Theme",
      plural: "Themes",
      description: "Manage website themes and color schemes"
    }
  }),
  // Quote Templates with rich text
  QuoteTemplate: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: ({ session: session2 }) => !!session2,
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      name: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Template name (internal use)" }
      }),
      type: (0, import_fields.select)({
        options: [
          { label: "Food Truck Service", value: "FOOD_TRUCK" },
          { label: "Mobile Bar", value: "MOBILE_BAR" },
          { label: "Catering", value: "CATERING" },
          { label: "Private Event", value: "PRIVATE_EVENT" }
        ],
        validation: { isRequired: true },
        ui: { description: "Type of service this template is for" }
      }),
      subject: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Email subject line" }
      }),
      header: (0, import_fields_document.document)({
        formatting: true,
        dividers: true,
        links: true,
        ui: { description: "Quote header content" }
      }),
      body: (0, import_fields_document.document)({
        formatting: true,
        dividers: true,
        links: true,
        ui: { description: "Main quote content (use {{variables}} for dynamic data)" }
      }),
      footer: (0, import_fields_document.document)({
        formatting: true,
        dividers: true,
        links: true,
        ui: { description: "Quote footer content" }
      }),
      logo: (0, import_fields.image)({
        storage: "local_images",
        ui: { description: "Logo to appear on quotes" }
      }),
      termsAndConditions: (0, import_fields_document.document)({
        formatting: true,
        ui: { description: "Terms and conditions text" }
      }),
      validityDays: (0, import_fields.integer)({
        defaultValue: 30,
        ui: { description: "How many days the quote is valid" }
      }),
      includePaymentLink: (0, import_fields.checkbox)({
        defaultValue: true,
        ui: { description: "Include Stripe payment link in quotes" }
      }),
      variables: (0, import_fields.json)({
        ui: {
          description: "Available variables: {{customerName}}, {{eventDate}}, {{totalAmount}}, {{items}}",
          itemView: { fieldMode: "read" }
        }
      }),
      isActive: (0, import_fields.checkbox)({
        defaultValue: true,
        ui: { description: "Use this template for new quotes" }
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { itemView: { fieldMode: "read" } }
      })
    },
    ui: {
      listView: {
        initialColumns: ["name", "type", "isActive", "validityDays"]
      },
      label: "Quote Templates",
      description: "Manage templates for quotes and proposals"
    }
  }),
  // Email Subscribers with CSV import
  EmailSubscriber: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: ({ session: session2 }) => !!session2,
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      email: (0, import_fields.text)({
        validation: { isRequired: true },
        isIndexed: "unique",
        ui: { description: "Subscriber email address" }
      }),
      firstName: (0, import_fields.text)({
        ui: { description: "Subscriber first name" }
      }),
      lastName: (0, import_fields.text)({
        ui: { description: "Subscriber last name" }
      }),
      status: (0, import_fields.select)({
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Unsubscribed", value: "UNSUBSCRIBED" },
          { label: "Bounced", value: "BOUNCED" }
        ],
        defaultValue: "ACTIVE",
        ui: { description: "Subscription status" }
      }),
      tags: (0, import_fields.json)({
        defaultValue: [],
        ui: {
          description: 'Tags for segmentation (e.g., ["vip", "newsletter"])',
          views: "./components/tags-field"
        }
      }),
      source: (0, import_fields.text)({
        ui: { description: 'How they subscribed (e.g., "website", "event")' }
      }),
      subscribedAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { description: "Subscription date" }
      }),
      unsubscribedAt: (0, import_fields.timestamp)({
        ui: { description: "Unsubscribe date (if applicable)" }
      }),
      totalEmailsSent: (0, import_fields.integer)({
        defaultValue: 0,
        ui: {
          description: "Total emails sent to this subscriber",
          itemView: { fieldMode: "read" }
        }
      }),
      totalOpens: (0, import_fields.integer)({
        defaultValue: 0,
        ui: {
          description: "Total email opens",
          itemView: { fieldMode: "read" }
        }
      }),
      totalClicks: (0, import_fields.integer)({
        defaultValue: 0,
        ui: {
          description: "Total link clicks",
          itemView: { fieldMode: "read" }
        }
      }),
      importBatch: (0, import_fields.text)({
        ui: { description: "CSV import batch identifier" }
      })
    },
    ui: {
      listView: {
        initialColumns: ["email", "firstName", "status", "source", "subscribedAt"],
        initialSort: { field: "subscribedAt", direction: "DESC" },
        pageSize: 50
      },
      label: "Email Subscribers",
      description: "Manage email list subscribers"
    }
  }),
  // Analytics Dashboard (Read-only)
  AnalyticsSummary: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: () => false,
        // Read-only
        update: () => false,
        // Read-only
        delete: () => false
        // Read-only
      }
    },
    fields: {
      date: (0, import_fields.timestamp)({
        validation: { isRequired: true },
        ui: {
          description: "Analytics date",
          itemView: { fieldMode: "read" }
        }
      }),
      totalVisitors: (0, import_fields.integer)({
        ui: {
          description: "Total unique visitors",
          itemView: { fieldMode: "read" }
        }
      }),
      pageViews: (0, import_fields.integer)({
        ui: {
          description: "Total page views",
          itemView: { fieldMode: "read" }
        }
      }),
      averageSessionDuration: (0, import_fields.decimal)({
        precision: 10,
        scale: 2,
        ui: {
          description: "Average session duration (minutes)",
          itemView: { fieldMode: "read" }
        }
      }),
      bounceRate: (0, import_fields.decimal)({
        precision: 5,
        scale: 2,
        ui: {
          description: "Bounce rate percentage",
          itemView: { fieldMode: "read" }
        }
      }),
      topPages: (0, import_fields.json)({
        ui: {
          description: "Most visited pages",
          itemView: { fieldMode: "read" }
        }
      }),
      topReferrers: (0, import_fields.json)({
        ui: {
          description: "Top traffic sources",
          itemView: { fieldMode: "read" }
        }
      }),
      deviceBreakdown: (0, import_fields.json)({
        ui: {
          description: "Desktop vs Mobile vs Tablet",
          itemView: { fieldMode: "read" }
        }
      }),
      conversions: (0, import_fields.json)({
        ui: {
          description: "Conversion metrics",
          itemView: { fieldMode: "read" }
        }
      }),
      revenue: (0, import_fields.decimal)({
        precision: 10,
        scale: 2,
        ui: {
          description: "Total revenue for the day",
          itemView: { fieldMode: "read" }
        }
      }),
      orders: (0, import_fields.integer)({
        ui: {
          description: "Total orders",
          itemView: { fieldMode: "read" }
        }
      })
    },
    ui: {
      listView: {
        initialColumns: ["date", "totalVisitors", "pageViews", "bounceRate", "revenue"],
        initialSort: { field: "date", direction: "DESC" }
      },
      label: "Analytics Dashboard",
      singular: "Analytics",
      plural: "Analytics",
      description: "View website analytics and performance metrics (read-only)",
      itemView: {
        defaultFieldMode: "read"
      }
    }
  }),
  // Customer Relationship Management
  Customer: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: ({ session: session2 }) => !!session2,
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      firstName: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Customer first name" }
      }),
      lastName: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Customer last name" }
      }),
      email: (0, import_fields.text)({
        validation: { isRequired: true },
        isIndexed: "unique",
        ui: { description: "Customer email" }
      }),
      phone: (0, import_fields.text)({
        ui: { description: "Phone number" }
      }),
      company: (0, import_fields.text)({
        ui: { description: "Company name (if applicable)" }
      }),
      notes: (0, import_fields.text)({
        ui: {
          displayMode: "textarea",
          description: "Internal notes about customer"
        }
      }),
      vipStatus: (0, import_fields.checkbox)({
        ui: { description: "Mark as VIP customer" }
      }),
      totalSpent: (0, import_fields.decimal)({
        precision: 10,
        scale: 2,
        defaultValue: "0",
        ui: {
          description: "Total amount spent",
          itemView: { fieldMode: "read" }
        }
      }),
      lastOrderDate: (0, import_fields.timestamp)({
        ui: {
          description: "Date of last order",
          itemView: { fieldMode: "read" }
        }
      }),
      tags: (0, import_fields.json)({
        defaultValue: [],
        ui: { description: "Customer tags for segmentation" }
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { itemView: { fieldMode: "read" } }
      })
    },
    ui: {
      listView: {
        initialColumns: ["firstName", "lastName", "email", "vipStatus", "totalSpent"],
        initialSort: { field: "createdAt", direction: "DESC" }
      },
      label: "Customers",
      description: "Customer relationship management"
    }
  }),
  // Inquiries Management
  Inquiry: (0, import_core.list)({
    access: {
      operation: {
        query: ({ session: session2 }) => !!session2,
        create: () => true,
        // Public can submit
        update: ({ session: session2 }) => !!session2,
        delete: ({ session: session2 }) => session2?.data.role === "ADMIN"
      }
    },
    fields: {
      type: (0, import_fields.select)({
        options: [
          { label: "General Inquiry", value: "GENERAL" },
          { label: "Food Truck Service", value: "FOOD_TRUCK" },
          { label: "Mobile Bar", value: "MOBILE_BAR" },
          { label: "Catering", value: "CATERING" },
          { label: "Private Event", value: "PRIVATE_EVENT" },
          { label: "Reservation", value: "RESERVATION" }
        ],
        validation: { isRequired: true },
        ui: { description: "Type of inquiry" }
      }),
      status: (0, import_fields.select)({
        options: [
          { label: "New", value: "NEW" },
          { label: "In Progress", value: "IN_PROGRESS" },
          { label: "Quoted", value: "QUOTED" },
          { label: "Closed", value: "CLOSED" }
        ],
        defaultValue: "NEW",
        ui: { description: "Current status" }
      }),
      priority: (0, import_fields.select)({
        options: [
          { label: "Low", value: "LOW" },
          { label: "Medium", value: "MEDIUM" },
          { label: "High", value: "HIGH" },
          { label: "Urgent", value: "URGENT" }
        ],
        defaultValue: "MEDIUM",
        ui: { description: "Priority level" }
      }),
      name: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Contact name" }
      }),
      email: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: { description: "Contact email" }
      }),
      phone: (0, import_fields.text)({
        ui: { description: "Contact phone" }
      }),
      eventDate: (0, import_fields.timestamp)({
        ui: { description: "Requested event date" }
      }),
      guestCount: (0, import_fields.integer)({
        ui: { description: "Expected number of guests" }
      }),
      message: (0, import_fields.text)({
        validation: { isRequired: true },
        ui: {
          displayMode: "textarea",
          description: "Inquiry message"
        }
      }),
      budget: (0, import_fields.text)({
        ui: { description: "Budget range" }
      }),
      location: (0, import_fields.text)({
        ui: { description: "Event location" }
      }),
      internalNotes: (0, import_fields.text)({
        ui: {
          displayMode: "textarea",
          description: "Staff notes (not visible to customer)"
        }
      }),
      assignedTo: (0, import_fields.relationship)({
        ref: "User",
        ui: { description: "Staff member handling this inquiry" }
      }),
      customer: (0, import_fields.relationship)({
        ref: "Customer",
        ui: { description: "Link to customer record" }
      }),
      createdAt: (0, import_fields.timestamp)({
        defaultValue: { kind: "now" },
        ui: { itemView: { fieldMode: "read" } }
      }),
      respondedAt: (0, import_fields.timestamp)({
        ui: { description: "When staff responded" }
      })
    },
    ui: {
      listView: {
        initialColumns: ["name", "type", "status", "priority", "createdAt"],
        initialSort: { field: "createdAt", direction: "DESC" }
      },
      label: "Inquiries",
      description: "Manage customer inquiries and leads"
    }
  })
};

// auth.ts
var import_auth = require("@keystone-6/auth");
var import_session = require("@keystone-6/core/session");
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  sessionData: "id name email role",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password", "role"],
    itemData: {
      role: "ADMIN"
    }
  }
});
var sessionSecret = process.env.SESSION_SECRET || "your-session-secret-min-32-characters-long-please";
var sessionMaxAge = 60 * 60 * 24 * 30;
var session = (0, import_session.statelessSessions)({
  maxAge: sessionMaxAge,
  secret: sessionSecret
});

// keystone.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config({ path: "../nestjs-backend/.env" });
var databaseConfig = {
  provider: "postgresql",
  url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/kockysbar",
  enableLogging: true,
  idField: { kind: "uuid" }
};
var keystone_default = withAuth(
  (0, import_core2.config)({
    db: databaseConfig,
    lists,
    session,
    server: {
      cors: {
        origin: ["http://72.167.227.205:3003/", "http://localhost:3000"],
        credentials: true
      },
      port: 4e3
    },
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
      publicPages: ["/"]
    },
    storage: {
      // Store images and files locally for development
      local_images: {
        kind: "local",
        type: "image",
        generateUrl: (path) => `http://localhost:4000/images${path}`,
        serverRoute: {
          path: "/images"
        },
        storagePath: "public/images"
      },
      local_files: {
        kind: "local",
        type: "file",
        generateUrl: (path) => `http://localhost:4000/files${path}`,
        serverRoute: {
          path: "/files"
        },
        storagePath: "public/files"
      }
    }
  })
);
//# sourceMappingURL=config.js.map
