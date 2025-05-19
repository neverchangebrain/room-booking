import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotificationDto } from './dto/notification.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Бронювання')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Створити бронювання',
    description: 'Створює нове бронювання кімнати',
  })
  @ApiResponse({
    status: 201,
    description: 'Бронювання успішно створено',
  })
  @ApiResponse({
    status: 400,
    description: 'Невірні дані або кімната вже заброньована',
  })
  @ApiResponse({
    status: 404,
    description: 'Користувача або кімнату не знайдено',
  })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Видалити бронювання',
    description: 'Видаляє існуюче бронювання за ID',
  })
  @ApiParam({ name: 'id', description: 'ID бронювання' })
  @ApiResponse({
    status: 200,
    description: 'Бронювання успішно видалено',
  })
  @ApiResponse({
    status: 400,
    description: 'Неможливо скасувати бронювання, яке вже почалося',
  })
  @ApiResponse({
    status: 404,
    description: 'Бронювання не знайдено',
  })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  @Post(':id/notifications')
  @ApiOperation({
    summary: 'Надіслати сповіщення',
    description: 'Надсилає сповіщення про бронювання',
  })
  @ApiParam({ name: 'id', description: 'ID бронювання' })
  @ApiResponse({
    status: 200,
    description: 'Сповіщення успішно заплановано',
  })
  @ApiResponse({
    status: 404,
    description: 'Бронювання не знайдено',
  })
  sendNotification(
    @Param('id') id: string,
    @Body() notificationDto: NotificationDto,
  ) {
    return this.notificationsService.sendBookingNotification(
      id,
      notificationDto.inTime,
    );
  }
}
