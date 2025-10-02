import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../utils/email';
import axios from 'axios';

const addToMailchimp = async (email: string, name?: string) => {
  if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
    return null;
  }

  try {
    const response = await axios.post(
      `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name?.split(' ')[0] || '',
          LNAME: name?.split(' ').slice(1).join(' ') || '',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.id;
  } catch (error) {
    console.error('Mailchimp error:', error);
    return null;
  }
};

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body;

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing && existing.subscribed) {
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed',
      });
    }

    // Add to Mailchimp
    const mailchimpId = await addToMailchimp(email, name);

    // Create or update subscriber
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        subscribed: true,
        subscribedAt: new Date(),
        unsubscribedAt: null,
        name: name || null,
        mailchimpId: mailchimpId || null,
      },
      create: {
        email,
        name: name || null,
        mailchimpId: mailchimpId || null,
        subscribed: true,
        tags: [],
      },
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to our Newsletter!',
      template: 'welcome',
      data: { name: name || email },
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    // Update in Mailchimp
    if (subscriber.mailchimpId && process.env.MAILCHIMP_API_KEY) {
      try {
        await axios.patch(
          `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/${subscriber.mailchimpId}`,
          { status: 'unsubscribed' },
          {
            headers: {
              Authorization: `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            },
          }
        );
      } catch (error) {
        console.error('Mailchimp unsubscribe error:', error);
      }
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    next(error);
  }
};

export const verifySubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    // Implement email verification logic
    res.json({
      success: true,
      message: 'Email verified',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    res.json({ success: true, subscribers });
  } catch (error) {
    next(error);
  }
};

export const sendCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, content, testMode } = req.body;

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { subscribed: true },
      select: { email: true, name: true },
    });

    if (testMode) {
      // Send only to admin email for testing
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: `[TEST] ${subject}`,
        template: 'welcome', // Use a generic template
        data: { content },
      });
    } else {
      // Send to all subscribers
      const emails = subscribers.map(s => s.email);
      // Batch send emails (implement batching logic for large lists)
      for (const subscriber of subscribers) {
        await sendEmail({
          to: subscriber.email,
          subject,
          template: 'welcome', // Use campaign template
          data: { name: subscriber.name, content },
        });
      }
    }

    res.json({
      success: true,
      message: `Campaign sent to ${testMode ? '1 test recipient' : subscribers.length + ' subscribers'}`,
    });
  } catch (error) {
    next(error);
  }
};

export const syncWithMailchimp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
      return res.status(400).json({
        success: false,
        message: 'Mailchimp not configured',
      });
    }

    // Get all local subscribers
    const localSubscribers = await prisma.newsletterSubscriber.findMany();

    // Sync with Mailchimp
    let synced = 0;
    for (const subscriber of localSubscribers) {
      if (!subscriber.mailchimpId && subscriber.subscribed) {
        const mailchimpId = await addToMailchimp(subscriber.email, subscriber.name || undefined);
        if (mailchimpId) {
          await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: { mailchimpId },
          });
          synced++;
        }
      }
    }

    res.json({
      success: true,
      message: `Synced ${synced} subscribers with Mailchimp`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.newsletterSubscriber.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Subscriber deleted',
    });
  } catch (error) {
    next(error);
  }
};
