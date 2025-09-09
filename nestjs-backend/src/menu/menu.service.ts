import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(data: any) {
    return this.prisma.menuItem.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
