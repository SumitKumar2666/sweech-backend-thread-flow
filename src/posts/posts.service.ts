import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, PostListQueryDto } from './dto/posts.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Post created successfully',
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        username: post.author.username,
        createdAt: post.createdAt.toISOString(),
      },
    };
  }

  async getPostList(query: PostListQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts.map((post) => ({
        id: post.id,
        title: post.title,
        username: post.author.username,
        createdAt: post.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getPostDetail(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      username: post.author.username,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
