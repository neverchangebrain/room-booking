import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    const { roomId, userId, startTime, endTime } = createBookingDto;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Кімнату з ID ${roomId} не знайдено`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${userId} не знайдено`);
    }

    const overlappingBookings = await this.prisma.booking.findFirst({
      where: {
        roomId,
        OR: [
          { startTime: { lte: startDate }, endTime: { gt: startDate } },
          { startTime: { lt: endDate }, endTime: { gte: endDate } },
          { startTime: { gte: startDate }, endTime: { lte: endDate } },
        ],
      },
    });

    if (overlappingBookings) {
      throw new BadRequestException(
        'Кімната вже заброньована на цей період часу',
      );
    }

    return this.prisma.booking.create({
      data: {
        startTime: startDate,
        endTime: endDate,
        roomId: roomId,
        userId: userId,
        status: 'confirmed',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
        startTime: { gte: new Date() },
      },
      include: {
        room: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Бронювання з ID ${id} не знайдено`);
    }

    return booking;
  }

  async remove(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException(`Бронювання з ID ${id} не знайдено`);
    }

    if (booking.startTime <= new Date()) {
      throw new BadRequestException(
        'Неможливо скасувати бронювання, яке вже почалося',
      );
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
