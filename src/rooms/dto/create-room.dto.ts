import { IsString, IsInt, Min, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Назва кімнати',
    example: 'Конференц-зал A',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Місткість кімнати (кількість осіб)',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({
    description: 'Опис кімнати',
    example: 'Простора кімната з проектором та фліпчартом',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Поверх, на якому знаходиться кімната',
    example: '3',
    required: false,
  })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({
    description: 'Будівля, в якій знаходиться кімната',
    example: 'Головний корпус',
    required: false,
  })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({
    description: 'Обладнання в кімнаті',
    example: ['Проектор', 'Фліпчарт', 'Вайфай'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];
}
