import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({
    description:
      'Час до початку бронювання (у хвилинах), коли потрібно надіслати сповіщення',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inTime?: number;
}
