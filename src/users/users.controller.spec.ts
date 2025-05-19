import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BookingsService } from '../bookings/bookings.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getUserRooms: jest.fn(),
};

const mockBookingsService = {
  findByUser: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let bookingsService: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: BookingsService, useValue: mockBookingsService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    bookingsService = module.get<BookingsService>(BookingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Иван Петров',
        email: 'ivan@example.com',
        password: 'password123',
      };

      const expectedUser = {
        id: 'user1',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          id: 'user1',
          name: 'Иван Петров',
          email: 'ivan@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user2',
          name: 'Мария Иванова',
          email: 'maria@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 'user1';
      const expectedUser = {
        id: 'user1',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 'user1';
      const updateUserDto: UpdateUserDto = {
        name: 'Иван Иванов',
      };

      const expectedUser = {
        id: 'user1',
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = 'user1';
      const expectedUser = {
        id: 'user1',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.remove.mockResolvedValue(expectedUser);

      const result = await controller.remove(userId);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserBookings', () => {
    it('should return bookings for a specific user', async () => {
      const userId = 'user1';
      const expectedBookings = [
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
        },
      ];

      mockBookingsService.findByUser.mockResolvedValue(expectedBookings);

      const result = await controller.getUserBookings(userId);

      expect(result).toEqual(expectedBookings);
      expect(mockBookingsService.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserRooms', () => {
    it('should return rooms booked by a specific user', async () => {
      const userId = 'user1';
      const expectedRooms = [
        {
          id: 'room1',
          name: 'Конференц-зал',
          capacity: 20,
        },
        {
          id: 'room2',
          name: 'Переговорная',
          capacity: 10,
        },
      ];

      mockUsersService.getUserRooms.mockResolvedValue(expectedRooms);

      const result = await controller.getUserRooms(userId);

      expect(result).toEqual(expectedRooms);
      expect(mockUsersService.getUserRooms).toHaveBeenCalledWith(userId);
    });
  });
});
