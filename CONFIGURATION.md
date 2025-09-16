# Centralized Configuration Guide

This document explains the new centralized configuration system for the Kocky's website.

## Overview

We've centralized all URL and environment configuration into dedicated config files to eliminate hardcoded localhost references and make environment management easier.

## Configuration Files

### Frontend (`frontend/src/lib/config.ts`)
- **Purpose**: Centralized configuration for the Next.js frontend
- **Exports**: All base URLs, API endpoints, and environment detection
- **Usage**: Import from any frontend component or page

### Admin Panel (`admin-panel/src/lib/config.ts`)
- **Purpose**: Centralized configuration for the Next.js admin panel
- **Exports**: All base URLs, API endpoints, and environment detection
- **Usage**: Import from any admin panel component or page

## Environment Variables

### New Structure (Recommended)

```bash
# Base URL for the public website
NEXT_PUBLIC_PUBLIC_BASE_URL=https://staging.kockys.com

# API Base URL (can be different from public URL for microservices)
NEXT_PUBLIC_API_BASE_URL=https://staging.kockys.com

# Media/Uploads base URL
NEXT_PUBLIC_MEDIA_BASE_URL=https://staging.kockys.com

# Admin panel URL
NEXT_PUBLIC_ADMIN_BASE_URL=https://staging.kockys.com/admin

# Prisma Studio URL
NEXT_PUBLIC_PRISMA_STUDIO_URL=https://staging.kockys.com/prisma

# Environment (staging, production, development)
NEXT_PUBLIC_ENV=staging
```

### Legacy Variables (Backward Compatibility)

The following legacy variables are still supported but deprecated:

```bash
NEXT_PUBLIC_API_URL=https://staging.kockys.com/api
NEXT_PUBLIC_SITE_URL=https://staging.kockys.com
NEXT_PUBLIC_API_BASE=https://staging.kockys.com
```

## Usage Examples

### Frontend Usage

```typescript
import { 
  API_URL, 
  UPLOADS_URL, 
  PUBLIC_BASE_URL,
  getAssetUrl 
} from '@/lib/config';

// API calls
const response = await fetch(`${API_URL}/menu`);

// Image URLs
const imageUrl = getAssetUrl('/uploads/logo.png');

// Direct URL construction
const fullUrl = `${UPLOADS_URL}/images/hero.jpg`;
```

### Admin Panel Usage

```typescript
import { 
  API_URL, 
  UPLOADS_URL, 
  ADMIN_BASE_URL 
} from '@/lib/config';

// API calls
const response = await fetch(`${API_URL}/admin/dashboard`);

// Admin panel navigation
window.location.href = `${ADMIN_BASE_URL}/settings`;
```

## Environment Detection

The config files provide environment detection helpers:

```typescript
import { 
  IS_PRODUCTION, 
  IS_STAGING, 
  IS_DEVELOPMENT 
} from '@/lib/config';

if (IS_STAGING) {
  console.log('Running in staging environment');
}
```

## Migration Guide

### For New Code
- Always import from `@/lib/config` (frontend) or `@/lib/config` (admin panel)
- Use the exported constants instead of hardcoded URLs
- Use the helper functions for URL construction

### For Existing Code
- Legacy configurations in `src/config/api.ts` and `src/lib/asset-config.ts` are deprecated but still work
- Gradually migrate to the new centralized config
- Update environment variables to use the new structure

## Benefits

1. **No More Hardcoded URLs**: All URLs are centralized and configurable
2. **Environment Flexibility**: Easy switching between staging, production, and development
3. **Consistency**: Same configuration pattern across frontend and admin panel
4. **Maintainability**: Single source of truth for all URL configuration
5. **Type Safety**: TypeScript support for all configuration values

## File Structure

```
frontend/
├── src/
│   └── lib/
│       ├── config.ts          # ✅ New centralized config
│       └── asset-config.ts    # ⚠️  Deprecated (still works)
└── .env.local                 # ✅ Updated with new variables

admin-panel/
├── src/
│   ├── lib/
│   │   └── config.ts          # ✅ New centralized config
│   └── config/
│       └── api.ts             # ⚠️  Deprecated (still works)
└── .env.local                 # ✅ Updated with new variables
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure you're importing from the correct path
2. **Environment Variables**: Ensure `.env.local` files are properly configured
3. **Build Issues**: Check that all required environment variables are set

### Debug Mode

The config files include debug logging in development mode. Check the browser console for configuration details.

## Future Improvements

- [ ] Add validation for environment variables
- [ ] Create configuration validation at startup
- [ ] Add support for feature flags
- [ ] Implement configuration hot-reloading in development
