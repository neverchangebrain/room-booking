import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AvailableRoomsDto } from './dto/available-rooms.dto';

const mockRoomsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAvailable: jest.fn(),
};

describe('RoomsController', () => {
  let controller: RoomsController;
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [{ provide: RoomsService, useValue: mockRoomsService }],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockRoomsService.findAll.mockResolvedValue(expectedRooms);

      const result = await controller.findAll();

      expect(result).toEqual(expectedRooms);
      expect(mockRoomsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return information about a specific room', () => {
      const result = controller.findOne('room1');

      expect(result).toEqual({
        message: 'Інформація про кімнату з ID: room1',
      });
    });
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto: CreateRoomDto = {
        name: 'Конференц-зал',
        capacity: 20,
      };

      const expectedRoom = {
        id: 'room1',
        name: 'Конференц-зал',
        capacity: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRoomsService.create.mockResolvedValue(expectedRoom);

      const result = await controller.create(createRoomDto);

      expect(result).toEqual(expectedRoom);
      expect(mockRoomsService.create).toHaveBeenCalledWith(createRoomDto);
    });
  });

  describe('bookRoom', () => {
    it('should return confirmation of booking', () => {
      const roomId = 'room1';
      const bookingData = {
        roomId: 'room1',
        userId: 'user1',
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      const result = controller.bookRoom(roomId, bookingData);

      expect(result).toEqual({
        message: 'Кімнату з ID: room1 успішно заброньовано',
        data: bookingData,
      });
    });
  });

  describe('findAvailable', () => {
    it('should return available rooms', async () => {
      const query: AvailableRoomsDto = {
        startTime: '2025-05-20T09:00:00Z',
        endTime: '2025-05-20T11:00:00Z',
      };

      const expectedRooms = [
        {
          id: 'room2',
          name: 'Переговорна',
          capacity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRoomsService.findAvailable.mockResolvedValue(expectedRooms);

      const result = await controller.findAvailable(query);

      expect(result).toEqual(expectedRooms);
      expect(mockRoomsService.findAvailable).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
      );
    });
  });
});
