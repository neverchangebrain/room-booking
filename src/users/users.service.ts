import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `Користувач з email ${createUserDto.email} вже існує`,
      );
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `Користувач з email ${updateUserDto.email} вже існує`,
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }

    return this.prisma.user.delete({ where: { id } });
  }

  async getUserRooms(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { bookings: { include: { room: true } } },
    });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${userId} не знайдено`);
    }

    const rooms = user.bookings.map((booking) => booking.room);
    return [...new Map(rooms.map((room) => [room.id, room])).values()];
  }
}
