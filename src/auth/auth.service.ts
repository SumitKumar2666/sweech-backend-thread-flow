import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from '../common/interfaces/common.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, ipAddress: string) {
    const { id, password, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        id,
        password: hashedPassword,
        username,
        registeredAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        registeredAt: true,
      },
    });

    return {
      id: user.id,
      username: user.username,
      registeredAt: user.registeredAt.toISOString(),
    };
  }

  async login(loginDto: LoginDto, ipAddress: string) {
    const { id, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Record login
    await this.prisma.loginRecord.create({
      data: {
        userId: user.id,
        ipAddress,
        loginAt: new Date(),
      },
    });

    // Generate JWT
    const payload: JwtPayload = { sub: user.id, email: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
