import {
  IsDateString,
  IsString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID кімнати для бронювання',
    example: '6470f931a55dea9f2d77c1c3',
  })
  @IsString()
  roomId: string;

  @ApiProperty({
    description: 'ID користувача, який бронює кімнату',
    example: '6470f931a55dea9f2d77c1c4',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Час початку бронювання (ISO формат)',
    example: '2025-05-20T14:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Час закінчення бронювання (ISO формат)',
    example: '2025-05-20T15:00:00.000Z',
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Статус бронювання',
    example: 'confirmed',
    default: 'confirmed',
    required: false,
    enum: ['confirmed', 'cancelled', 'completed'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Назва/тема зустрічі',
    example: 'Щотижнева нарада команди',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Опис зустрічі',
    example:
      'Обговорення прогресу по проекту та планування на наступний тиждень',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Кількість учасників',
    example: 8,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  attendees?: number;
}
