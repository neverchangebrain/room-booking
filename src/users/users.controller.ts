import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Користувачі')
@Controller('users')
export class UsersController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Створити користувача',
    description: 'Створює нового користувача в системі',
  })
  @ApiResponse({ status: 201, description: 'Користувача успішно створено' })
  @ApiResponse({ status: 400, description: 'Невірні дані' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Отримати всіх користувачів',
    description: 'Повертає список всіх користувачів',
  })
  @ApiResponse({
    status: 200,
    description: 'Успішно отримано список користувачів',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Отримати користувача за ID',
    description: 'Повертає дані користувача за його ID',
  })
  @ApiParam({ name: 'id', description: 'ID користувача' })
  @ApiResponse({ status: 200, description: 'Користувача успішно знайдено' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Оновити користувача',
    description: 'Оновлює дані користувача за ID',
  })
  @ApiParam({ name: 'id', description: 'ID користувача' })
  @ApiResponse({ status: 200, description: 'Користувача успішно оновлено' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Видалити користувача',
    description: 'Видаляє користувача за ID',
  })
  @ApiParam({ name: 'id', description: 'ID користувача' })
  @ApiResponse({ status: 200, description: 'Користувача успішно видалено' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/bookings')
  @ApiOperation({
    summary: 'Отримати бронювання користувача',
    description: 'Повертає всі бронювання користувача',
  })
  @ApiParam({ name: 'id', description: 'ID користувача' })
  @ApiResponse({ status: 200, description: 'Бронювання успішно отримано' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  getUserBookings(@Param('id') id: string) {
    return this.bookingsService.findByUser(id);
  }

  @Get(':id/rooms')
  @ApiOperation({
    summary: 'Отримати кімнати користувача',
    description: 'Повертає всі кімнати, які бронював користувач',
  })
  @ApiParam({ name: 'id', description: 'ID користувача' })
  @ApiResponse({ status: 200, description: 'Кімнати успішно отримано' })
  @ApiResponse({ status: 404, description: 'Користувача не знайдено' })
  getUserRooms(@Param('id') id: string) {
    return this.usersService.getUserRooms(id);
  }
}
