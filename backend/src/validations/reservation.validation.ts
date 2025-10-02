import { z } from 'zod';

export const createReservationSchema = z.object({
  body: z.object({
    guestName: z.string().min(2, 'Name must be at least 2 characters'),
    guestEmail: z.string().email('Invalid email address'),
    guestPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
    date: z.string().datetime(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    partySize: z.number().int().min(1).max(20),
    specialRequests: z.string().optional(),
  }),
});

export const updateReservationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    guestName: z.string().min(2).optional(),
    guestEmail: z.string().email().optional(),
    guestPhone: z.string().min(10).optional(),
    date: z.string().datetime().optional(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    partySize: z.number().int().min(1).max(20).optional(),
    specialRequests: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  }),
});

export const getReservationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const queryReservationsSchema = z.object({
  query: z.object({
    date: z.string().datetime().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>['body'];
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>['body'];
export type QueryReservationsInput = z.infer<typeof queryReservationsSchema>['query'];
