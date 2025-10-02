/**
 * Utility to help replace console.log statements with proper logging
 */

import { logger } from './logger';

// Export logger methods for easy replacement
export const logInfo = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(message, data);
  }
};

export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

export const logWarn = (message: string, data?: any) => {
  logger.warn(message, data);
};

export const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(message, data);
  }
};

// Development-only logging
export const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[DEV] ${message}`, data);
  }
};
