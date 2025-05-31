import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email (ID)',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'ID must be in email format' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description:
      'Password (12-20 characters, must contain lowercase, special characters, and numbers)',
    example: 'password123!',
  })
  @IsString()
  @Length(12, 20, { message: 'Password must be between 12 and 20 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/,
    {
      message:
        'Password must contain lowercase letters, numbers, and special characters',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Username in Korean (1-10 characters)',
    example: '홍길동',
  })
  @IsString()
  @Length(1, 10, { message: 'Username must be between 1 and 10 characters' })
  @Matches(/^[가-힣]+$/, { message: 'Username must be in Korean' })
  username: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email (ID)',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'ID must be in email format' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'user@example.com' })
  id: string;

  @ApiProperty({ example: '홍길동' })
  username: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  registeredAt: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}
