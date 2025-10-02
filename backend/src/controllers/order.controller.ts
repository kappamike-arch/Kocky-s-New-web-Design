import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const confirmationCode = uuidv4().slice(0, 8).toUpperCase();
    const { items, ...orderData } = req.body;

    const order = await prisma.order.create({
      data: {
        ...orderData,
        userId: req.user?.id,
        confirmationCode,
        items: {
          create: items,
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    await sendEmail({
      to: orderData.customerEmail,
      subject: 'Order Confirmation - Kocky\'s Bar & Grill',
      template: 'order-confirmation',
      data: {
        name: orderData.customerName,
        confirmationCode,
        total: orderData.total,
        orderType: orderData.orderType,
        pickupTime: orderData.pickupTime,
      },
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, orderType, date } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (orderType) where.orderType = orderType;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = { gte: startDate, lt: endDate };
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { menuItem: true } } },
    });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { menuItem: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getOrderByConfirmationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { confirmationCode: req.params.confirmationCode },
      include: { items: { include: { menuItem: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { menuItem: true } } },
    });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const calculateOrderTotal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, orderType } = req.body;
    
    let subtotal = 0;
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (menuItem) {
        subtotal += Number(menuItem.price) * item.quantity;
      }
    }

    const tax = subtotal * 0.0875; // 8.75% tax rate
    const deliveryFee = orderType === 'DELIVERY' ? 5 : 0;
    const total = subtotal + tax + deliveryFee;

    res.json({
      success: true,
      calculation: {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refundOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentIntentId) {
      // Process Stripe refund
      await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'REFUNDED' },
    });

    res.json({ success: true, message: 'Order refunded', order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.order.update({
          where: { paymentIntentId: paymentIntent.id },
          data: { status: 'CONFIRMED' },
        });
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
