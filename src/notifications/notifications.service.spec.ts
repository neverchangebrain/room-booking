import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';
import nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
    }),
  }),
}));

const mockPrismaService = {
  booking: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);

    const logger = new Logger(NotificationsService.name);
    (service as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendBookingNotification', () => {
    it('should schedule a notification with inTime parameter', async () => {
      const bookingId = 'booking1';
      const inTime = 15;

      const mockBooking = {
        id: 'booking1',
        startTime: new Date('2025-05-20T09:00:00Z'),
        endTime: new Date('2025-05-20T11:00:00Z'),
        room: {
          id: 'room1',
          name: 'Конференц-зал',
        },
        user: {
          id: 'user1',
          email: 'ivan@example.com',
          name: 'Иван Петров',
        },
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.sendBookingNotification(bookingId, inTime);

      expect(result).toEqual({
        message: expect.stringContaining('Сповіщення заплановано на'),
        user: 'ivan@example.com',
        room: 'Конференц-зал',
        startTime: mockBooking.startTime,
      });

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          room: true,
          user: true,
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Планування сповіщення для користувача ivan@example.com',
        ),
      );
    });

    it('should schedule a notification without inTime parameter', async () => {
      const bookingId = 'booking1';

      const mockBooking = {
        id: 'booking1',
        startTime: new Date('2025-05-20T09:00:00Z'),
        endTime: new Date('2025-05-20T11:00:00Z'),
        room: {
          id: 'room1',
          name: 'Конференц-зал',
        },
        user: {
          id: 'user1',
          email: 'ivan@example.com',
          name: 'Иван Петров',
        },
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.sendBookingNotification(bookingId);

      expect(result).toEqual({
        message: expect.stringContaining('Сповіщення заплановано на'),
        user: 'ivan@example.com',
        room: 'Конференц-зал',
        startTime: mockBooking.startTime,
      });

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          room: true,
          user: true,
        },
      });
    });

    it('should throw NotFoundException if booking not found', async () => {
      const bookingId = 'nonexistentBooking';
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.sendBookingNotification(bookingId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          room: true,
          user: true,
        },
      });
    });
  });

  describe('sendReminderNotifications', () => {
    it('should send reminder notifications for upcoming bookings', async () => {
      const mockBookings = [
        {
          id: 'booking1',
          startTime: new Date('2025-05-20T09:00:00Z'),
          room: {
            name: 'Конференц-зал',
          },
          user: {
            email: 'ivan@example.com',
            name: 'Иван Петров',
          },
        },
        {
          id: 'booking2',
          startTime: new Date('2025-05-20T10:00:00Z'),
          room: {
            name: 'Переговорная',
          },
          user: {
            email: 'maria@example.com',
            name: 'Мария Иванова',
          },
        },
      ];

      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const originalNow = Date.now;
      const mockNow = new Date('2025-05-20T08:45:00Z').getTime();
      global.Date.now = jest.fn(() => mockNow);

      await service.sendReminderNotifications();
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          startTime: {
            gt: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          user: true,
          room: true,
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Перевірка бронювань для відправки нагадувань',
      );

      expect(mockLogger.log).toHaveBeenCalled();

      global.Date.now = originalNow;
    });

    it('should handle no upcoming bookings', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([]);

      await service.sendReminderNotifications();

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: {
          startTime: {
            gt: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          user: true,
          room: true,
        },
      });

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Перевірка бронювань для відправки нагадувань',
      );
    });
  });
});
