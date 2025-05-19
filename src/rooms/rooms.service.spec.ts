import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

const mockPrismaService = {
  room: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  booking: {
    findMany: jest.fn(),
  },
};

describe('RoomsService', () => {
  let service: RoomsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto: CreateRoomDto = {
        name: 'Конференц-зал',
        capacity: 20,
      };
      const expectedRoom = {
        id: 'someId',
        name: 'Конференц-зал',
        capacity: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.room.create.mockResolvedValue(expectedRoom);

      const result = await service.create(createRoomDto);

      expect(result).toEqual(expectedRoom);
      expect(mockPrismaService.room.create).toHaveBeenCalledWith({
        data: createRoomDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of rooms', async () => {
      const expectedRooms = [
        {
          id: 'room1',
          name: 'Конференц-зал',
          capacity: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'room2',
          name: 'Переговорна',
          capacity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.room.findMany.mockResolvedValue(expectedRooms);

      const result = await service.findAll();
      expect(result).toEqual(expectedRooms);
      expect(mockPrismaService.room.findMany).toHaveBeenCalled();
    });
  });

  describe('findAvailable', () => {
    it('should return available rooms for the specified time period', async () => {
      const startTime = new Date('2025-05-20T09:00:00Z');
      const endTime = new Date('2025-05-20T11:00:00Z');

      const bookedRoomIds = [{ roomId: 'room1' }];

      const availableRooms = [
        {
          id: 'room2',
          name: 'Переговорна',
          capacity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.booking.findMany.mockResolvedValue(bookedRoomIds);
      mockPrismaService.room.findMany.mockResolvedValue(availableRooms);

      const result = await service.findAvailable(startTime, endTime);

      expect(result).toEqual(availableRooms);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
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

      expect(mockPrismaService.room.findMany).toHaveBeenCalledWith({
        where: { id: { notIn: ['room1'] } },
      });
    });
  });
});
