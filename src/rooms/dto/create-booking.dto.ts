import { IsNotEmpty, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID користувача, який робить бронювання',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Час початку бронювання',
    example: '2023-10-01T14:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Час закінчення бронювання',
    example: '2023-10-01T16:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
