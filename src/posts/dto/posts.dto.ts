import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title (1-30 characters)',
    example: 'My First Post',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 30, { message: 'Title must be between 1 and 30 characters' })
  title: string;

  @ApiProperty({
    description: 'Post content (1-1000 characters)',
    example: 'This is the content of my first post.',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, { message: 'Content must be between 1 and 1000 characters' })
  content: string;
}

export class PostListQueryDto {
  @ApiProperty({
    description: 'Page number (default: 1)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page (max: 20, default: 20)',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => Math.min(parseInt(value) || 20, 20))
  limit?: number = 20;
}

export class PostListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My First Post' })
  title: string;

  @ApiProperty({ example: '홍길동' })
  username: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;
}

export class PostListResponseDto {
  @ApiProperty({ type: [PostListItemDto] })
  data: PostListItemDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PostDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'My First Post' })
  title: string;

  @ApiProperty({ example: 'This is the content of my first post.' })
  content: string;

  @ApiProperty({ example: '홍길동' })
  username: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;
}

export class CreatePostResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Post created successfully' })
  message: string;

  @ApiProperty({ type: PostDetailDto })
  data: PostDetailDto;
}
