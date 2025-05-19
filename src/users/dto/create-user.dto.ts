import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "Ім'я користувача",
    example: 'Іван',
  })
  @IsNotEmpty({ message: "Ім'я не може бути порожнім" })
  @IsString({ message: "Ім'я повинно бути рядком" })
  name: string;

  @ApiProperty({
    description: 'Електронна пошта користувача',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email не може бути порожнім' })
  @IsEmail({}, { message: 'Неправильний формат email' })
  email: string;

  @ApiProperty({
    description: 'Пароль користувача',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Пароль не може бути порожнім' })
  @MinLength(6, { message: 'Пароль повинен мати не менше 6 символів' })
  password: string;

  @ApiProperty({
    description: 'Номер телефону користувача',
    example: '+380991234567',
    required: false,
  })
  @IsString({ message: 'Номер телефону повинен бути рядком' })
  phone?: string;
}
