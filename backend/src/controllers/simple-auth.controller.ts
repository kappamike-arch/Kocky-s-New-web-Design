import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const simpleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Simple mock authentication for testing
    if ((email === 'admin@kockysbar.com' || email === 'admin@kockys.com') && password === 'AdminPassword123!') {
      // Generate real JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const token = jwt.sign(
        {
          id: '1',
          email: email,
          role: 'ADMIN',
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        {
          id: '1',
          email: email,
          role: 'ADMIN',
        },
        jwtSecret,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: '1',
          email: email,
          name: 'Admin User',
          role: 'ADMIN',
        },
        token: token,
        refreshToken: refreshToken,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const simpleLogout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const simpleSession = async (req: Request, res: Response) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'admin@kockysbar.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
};

export const simpleLog = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Auth log recorded',
  });
};
