/**
 * Utility functions to handle Prisma data types in the frontend
 */

/**
 * Convert Prisma Decimal to JavaScript number
 * Prisma Decimal is serialized as a string or object
 * @param value - The Prisma Decimal value
 * @returns A JavaScript number
 */
export function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value && typeof value === 'object' && 'toString' in value) {
    return parseFloat(value.toString());
  }
  return 0;
}

/**
 * Format a price value for display
 * @param value - The price value (could be Prisma Decimal)
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted price string
 */
export function formatPrice(value: any, currency: string = '$'): string {
  const num = toNumber(value);
  return `${currency}${num.toFixed(2)}`;
}

/**
 * Parse JSON field to array
 * Handles both string and array inputs
 */
export function parseJsonArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Safely parse a MenuItem from the API response
 * Converts Prisma Decimal fields to numbers and JSON fields to arrays
 */
export function parseMenuItem(item: any): any {
  return {
    ...item,
    price: toNumber(item.price),
    happyHourPrice: item.happyHourPrice ? toNumber(item.happyHourPrice) : undefined,
    tags: parseJsonArray(item.tags),
    allergens: parseJsonArray(item.allergens),
  };
}

/**
 * Parse an array of menu items
 */
export function parseMenuItems(items: any[]): any[] {
  return items.map(parseMenuItem);
}
