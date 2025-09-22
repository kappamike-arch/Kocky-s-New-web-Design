import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

