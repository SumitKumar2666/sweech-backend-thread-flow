import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CommentListQueryDto } from './dto/comments.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    userId: string,
    postId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId,
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
      message: 'Comment created successfully',
      data: {
        id: comment.id,
        content: comment.content,
        username: comment.author.username,
        createdAt: comment.createdAt.toISOString(),
      },
    };
  }

  async getCommentList(postId: number, query: CommentListQueryDto) {
    const { cursor, limit = 10 } = query;

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const whereClause: any = { postId };

    // Add cursor condition for pagination
    if (cursor) {
      whereClause.id = {
        lt: parseInt(cursor),
      };
    }

    const comments = await this.prisma.comment.findMany({
      where: whereClause,
      take: limit + 1, // Take one extra to check if there are more
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
    });

    const hasMore = comments.length > limit;
    const data = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? data[data.length - 1].id.toString() : null;

    return {
      data: data.map((comment) => ({
        id: comment.id,
        content: comment.content,
        username: comment.author.username,
        createdAt: comment.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    };
  }

  async deleteComment(userId: string, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the comment author or the post author
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own comments or comments on your posts',
      );
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return {
      status: 'success',
      message: 'Comment deleted successfully',
    };
  }
}
