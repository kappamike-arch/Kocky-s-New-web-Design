import { api } from './client';

export interface ServicePackage {
  id: string;
  name: string;
  price: string;
  duration: string;
  guests: string;
  features: string[];
  popular?: boolean;
  // Instant Quote pricing
  instantQuoteRate?: number; // Rate per guest per hour for instant quotes
  instantQuoteEnabled?: boolean; // Whether this package appears in instant quotes
}

export interface ServiceSettings {
  id: string;
  serviceName: string;
  title: string;
  subtitle: string;
  description: string;
  packages: ServicePackage[];
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  heroImage?: string;
  isActive: boolean;
}

export const servicesAPI = {
  // Get service settings
  getSettings: async (service: 'food-truck' | 'mobile-bar') => {
    try {
      const response = await api.get(`/services/${service}`);
      // Extract the actual settings data from the response
      return response.data.data || response.data;
    } catch (error) {
      // Return default settings if not found
      return getDefaultSettings(service);
    }
  },

  // Update service settings
  updateSettings: async (service: 'food-truck' | 'mobile-bar', data: Partial<ServiceSettings>) => {
    const response = await api.put(`/services/${service}`, data);
    return response.data;
  },

  // Upload hero image
  uploadImage: async (service: 'food-truck' | 'mobile-bar', file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/services/${service}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

function getDefaultSettings(service: 'food-truck' | 'mobile-bar'): ServiceSettings {
  if (service === 'food-truck') {
    return {
      id: 'food-truck',
      serviceName: 'Food Truck',
      title: "Kocky's on Wheels",
      subtitle: 'Bringing Great Food to Your Event',
      description: 'Experience the best of Kocky\'s Bar & Grill wherever you are. Our fully equipped food truck brings our signature dishes right to your event.',
      packages: [
        {
          id: 'basic',
          name: 'Basic Package',
          price: 'Starting at $500',
          duration: '2 hours',
          guests: 'Up to 50 guests',
          features: ['Limited menu', 'Basic setup', 'Paper products included'],
          instantQuoteRate: 15,
          instantQuoteEnabled: true
        },
        {
          id: 'standard',
          name: 'Standard Package',
          price: 'Starting at $1,000',
          duration: '3 hours',
          guests: '50-100 guests',
          features: ['Full menu', 'Professional setup', 'Premium disposables', 'Beverage service'],
          popular: true,
          instantQuoteRate: 25,
          instantQuoteEnabled: true
        },
        {
          id: 'premium',
          name: 'Premium Package',
          price: 'Starting at $2,000',
          duration: '4+ hours',
          guests: '100+ guests',
          features: ['Custom menu', 'Full service team', 'Premium setup', 'Dessert included'],
          instantQuoteRate: 40,
          instantQuoteEnabled: true
        }
      ],
      features: [
        {
          icon: 'Truck',
          title: 'Fully Equipped Kitchen',
          description: 'Professional grade cooking equipment on wheels'
        },
        {
          icon: 'Users',
          title: 'Experienced Staff',
          description: 'Professional chefs and service team'
        },
        {
          icon: 'Clock',
          title: 'Flexible Hours',
          description: 'Available for lunch, dinner, or late night'
        },
        {
          icon: 'Star',
          title: 'Custom Menu',
          description: 'Tailored to your event needs'
        }
      ],
      isActive: true
    };
  } else {
    return {
      id: 'mobile-bar',
      serviceName: 'Mobile Bar',
      title: 'Premium Mobile Bar Service',
      subtitle: 'Elevate Your Event with Professional Bartending',
      description: 'Transform your event into an unforgettable experience with our professional mobile bar service. From craft cocktails to premium spirits, we bring the bar to you.',
      packages: [
        {
          id: 'basic',
          name: 'Essential Bar',
          price: 'Starting at $500',
          duration: 'Up to 3 hours',
          guests: 'Up to 50 guests',
          features: [
            'Professional bartender',
            'Basic bar setup',
            'Beer & Wine selection',
            'Soft drinks & mixers',
            'Ice & garnishes',
            'Disposable barware'
          ],
          instantQuoteRate: 15,
          instantQuoteEnabled: true
        },
        {
          id: 'premium',
          name: 'Premium Experience',
          price: 'Starting at $800',
          duration: 'Up to 4 hours',
          guests: 'Up to 100 guests',
          popular: true,
          features: [
            'Two professional bartenders',
            'Premium bar setup with lighting',
            'Full cocktail menu',
            'Premium spirits selection',
            'Wine & champagne service',
            'Glassware included',
            'Custom cocktail creation',
            'Bar snacks & garnishes'
          ],
          instantQuoteRate: 25,
          instantQuoteEnabled: true
        },
        {
          id: 'luxury',
          name: 'Luxury Collection',
          price: 'Starting at $1,500',
          duration: 'Up to 6 hours',
          guests: 'Up to 200 guests',
          features: [
            'Full bartending team',
            'Luxury mobile bar setup',
            'Top-shelf spirits only',
            'Champagne service',
            'Signature cocktail menu',
            'Premium glassware',
            'LED bar lighting',
            'Dedicated event coordinator',
            'Complimentary tasting session'
          ],
          instantQuoteRate: 40,
          instantQuoteEnabled: true
        }
      ],
      features: [
        {
          icon: 'Wine',
          title: 'Premium Selection',
          description: 'Top-shelf spirits and fine wines'
        },
        {
          icon: 'Star',
          title: 'Expert Mixologists',
          description: 'Professional bartenders with years of experience'
        },
        {
          icon: 'Sparkles',
          title: 'Custom Cocktails',
          description: 'Signature drinks tailored to your event'
        },
        {
          icon: 'CheckCircle',
          title: 'Full Service',
          description: 'Setup, service, and cleanup included'
        }
      ],
      isActive: true
    };
  }
}

