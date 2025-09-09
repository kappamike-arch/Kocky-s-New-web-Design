/**
 * Decode HTML entities to regular text
 * Handles common HTML entities like &#x27; (apostrophe), &amp; (ampersand), etc.
 */
export function decodeHtmlEntities(str: string | null | undefined): string {
  if (!str) return '';
  
  // Create a temporary DOM element to decode entities
  if (typeof window !== 'undefined') {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
  }
  
  // Server-side fallback: manual replacement of common entities
  // Handle nested entities by applying multiple passes
  let result = str;
  for (let i = 0; i < 5; i++) { // Multiple passes to handle nested entities
    result = result
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x2F;/g, '/')
      .replace(/&#x5C;/g, '\\')
      .replace(/&#96;/g, '`');
  }
  return result;
}

/**
 * Safely build URL query parameters without HTML encoding
 */
export function buildQueryParams(params: Record<string, string | number | boolean | null | undefined>): string {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlParams.append(key, String(value));
    }
  });
  
  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Clean and decode text for safe rendering
 */
export function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return decodeHtmlEntities(text);
}


