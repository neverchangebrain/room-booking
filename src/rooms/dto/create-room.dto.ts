import { IsString, IsInt, Min } from 'class-validator';
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
}
