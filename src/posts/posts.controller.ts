import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import {
  CreatePostDto,
  PostListQueryDto,
  PostListResponseDto,
  PostDetailDto,
  CreatePostResponseDto,
} from './dto/posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/auth.decorators';
import { JwtPayload } from '../common/interfaces/common.interfaces';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: CreatePostResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPost(
    @CurrentUser() user: JwtPayload,
    @Body() createPostDto: CreatePostDto,
  ): Promise<CreatePostResponseDto> {
    return this.postsService.createPost(user.sub, createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get post list with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Post list retrieved successfully',
    type: PostListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPostList(
    @Query() query: PostListQueryDto,
  ): Promise<PostListResponseDto> {
    return this.postsService.getPostList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post detail by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'Post detail retrieved successfully',
    type: PostDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostDetailDto> {
    return this.postsService.getPostDetail(id);
  }
}
