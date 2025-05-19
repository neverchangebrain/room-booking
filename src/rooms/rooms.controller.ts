import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AvailableRoomsDto } from './dto/available-rooms.dto';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Кімнати')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({ summary: 'Отримати список всіх кімнат' })
  @ApiResponse({
    status: 200,
    description: 'Список кімнат успішно отримано',
  })
  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @ApiOperation({ summary: 'Отримати інформацію про конкретну кімнату' })
  @ApiResponse({
    status: 200,
    description: 'Інформацію про кімнату успішно отримано',
  })
  @ApiResponse({
    status: 404,
    description: 'Кімнату не знайдено',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: `Інформація про кімнату з ID: ${id}` };
  }

  @ApiOperation({ summary: 'Забронювати кімнату' })
  @ApiResponse({
    status: 201,
    description: 'Бронювання успішно створено',
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні дані запиту',
  })
  @ApiBearerAuth()
  @Post(':id/book')
  bookRoom(@Param('id') id: string, @Body() bookingData: CreateBookingDto) {
    return {
      message: `Кімнату з ID: ${id} успішно заброньовано`,
      data: bookingData,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Створити нову кімнату',
    description: 'Створює нову кімнату в системі',
  })
  @ApiResponse({
    status: 201,
    description: 'Кімнату успішно створено',
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні дані запиту',
  })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get('available')
  @ApiOperation({
    summary: 'Знайти доступні кімнати',
    description: 'Повертає список кімнат, доступних у вказаний проміжок часу',
  })
  @ApiResponse({
    status: 200,
    description: 'Список доступних кімнат успішно отримано',
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні дані запиту',
  })
  findAvailable(@Query() query: AvailableRoomsDto) {
    const startTime = new Date(query.startTime);
    const endTime = new Date(query.endTime);
    return this.roomsService.findAvailable(startTime, endTime);
  }
}
