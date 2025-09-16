/**
 * Centralized API Configuration
 * Handles environment-specific API base URLs
 * @deprecated Use src/lib/config.ts instead
 */

import { API_URL, API_BASE_URL } from '../lib/config';

// Re-export for backward compatibility
export { API_URL, API_BASE_URL as API_BASE };

// Debug logging
console.log('🔧 API Configuration (Legacy):');
console.log('  Using centralized config from src/lib/config.ts');
console.log('  API URL:', API_URL);

export default API_URL;
