import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Sanitize input to prevent XSS attacks
 */
export const sanitizeInput = (input: any, key?: string): any => {
  if (typeof input === 'string') {
    // Don't escape URLs, emails, or other specific fields that should remain unescaped
    const urlFields = ['url', 'website', 'onlineOrderingUrl', 'logoUrl', 'backgroundImage', 'backgroundVideo', 'imageUrl', 'videoUrl'];
    const emailFields = ['email', 'contactEmail'];
    const socialMediaFields = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube'];
    
    if (key && (urlFields.includes(key) || emailFields.includes(key) || socialMediaFields.includes(key))) {
      // For URLs and emails, just validate but don't escape
      if (urlFields.includes(key) && !validator.isURL(input) && input.trim() !== '') {
        return input; // Return as-is if not a valid URL but not empty
      }
      if (emailFields.includes(key) && !validator.isEmail(input) && input.trim() !== '') {
        return input; // Return as-is if not a valid email but not empty
      }
      return input; // Return unescaped for valid URLs/emails
    }
    
    // For other fields, escape HTML entities to prevent XSS
    return validator.escape(input);
  } else if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  } else if (input !== null && typeof input === 'object') {
    const sanitized: any = {};
    for (const objKey in input) {
      if (input.hasOwnProperty(objKey)) {
        sanitized[objKey] = sanitizeInput(input[objKey], objKey);
      }
    }
    return sanitized;
  }
  return input;
};

/**
 * Middleware to sanitize all request inputs
 */
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeInput(req.query) as any;
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeInput(req.params) as any;
  }
  
  next();
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string | null => {
  if (!email || !validator.isEmail(email)) {
    return null;
  }
  return validator.normalizeEmail(email) || null;
};

/**
 * Validate and sanitize phone number
 */
export const sanitizePhone = (phone: string): string => {
  // Remove all non-numeric characters except + and -
  return phone.replace(/[^\d+\-() ]/g, '');
};

/**
 * Validate and sanitize URL
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url || !validator.isURL(url)) {
    return null;
  }
  return url;
};

/**
 * Remove dangerous HTML tags but keep safe formatting
 */
export const sanitizeHtml = (html: string): string => {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe tags
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove on* event handlers
  html = html.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
  html = html.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
  html = html.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  html = html.replace(/javascript:/gi, '');
  
  return html;
};
