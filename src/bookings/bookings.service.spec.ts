import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

const mockPrismaService = {
  room: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  booking: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const createBookingDto: CreateBookingDto = {
        roomId: 'room1',
        userId: 'user1',
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      const mockRoom = {
        id: 'room1',
        name: 'Конференц-зал',
        capacity: 20,
      };

      const mockUser = {
        id: 'user1',
        name: 'Іван Петров',
        email: 'ivan@example.com',
      };

      const createdBooking = {
        id: 'booking1',
        roomId: 'room1',
        userId: 'user1',
        startTime: new Date('2025-05-20T09:00:00Z'),
        endTime: new Date('2025-05-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      mockPrismaService.booking.create.mockResolvedValue(createdBooking);

      const result = await service.create(createBookingDto);

      expect(result).toEqual(createdBooking);
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'room1' },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
      });
      expect(mockPrismaService.booking.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: {
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          room: { connect: { id: 'room1' } },
          user: { connect: { id: 'user1' } },
        },
      });
    });

    it('should throw NotFoundException if room not found', async () => {
      const createBookingDto: CreateBookingDto = {
        roomId: 'nonexistentRoom',
        userId: 'user1',
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistentRoom' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const createBookingDto: CreateBookingDto = {
        roomId: 'room1',
        userId: 'nonexistentUser',
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      const mockRoom = {
        id: 'room1',
        name: 'Конференц-зал',
        capacity: 20,
      };

      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'room1' },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistentUser' },
      });
    });

    it('should throw BadRequestException if there is an overlapping booking', async () => {
      const createBookingDto: CreateBookingDto = {
        roomId: 'room1',
        userId: 'user1',
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      const mockRoom = {
        id: 'room1',
        name: 'Конференц-зал',
        capacity: 20,
      };

      const mockUser = {
        id: 'user1',
        name: 'Іван Петров',
        email: 'ivan@example.com',
      };

      const overlappingBooking = {
        id: 'existingBooking',
        roomId: 'room1',
        userId: 'user2',
        startTime: new Date('2025-05-20T10:00:00Z'),
        endTime: new Date('2025-05-20T12:00:00Z'),
      };

      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.booking.findFirst.mockResolvedValue(overlappingBooking);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.room.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.booking.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.booking.create).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return bookings for a specific user', async () => {
      const userId = 'user1';
      const mockBookings = [
        {
          id: 'booking1',
          roomId: 'room1',
          userId: 'user1',
          startTime: new Date('2025-05-20T09:00:00Z'),
          endTime: new Date('2025-05-20T11:00:00Z'),
          room: {
            id: 'room1',
            name: 'Конференц-зал',
            capacity: 20,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockBookings);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          startTime: { gte: expect.any(Date) },
        },
        include: {
          room: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      const bookingId = 'booking1';
      const mockBooking = {
        id: 'booking1',
        roomId: 'room1',
        userId: 'user1',
        startTime: new Date('2025-05-20T09:00:00Z'),
        endTime: new Date('2025-05-20T11:00:00Z'),
        room: {
          id: 'room1',
          name: 'Конференц-зал',
          capacity: 20,
        },
        user: {
          id: 'user1',
          name: 'Іван Петров',
          email: 'ivan@example.com',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.findOne(bookingId);

      expect(result).toEqual(mockBooking);
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          user: true,
          room: true,
        },
      });
    });

    it('should throw NotFoundException if booking not found', async () => {
      const bookingId = 'nonexistentBooking';
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne(bookingId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          user: true,
          room: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a booking', async () => {
      const bookingId = 'booking1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const mockBooking = {
        id: 'booking1',
        roomId: 'room1',
        userId: 'user1',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const deletedBooking = { ...mockBooking };

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.delete.mockResolvedValue(deletedBooking);

      const result = await service.remove(bookingId);

      expect(result).toEqual(deletedBooking);
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
      expect(mockPrismaService.booking.delete).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
    });

    it('should throw NotFoundException if booking not found', async () => {
      const bookingId = 'nonexistentBooking';
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.remove(bookingId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
      expect(mockPrismaService.booking.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking has already started', async () => {
      const bookingId = 'booking1';
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const mockBooking = {
        id: 'booking1',
        roomId: 'room1',
        userId: 'user1',
        startTime: pastDate,
        endTime: new Date(pastDate.getTime() + 2 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(service.remove(bookingId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
      expect(mockPrismaService.booking.delete).not.toHaveBeenCalled();
    });
  });
});
