import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({ data: createRoomDto });
  }

  async findAll() {
    return this.prisma.room.findMany();
  }

  async findAvailable(startTime: Date, endTime: Date) {
    const bookedRoomIds = await this.prisma.booking.findMany({
      where: {
        OR: [
          { startTime: { gte: startTime, lt: endTime } },
          { endTime: { gt: startTime, lte: endTime } },
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
      distinct: ['roomId'],
      select: { roomId: true },
    });

    return this.prisma.room.findMany({
      where: { id: { notIn: bookedRoomIds.map((booking) => booking.roomId) } },
    });
  }
}
