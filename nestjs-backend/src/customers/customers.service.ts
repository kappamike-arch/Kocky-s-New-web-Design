import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(query?: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query?.sortBy || 'createdAt';
    const order = query?.order || 'desc';

    const where: Prisma.CustomerWhereInput = query?.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' } },
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { company: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          _count: {
            select: {
              orders: true,
              reservations: true,
              inquiries: true,
              quotes: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        reservations: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        inquiries: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
            reservations: true,
            inquiries: true,
            quotes: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
      include: {
        _count: {
          select: {
            orders: true,
            reservations: true,
            inquiries: true,
            quotes: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    // Soft delete by removing user association
    return this.prisma.customer.update({
      where: { id },
      data: { userId: null },
    });
  }

  async getCustomerStats(id: string) {
    const customer = await this.findOne(id);

    const [orderStats, reservationStats] = await Promise.all([
      this.prisma.order.aggregate({
        where: { customerId: id },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
      }),
      this.prisma.reservation.count({
        where: { customerId: id },
      }),
    ]);

    return {
      customer,
      stats: {
        totalOrders: orderStats._count,
        totalSpent: orderStats._sum.total || 0,
        averageOrderValue: orderStats._avg.total || 0,
        totalReservations: reservationStats,
      },
    };
  }
}
