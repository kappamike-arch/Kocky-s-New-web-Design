import mjml from 'mjml';
import { UPLOADS_URL } from '@/lib/config';

export interface MJMLOptions {
  minify?: boolean;
  beautify?: boolean;
  keepComments?: boolean;
  validationLevel?: 'strict' | 'soft' | 'skip';
}

export interface CompiledTemplate {
  html: string;
  errors: string[];
  warnings: string[];
}

/**
 * Compile MJML to HTML
 */
export function compileMJML(mjmlContent: string, options: MJMLOptions = {}): CompiledTemplate {
  try {
    const result = mjml(mjmlContent, {
      minify: options.minify ?? true,
      beautify: options.beautify ?? false,
      keepComments: options.keepComments ?? false,
      validationLevel: options.validationLevel ?? 'soft'
    });

    return {
      html: result.html,
      errors: result.errors.map((error: any) => error.message),
      warnings: result.warnings.map((warning: any) => warning.message)
    };
  } catch (error: any) {
    return {
      html: '',
      errors: [error.message || 'Unknown error'],
      warnings: []
    };
  }
}

/**
 * Validate MJML syntax
 */
export function validateMJML(mjmlContent: string): { isValid: boolean; errors: string[] } {
  try {
    const result = mjml(mjmlContent, {
      validationLevel: 'strict'
    });

    return {
      isValid: result.errors.length === 0,
      errors: result.errors.map((error: any) => error.message)
    };
  } catch (error: any) {
    return {
      isValid: false,
      errors: [error.message || 'Unknown error']
    };
  }
}

/**
 * Replace template variables in MJML content
 */
export function replaceTemplateVariables(mjmlContent: string, variables: Record<string, string>): string {
  let content = mjmlContent;
  
  // Replace {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    content = content.replace(regex, value || '');
  });

  // Replace fallback patterns like {{firstName|"there"}}
  const fallbackRegex = /{{\s*(\w+)\s*\|\s*"([^"]+)"\s*}}/g;
  content = content.replace(fallbackRegex, (match, key, fallback) => {
    return variables[key] || fallback;
  });

  return content;
}

/**
 * Generate a simple tracking pixel MJML component
 */
export function generateTrackingPixel(contactId: string, campaignId?: string, baseUrl?: string): string {
  const url = baseUrl || process.env.BACKEND_PUBLIC_URL || '${UPLOADS_URL}';
  const campaignParam = campaignId ? `&cmp=${campaignId}` : '';
  
  return `
    <mj-image 
      src="${url}/api/email/track/open?cid=${contactId}${campaignParam}" 
      width="1" 
      height="1" 
      style="display:none;"
      alt=""
    />
  `;
}

/**
 * Generate a tracking link MJML component
 */
export function generateTrackingLink(
  url: string, 
  text: string, 
  contactId: string, 
  campaignId?: string, 
  baseUrl?: string
): string {
  const trackingBaseUrl = baseUrl || process.env.BACKEND_PUBLIC_URL || '${UPLOADS_URL}';
  const campaignParam = campaignId ? `&cmp=${campaignId}` : '';
  const encodedUrl = Buffer.from(url).toString('base64url');
  const trackingUrl = `${trackingBaseUrl}/api/email/track/click?cid=${contactId}${campaignParam}&u=${encodedUrl}`;
  
  return `
    <mj-button 
      href="${trackingUrl}" 
      background-color="#000000" 
      color="#ffffff"
      font-size="16px"
      font-weight="bold"
      padding="15px 30px"
      border-radius="5px"
    >
      ${text}
    </mj-button>
  `;
}

/**
 * Common MJML template wrapper
 */
export function wrapInMJMLTemplate(content: string, title?: string): string {
  return `
    <mjml>
      <mj-head>
        <mj-title>${title || 'Email'}</mj-title>
        <mj-preview>Email preview text</mj-preview>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif"></mj-all>
          <mj-text font-size="16px" color="#333333" line-height="1.6"></mj-text>
          <mj-section background-color="#ffffff"></mj-section>
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        ${content}
      </mj-body>
    </mjml>
  `;
}

/**
 * Generate unsubscribe footer
 */
export function generateUnsubscribeFooter(contactId: string, baseUrl?: string): string {
  const url = baseUrl || process.env.SITE_PUBLIC_URL || 'http://72.167.227.205:3003';
  
  return `
    <mj-section padding="20px 0">
      <mj-column>
        <mj-text font-size="12px" color="#666666" align="center">
          You're receiving this email because you opted in at kockys.com<br/>
          <a href="${url}/api/email/unsubscribe?email={{email}}&token={{token}}" style="color: #666666;">Unsubscribe</a> | 
          <a href="${url}/api/email/preferences?email={{email}}&token={{token}}" style="color: #666666;">Update Preferences</a>
        </mj-text>
        <mj-text font-size="12px" color="#666666" align="center">
          Kocky's Bar & Grill<br/>
          ${process.env.MAILING_ADDRESS || '123 Main St, City, State 12345'}
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}
