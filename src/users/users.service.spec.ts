import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
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

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
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

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonexistentUser';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
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

      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException if user to update not found', async () => {
      const userId = 'nonexistentUser';
      const updateUserDto: UpdateUserDto = {
        name: 'Иван Иванов',
      };

      mockPrismaService.user.update.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
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

      mockPrismaService.user.delete.mockResolvedValue(expectedUser);

      const result = await service.remove(userId);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user to delete not found', async () => {
      const userId = 'nonexistentUser';
      mockPrismaService.user.delete.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('getUserRooms', () => {
    it('should return rooms for a specific user', async () => {
      const userId = 'user1';
      const mockUser = {
        id: 'user1',
        name: 'Иван Петров',
        email: 'ivan@example.com',
        bookings: [
          {
            id: 'booking1',
            room: {
              id: 'room1',
              name: 'Конференц-зал',
              capacity: 20,
            },
          },
          {
            id: 'booking2',
            room: {
              id: 'room2',
              name: 'Переговорная',
              capacity: 10,
            },
          },
          {
            id: 'booking3',
            room: {
              id: 'room1',
              name: 'Конференц-зал',
              capacity: 20,
            },
          },
        ],
      };

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

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserRooms(userId);

      expect(result).toEqual(expectedRooms);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { bookings: { include: { room: true } } },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'nonexistentUser';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserRooms(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { bookings: { include: { room: true } } },
      });
    });
  });
});
