/**
 * Safe array conversion utility
 * Ensures that any value is converted to an array, preventing .map() crashes
 */
export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  
  // Handle null/undefined
  if (value == null) {
    return [];
  }
  
  // Handle objects that might have array-like properties
  if (typeof value === 'object') {
    // Check for common array-like properties
    if ('data' in value && Array.isArray((value as any).data)) {
      return (value as any).data as T[];
    }
    if ('items' in value && Array.isArray((value as any).items)) {
      return (value as any).items as T[];
    }
    if ('results' in value && Array.isArray((value as any).results)) {
      return (value as any).results as T[];
    }
    if ('templates' in value && Array.isArray((value as any).templates)) {
      return (value as any).templates as T[];
    }
    if ('campaigns' in value && Array.isArray((value as any).campaigns)) {
      return (value as any).campaigns as T[];
    }
    if ('contacts' in value && Array.isArray((value as any).contacts)) {
      return (value as any).contacts as T[];
    }
  }
  
  // For any other value, return empty array
  return [];
}

/**
 * Safe array conversion with fallback
 * Allows specifying a default value if the input is not an array
 */
export function toArrayWithFallback<T>(value: unknown, fallback: T[] = []): T[] {
  const result = toArray<T>(value);
  return result.length > 0 ? result : fallback;
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}


