import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    prismaService = mockDeep<PrismaService>();
  });

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      loginRecord: {
        create: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      id: 'test@example.com',
      password: 'password123!',
      username: '테스트유저',
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'test@example.com',
        username: '테스트유저',
        registeredAt: new Date('2023-01-01T00:00:00.000Z'),
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      prismaService.user.create.mockResolvedValue(mockUser as any);

      const result = await service.register(mockRegisterDto, '192.168.1.1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test@example.com' },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123!', 12);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: 'test@example.com',
          password: 'hashedPassword',
          username: '테스트유저',
          registeredAt: expect.any(Date),
        },
        select: {
          id: true,
          username: true,
          registeredAt: true,
        },
      });
      expect(result).toEqual({
        id: 'test@example.com',
        username: '테스트유저',
        registeredAt: '2023-01-01T00:00:00.000Z',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = { id: 'test@example.com' };
      prismaService.user.findUnique.mockResolvedValue(existingUser as any);

      await expect(
        service.register(mockRegisterDto, '192.168.1.1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      id: 'test@example.com',
      password: 'password123!',
    };

    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'test@example.com',
        password: 'hashedPassword',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      prismaService.loginRecord.create.mockResolvedValue({} as any);
      jwtService.sign.mockReturnValue('mockAccessToken');

      const result = await service.login(mockLoginDto, '192.168.1.1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test@example.com' },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'password123!',
        'hashedPassword',
      );
      expect(prismaService.loginRecord.create).toHaveBeenCalledWith({
        data: {
          userId: 'test@example.com',
          ipAddress: '192.168.1.1',
          loginAt: expect.any(Date),
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'test@example.com',
        email: 'test@example.com',
      });
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(mockLoginDto, '192.168.1.1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'test@example.com',
        password: 'hashedPassword',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(mockLoginDto, '192.168.1.1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
