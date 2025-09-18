import { cmsClient } from './client';

export const cms = {
  // Get menu items
  getMenuItems: async (category?: string) => {
    const query = `
      query GetMenuItems($where: MenuItemWhereInput) {
        menuItems(where: $where, orderBy: { displayOrder: asc }) {
          id
          name
          description
          category
          price
          image {
            url
          }
          isAvailable
          isVegetarian
          isGlutenFree
          spicyLevel
          calories
          allergens
          preparationTime
          featured
        }
      }
    `;

    const where = {
      isAvailable: { equals: true },
      ...(category && { category: { equals: category } }),
    };

    return cmsClient.query(query, { where });
  },

  // Get featured menu items
  getFeaturedItems: async (limit = 6) => {
    const query = `
      query GetFeaturedItems($take: Int) {
        menuItems(
          where: { featured: { equals: true }, isAvailable: { equals: true } }
          take: $take
          orderBy: { displayOrder: asc }
        ) {
          id
          name
          description
          category
          price
          image {
            url
          }
        }
      }
    `;

    return cmsClient.query(query, { take: limit });
  },

  // Get page by slug
  getPage: async (slug: string) => {
    const query = `
      query GetPage($slug: String!) {
        pages(where: { slug: { equals: $slug }, isPublished: { equals: true } }) {
          id
          title
          content
          backgroundType
          backgroundColor
          backgroundImage {
            url
          }
          backgroundVideo {
            url
          }
          metaTitle
          metaDescription
        }
      }
    `;

    const data = await cmsClient.query(query, { slug });
    return data.pages?.[0];
  },

  // Get active theme
  getActiveTheme: async () => {
    const query = `
      query GetActiveTheme {
        themeSettings(where: { isActive: { equals: true } }) {
          id
          name
          primaryColor
          secondaryColor
          accentColor
          backgroundColor
          surfaceColor
          textPrimary
          textSecondary
          textOnPrimary
          successColor
          errorColor
          warningColor
          infoColor
          fontFamily
          fontSize
          borderRadius
          logo {
            url
          }
          darkLogo {
            url
          }
        }
      }
    `;

    const data = await cmsClient.query(query);
    return data.themeSettings?.[0];
  },

  // Get inquiries types and templates
  getQuoteTemplates: async (type?: string) => {
    const query = `
      query GetQuoteTemplates($where: QuoteTemplateWhereInput) {
        quoteTemplates(where: $where) {
          id
          name
          type
          subject
          header
          body
          footer
          logo {
            url
          }
          termsAndConditions
          validityDays
          includePaymentLink
        }
      }
    `;

    const where = {
      isActive: { equals: true },
      ...(type && { type: { equals: type } }),
    };

    return cmsClient.query(query, { where });
  },
};
