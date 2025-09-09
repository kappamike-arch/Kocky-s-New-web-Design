/**
 * Theme configuration extracted from Kocky's logo
 * Primary colors: Red rooster with yellow accents
 */

export const themeConfig = {
  // Brand colors extracted from logo
  colors: {
    brand: {
      primary: '#DC2626', // Main red from rooster and text
      secondary: '#991B1B', // Darker red for depth
      accent: '#FCD34D', // Yellow from beak
      dark: '#7F1D1D', // Deep red for shadows
      light: '#FCA5A5', // Light red for highlights
    },
    // Supporting colors
    neutral: {
      black: '#000000',
      white: '#FFFFFF',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      }
    },
    // Semantic colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },
  
  // Logo configuration
  logo: {
    path: '/logo.png',
    alt: "Kocky's Bar & Grill - Fresno CA",
    width: 200,
    height: 150,
    mobilePath: '/logo.png', // Same logo for mobile, just sized differently
    mobileWidth: 150,
    mobileHeight: 112
  },

  // Typography
  typography: {
    fontFamily: {
      heading: "'Bebas Neue', sans-serif", // Bold, impactful for headings
      body: "'Inter', sans-serif", // Clean, readable for body text
      accent: "'Pacifico', cursive" // For special accent text matching logo style
    }
  },

  // Gradients matching the logo energy
  gradients: {
    primary: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
    accent: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    hero: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 50%, #991B1B 100%)',
    dark: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)'
  },

  // Social media links
  social: {
    facebook: 'https://facebook.com/kockysbar',
    instagram: 'https://instagram.com/kockysbar',
    twitter: 'https://twitter.com/kockysbar',
    yelp: 'https://yelp.com/biz/kockys-bar-and-grill'
  },

  // Business info
  business: {
    name: "Kocky's Bar & Grill",
    tagline: 'Great Food, Great Times',
    location: 'Fresno, CA',
    phone: '(559) 123-4567',
    email: 'info@kockysbar.com',
    address: '123 Main Street, Fresno, CA 93701'
  }
};

export default themeConfig;
