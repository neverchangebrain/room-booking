import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailableRoomsDto {
  @ApiProperty({
    description: 'Час початку пошуку доступних кімнат (ISO формат)',
    example: '2025-05-20T14:00:00.000Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Час закінчення пошуку доступних кімнат (ISO формат)',
    example: '2025-05-20T15:00:00.000Z',
  })
  @IsDateString()
  endTime: string;
}
