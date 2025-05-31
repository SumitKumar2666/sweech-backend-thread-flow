import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { CreatePostDto, PostListQueryDto } from './dto/posts.dto';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(() => {
    prismaService = mockDeep<PrismaService>();
  });

  beforeEach(async () => {
    const mockPrismaService = {
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    const mockCreatePostDto: CreatePostDto = {
      title: 'Test Post',
      content: 'This is a test post content.',
    };

    it('should successfully create a post', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'This is a test post content.',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        author: {
          username: '테스트유저',
        },
      };

      prismaService.post.create.mockResolvedValue(mockPost as any);

      const result = await service.createPost(
        'user@example.com',
        mockCreatePostDto,
      );

      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Post',
          content: 'This is a test post content.',
          authorId: 'user@example.com',
        },
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
      });

      expect(result).toEqual({
        status: 'success',
        message: 'Post created successfully',
        data: {
          id: 1,
          title: 'Test Post',
          content: 'This is a test post content.',
          username: '테스트유저',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      });
    });
  });

  describe('getPostList', () => {
    it('should return paginated post list', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          createdAt: new Date('2023-01-02T00:00:00.000Z'),
          author: { username: '유저1' },
        },
        {
          id: 2,
          title: 'Post 2',
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          author: { username: '유저2' },
        },
      ];

      prismaService.post.findMany.mockResolvedValue(mockPosts as any);
      prismaService.post.count.mockResolvedValue(100);

      const query: PostListQueryDto = { page: 1, limit: 20 };
      const result = await service.getPostList(query);

      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { username: true },
          },
        },
      });

      expect(result).toEqual({
        data: [
          {
            id: 1,
            title: 'Post 1',
            username: '유저1',
            createdAt: '2023-01-02T00:00:00.000Z',
          },
          {
            id: 2,
            title: 'Post 2',
            username: '유저2',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
      });
    });
  });

  describe('getPostDetail', () => {
    it('should return post detail', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        author: { username: '테스트유저' },
      };

      prismaService.post.findUnique.mockResolvedValue(mockPost as any);

      const result = await service.getPostDetail(1);

      expect(result).toEqual({
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        username: '테스트유저',
        createdAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      prismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.getPostDetail(1)).rejects.toThrow(NotFoundException);
    });
  });
});
