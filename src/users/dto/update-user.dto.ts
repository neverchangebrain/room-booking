import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "Ім'я користувача",
    example: 'Іван',
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Ім'я повинно бути рядком" })
  name?: string;

  @ApiProperty({
    description: 'Електронна пошта користувача',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Неправильний формат email' })
  email?: string;

  @ApiProperty({
    description: 'Пароль користувача',
    example: 'password123',
    required: false,
  })
  @IsOptional()
  @MinLength(6, { message: 'Пароль повинен мати не менше 6 символів' })
  password?: string;

  @ApiProperty({
    description: 'Номер телефону користувача',
    example: '+380991234567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Номер телефону повинен бути рядком' })
  phone?: string;
}
