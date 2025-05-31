import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginRecordsService } from './login-records.service';
import {
  LoginRecordsResponseDto,
  LoginRankingsResponseDto,
} from './dto/login-records.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Login Records')
@Controller('login-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoginRecordsController {
  constructor(private readonly loginRecordsService: LoginRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user login records' })
  @ApiResponse({
    status: 200,
    description: 'Login records retrieved successfully',
    type: LoginRecordsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoginRecords(): Promise<LoginRecordsResponseDto> {
    return this.loginRecordsService.getLoginRecords();
  }

  @Get('rankings')
  @ApiOperation({ summary: 'Get login count rankings for current week' })
  @ApiResponse({
    status: 200,
    description: 'Login rankings retrieved successfully',
    type: LoginRankingsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoginRankings(): Promise<LoginRankingsResponseDto> {
    return this.loginRecordsService.getLoginRankings();
  }
}
