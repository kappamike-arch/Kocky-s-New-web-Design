/**
 * Utility functions for handling prices
 */

/**
 * Converts various price formats to a number
 * Handles Prisma Decimal objects, strings, and numbers
 */
export function toNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  if (typeof value === 'object' && value !== null) {
    // Handle Prisma Decimal or similar objects
    if ('toString' in value) {
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) ? 0 : parsed;
    }
    // Try to convert directly
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

/**
 * Formats a price value to a string with 2 decimal places
 */
export function formatPrice(value: any, includeSymbol: boolean = true): string {
  const numValue = toNumber(value);
  const formatted = numValue.toFixed(2);
  return includeSymbol ? `$${formatted}` : formatted;
}

/**
 * Checks if a value is a valid price (non-negative number)
 */
export function isValidPrice(value: any): boolean {
  const num = toNumber(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Parses menu items to convert Prisma Decimal fields to numbers
 */
export function parseMenuItem(item: any): any {
  if (!item) return item;
  
  return {
    ...item,
    price: toNumber(item.price),
    happyHourPrice: item.happyHourPrice ? toNumber(item.happyHourPrice) : null,
    specialPrice: item.specialPrice ? toNumber(item.specialPrice) : null,
  };
}

/**
 * Parses an array of menu items
 */
export function parseMenuItems(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  return items.map(parseMenuItem);
}




