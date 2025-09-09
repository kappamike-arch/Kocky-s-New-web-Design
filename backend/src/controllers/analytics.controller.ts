import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Track page view
export const trackPageView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, page, referrer, userId } = req.body;
    
    // Log the page view (in production, you'd save this to database)
    logger.info('Page view tracked', {
      sessionId,
      page,
      referrer,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    logger.error('Failed to track page view:', error);
    next(error);
  }
};

// Track custom event
export const trackEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, eventType, eventName, page, referrer, eventData } = req.body;
    
    logger.info('Event tracked', {
      sessionId,
      eventType,
      eventName,
      page,
      referrer,
      eventData,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    logger.error('Failed to track event:', error);
    next(error);
  }
};

// Track click
export const trackClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, element, url, x, y } = req.body;
    
    logger.info('Click tracked', {
      sessionId,
      element,
      url,
      coordinates: { x, y },
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    logger.error('Failed to track click:', error);
    next(error);
  }
};

// Track conversion
export const trackConversion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, conversionType, value, metadata } = req.body;
    
    logger.info('Conversion tracked', {
      sessionId,
      conversionType,
      value,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Conversion tracked successfully'
    });
  } catch (error) {
    logger.error('Failed to track conversion:', error);
    next(error);
  }
};

// Get analytics dashboard data
export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Mock analytics data - in production, you'd query from database
    const mockData = {
      pageViews: {
        total: 1250,
        today: 45,
        growth: 12.5
      },
      uniqueVisitors: {
        total: 890,
        today: 32,
        growth: 8.2
      },
      events: {
        total: 2340,
        today: 78,
        growth: 15.3
      },
      conversions: {
        total: 156,
        today: 5,
        growth: 22.1
      },
      topPages: [
        { page: '/', views: 456, percentage: 36.5 },
        { page: '/menu', views: 234, percentage: 18.7 },
        { page: '/reservations', views: 189, percentage: 15.1 },
        { page: '/happy-hour', views: 145, percentage: 11.6 },
        { page: '/contact', views: 98, percentage: 7.8 }
      ],
      deviceTypes: [
        { type: 'Mobile', count: 625, percentage: 50 },
        { type: 'Desktop', count: 500, percentage: 40 },
        { type: 'Tablet', count: 125, percentage: 10 }
      ],
      timeRange: {
        startDate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    logger.error('Failed to get analytics dashboard:', error);
    next(error);
  }
};
