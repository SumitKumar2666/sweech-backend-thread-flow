import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreateCommentDto, CommentListQueryDto } from './dto/comments.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(() => {
    prismaService = mockDeep<PrismaService>();
  });

  beforeEach(async () => {
    const mockPrismaService = {
      post: {
        findUnique: jest.fn(),
      },
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    const mockCreateCommentDto: CreateCommentDto = {
      content: 'This is a test comment.',
    };

    it('should successfully create a comment', async () => {
      const mockPost = { id: 1 };
      const mockComment = {
        id: 1,
        content: 'This is a test comment.',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        author: { username: '테스트유저' },
      };

      prismaService.post.findUnique.mockResolvedValue(mockPost as any);
      prismaService.comment.create.mockResolvedValue(mockComment as any);

      const result = await service.createComment(
        'user@example.com',
        1,
        mockCreateCommentDto,
      );

      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'This is a test comment.',
          postId: 1,
          authorId: 'user@example.com',
        },
        include: {
          author: {
            select: { username: true },
          },
        },
      });

      expect(result).toEqual({
        status: 'success',
        message: 'Comment created successfully',
        data: {
          id: 1,
          content: 'This is a test comment.',
          username: '테스트유저',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment('user@example.com', 1, mockCreateCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCommentList', () => {
    it('should return paginated comment list', async () => {
      const mockPost = { id: 1 };
      const mockComments = [
        {
          id: 10,
          content: 'Comment 1',
          createdAt: new Date('2023-01-02T00:00:00.000Z'),
          author: { username: '유저1' },
        },
        {
          id: 9,
          content: 'Comment 2',
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          author: { username: '유저2' },
        },
      ];

      prismaService.post.findUnique.mockResolvedValue(mockPost as any);
      prismaService.comment.findMany.mockResolvedValue(mockComments as any);

      const query: CommentListQueryDto = { limit: 10 };
      const result = await service.getCommentList(1, query);

      expect(result).toEqual({
        data: [
          {
            id: 10,
            content: 'Comment 1',
            username: '유저1',
            createdAt: '2023-01-02T00:00:00.000Z',
          },
          {
            id: 9,
            content: 'Comment 2',
            username: '유저2',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        nextCursor: null,
        hasMore: false,
      });
    });

    it('should handle cursor pagination', async () => {
      const mockPost = { id: 1 };
      const mockComments = Array.from({ length: 11 }, (_, i) => ({
        id: 20 - i,
        content: `Comment ${i + 1}`,
        createdAt: new Date(),
        author: { username: `유저${i + 1}` },
      }));

      prismaService.post.findUnique.mockResolvedValue(mockPost as any);
      prismaService.comment.findMany.mockResolvedValue(mockComments as any);

      const query: CommentListQueryDto = { cursor: '15', limit: 10 };
      const result = await service.getCommentList(1, query);

      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: {
          postId: 1,
          id: { lt: 15 },
        },
        take: 11,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { username: true },
          },
        },
      });

      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('10');
      expect(result.data).toHaveLength(10);
    });
  });

  describe('deleteComment', () => {
    it('should successfully delete comment by author', async () => {
      const mockComment = {
        id: 1,
        authorId: 'user@example.com',
        post: { authorId: 'other@example.com' },
      };

      prismaService.comment.findUnique.mockResolvedValue(mockComment as any);
      prismaService.comment.delete.mockResolvedValue({} as any);

      const result = await service.deleteComment('user@example.com', 1);

      expect(result).toEqual({
        status: 'success',
        message: 'Comment deleted successfully',
      });
    });

    it('should successfully delete comment by post author', async () => {
      const mockComment = {
        id: 1,
        authorId: 'other@example.com',
        post: { authorId: 'user@example.com' },
      };

      prismaService.comment.findUnique.mockResolvedValue(mockComment as any);
      prismaService.comment.delete.mockResolvedValue({} as any);

      const result = await service.deleteComment('user@example.com', 1);

      expect(result).toEqual({
        status: 'success',
        message: 'Comment deleted successfully',
      });
    });

    it('should throw NotFoundException if comment not found', async () => {
      prismaService.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteComment('user@example.com', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user cannot delete comment', async () => {
      const mockComment = {
        id: 1,
        authorId: 'other@example.com',
        post: { authorId: 'another@example.com' },
      };

      prismaService.comment.findUnique.mockResolvedValue(mockComment as any);

      await expect(
        service.deleteComment('user@example.com', 1),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
