import { api } from './client';

export interface InstantQuotePackage {
  id: string;
  name: string;
  rate: number; // Rate per guest per hour
}

export interface InstantQuoteSettings {
  packages: InstantQuotePackage[];
}

export const instantQuotesAPI = {
  // Get instant quote packages for a service
  getPackages: async (serviceType: 'mobile-bar' | 'food-truck'): Promise<InstantQuotePackage[]> => {
    try {
      const response = await api.get(`/services/${serviceType}`);
      const serviceData = response.data.data || response.data;
      
      // Filter packages that are enabled for instant quotes and have rates
      const instantQuotePackages = (serviceData.packages || [])
        .filter((pkg: any) => pkg.instantQuoteEnabled && pkg.instantQuoteRate > 0)
        .map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          rate: pkg.instantQuoteRate
        }));
      
      return instantQuotePackages;
    } catch (error) {
      console.error('Failed to fetch instant quote packages:', error);
      // Return default packages as fallback
      return getDefaultPackages(serviceType);
    }
  }
};

function getDefaultPackages(serviceType: 'mobile-bar' | 'food-truck'): InstantQuotePackage[] {
  if (serviceType === 'mobile-bar') {
    return [
      { id: 'basic', name: 'Essential Bar', rate: 15 },
      { id: 'premium', name: 'Premium Experience', rate: 25 },
      { id: 'luxury', name: 'Luxury Collection', rate: 40 }
    ];
  } else {
    return [
      { id: 'basic', name: 'Basic Package', rate: 15 },
      { id: 'standard', name: 'Standard Package', rate: 25 },
      { id: 'premium', name: 'Premium Package', rate: 40 }
    ];
  }
}
