import { IsDateString, IsString } from 'class-validator';
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
}
