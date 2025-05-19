import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotificationDto } from './dto/notification.dto';

const mockBookingsService = {
  create: jest.fn(),
  remove: jest.fn(),
};

const mockNotificationsService = {
  sendBookingNotification: jest.fn(),
};

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: BookingsService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    bookingsService = module.get<BookingsService>(BookingsService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new booking', async () => {
      const createBookingDto: CreateBookingDto = {
        roomId: 'room1',
        userId: 'user1',
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      const expectedBooking = {
        id: 'booking1',
        roomId: 'room1',
        userId: 'user1',
        startTime: new Date('2025-05-20T09:00:00Z'),
        endTime: new Date('2025-05-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookingsService.create.mockResolvedValue(expectedBooking);

      const result = await controller.create(createBookingDto);

      expect(result).toEqual(expectedBooking);
      expect(mockBookingsService.create).toHaveBeenCalledWith(createBookingDto);
    });
  });

  describe('remove', () => {
    it('should delete a booking', async () => {
      const bookingId = 'booking1';
      const expectedBooking = {
        id: 'booking1',
        roomId: 'room1',
        userId: 'user1',
        startTime: new Date('2025-05-20T09:00:00Z'),
        endTime: new Date('2025-05-20T11:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookingsService.remove.mockResolvedValue(expectedBooking);

      const result = await controller.remove(bookingId);

      expect(result).toEqual(expectedBooking);
      expect(mockBookingsService.remove).toHaveBeenCalledWith(bookingId);
    });
  });

  describe('sendNotification', () => {
    it('should schedule a notification for booking', async () => {
      const bookingId = 'booking1';
      const notificationDto: NotificationDto = {
        inTime: 15,
      };

      const expectedResponse = {
        message: 'Сповіщення заплановано на 2025-05-20T08:45:00.000Z',
        user: 'ivan@example.com',
        room: 'Конференц-зал',
        startTime: new Date('2025-05-20T09:00:00Z'),
      };

      mockNotificationsService.sendBookingNotification.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.sendNotification(
        bookingId,
        notificationDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(
        mockNotificationsService.sendBookingNotification,
      ).toHaveBeenCalledWith(bookingId, notificationDto.inTime);
    });

    it('should schedule a notification without inTime parameter', async () => {
      const bookingId = 'booking1';
      const notificationDto: NotificationDto = {};

      const expectedResponse = {
        message: 'Сповіщення заплановано на 2025-05-20T09:00:00.000Z',
        user: 'ivan@example.com',
        room: 'Конференц-зал',
        startTime: new Date('2025-05-20T09:00:00Z'),
      };

      mockNotificationsService.sendBookingNotification.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.sendNotification(
        bookingId,
        notificationDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(
        mockNotificationsService.sendBookingNotification,
      ).toHaveBeenCalledWith(bookingId, undefined);
    });
  });
});
