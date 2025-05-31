import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'New username in Korean (1-10 characters)',
    example: '김철수',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 10, { message: 'Username must be between 1 and 10 characters' })
  @Matches(/^[가-힣]+$/, { message: 'Username must be in Korean' })
  username?: string;

  @ApiProperty({
    description:
      'New password (12-20 characters, must contain lowercase, special characters, and numbers)',
    example: 'newpassword123!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(12, 20, { message: 'Password must be between 12 and 20 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/,
    {
      message:
        'Password must contain lowercase letters, numbers, and special characters',
    },
  )
  password?: string;
}

export class UpdateUserResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'User information updated successfully' })
  message: string;
}
