import { ApiProperty } from '@nestjs/swagger';

export class LoginRecordDto {
  @ApiProperty({ example: 'user@example.com' })
  userId: string;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ example: '2023-01-01 14:28:10' })
  loginAt: string;

  @ApiProperty({ example: '홍길동', nullable: true })
  username: string | null;
}

export class LoginRecordsResponseDto {
  @ApiProperty({ type: [LoginRecordDto] })
  data: LoginRecordDto[];

  @ApiProperty({ example: 30 })
  total: number;
}

export class LoginRankingDto {
  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 58 })
  loginCount: number;

  @ApiProperty({ example: 1, nullable: true })
  rank: number | null;
}

export class LoginRankingsResponseDto {
  @ApiProperty({ type: [LoginRankingDto] })
  data: LoginRankingDto[];

  @ApiProperty({ example: 20 })
  totalUsers: number;
}
