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

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content (1-500 characters)',
    example: 'This is a great post!',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500, { message: 'Content must be between 1 and 500 characters' })
  content: string;
}

export class CommentListQueryDto {
  @ApiProperty({
    description: 'Cursor for pagination (comment ID)',
    example: '10',
    required: false,
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: 'Items per page (max: 10, default: 10)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  @Transform(({ value }) => Math.min(parseInt(value) || 10, 10))
  limit?: number = 10;
}

export class CommentItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'This is a great post!' })
  content: string;

  @ApiProperty({ example: '홍길동' })
  username: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;
}

export class CommentListResponseDto {
  @ApiProperty({ type: [CommentItemDto] })
  data: CommentItemDto[];

  @ApiProperty({ example: '15', nullable: true })
  nextCursor: string | null;

  @ApiProperty({ example: true })
  hasMore: boolean;
}

export class CreateCommentResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Comment created successfully' })
  message: string;

  @ApiProperty({ type: CommentItemDto })
  data: CommentItemDto;
}

export class DeleteCommentResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Comment deleted successfully' })
  message: string;
}
