import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalReservations,
      todayReservations,
      totalOrders,
      todayOrders,
      totalUsers,
      totalRevenue,
      todayRevenue,
      newsletterSubscribers,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ['COMPLETED', 'READY'] } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ['COMPLETED', 'READY'] },
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.newsletterSubscriber.count({ where: { subscribed: true } }),
    ]);

    res.json({
      success: true,
      stats: {
        reservations: {
          total: totalReservations,
          today: todayReservations,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
        },
        users: {
          total: totalUsers,
        },
        revenue: {
          total: totalRevenue._sum.total || 0,
          today: todayRevenue._sum.total || 0,
        },
        newsletter: {
          subscribers: newsletterSubscribers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [ordersByDay, reservationsByDay, revenueByDay] = await Promise.all([
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: true,
      }),
      prisma.reservation.groupBy({
        by: ['date'],
        where: {
          date: { gte: start, lte: end },
        },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ['COMPLETED', 'READY'] },
        },
        _sum: { total: true },
      }),
    ]);

    res.json({
      success: true,
      analytics: {
        orders: ordersByDay,
        reservations: reservationsByDay,
        revenue: revenueByDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, search } = req.query;
    const where: any = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            reservations: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName || ''} ${lastName || ''}`.trim() || null,
        role: role || 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        reservations: { take: 5, orderBy: { createdAt: 'desc' } },
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {
      status: { in: ['COMPLETED', 'READY'] },
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const revenue = await prisma.order.aggregate({
      where,
      _sum: {
        subtotal: true,
        tax: true,
        tip: true,
        total: true,
      },
      _avg: {
        total: true,
      },
      _count: true,
    });

    res.json({ success: true, revenue });
  } catch (error) {
    next(error);
  }
};

export const getReservationsReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const report = await prisma.reservation.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

export const getOrdersReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const report = await prisma.order.groupBy({
      by: ['status', 'orderType'],
      where,
      _count: true,
      _sum: { total: true },
    });

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, format, startDate, endDate } = req.query;
    
    // Implement CSV/PDF export logic based on type and format
    res.json({
      success: true,
      message: 'Report export feature to be implemented',
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'all.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({ success: true, logs: [] });
    }

    const logs = fs.readFileSync(logPath, 'utf-8').split('\n').slice(-100);
    
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const createBackup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Implement database backup logic
    res.json({
      success: true,
      message: 'Backup feature to be implemented',
    });
  } catch (error) {
    next(error);
  }
};

export const restoreBackup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Implement database restore logic
    res.json({
      success: true,
      message: 'Restore feature to be implemented',
    });
  } catch (error) {
    next(error);
  }
};
