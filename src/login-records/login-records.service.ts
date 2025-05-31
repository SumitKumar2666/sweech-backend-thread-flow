import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoginRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLoginRecords() {
    const records = await this.prisma.loginRecord.findMany({
      take: 30,
      orderBy: {
        loginAt: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      data: records.map((record) => ({
        userId: record.userId,
        ipAddress: record.ipAddress,
        loginAt: this.formatDateTime(record.loginAt),
        username: record.user?.username || null,
      })),
      total: records.length,
    };
  }

  async getLoginRankings() {
    // Get current week's Monday and Sunday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Get login counts for this week grouped by user
    const loginCounts = await this.prisma.loginRecord.groupBy({
      by: ['userId'],
      where: {
        loginAt: {
          gte: monday,
          lte: sunday,
        },
      },
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 20,
    });

    // Get user information
    const userIds = loginCounts.map((record) => record.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user.username]));

    // Calculate rankings
    const rankings = [];
    let currentRank = 1;
    let previousCount = -1;
    let usersWithSameRank = 0;

    for (let i = 0; i < loginCounts.length; i++) {
      const record = loginCounts[i];
      const loginCount = record._count.userId;

      if (loginCount !== previousCount) {
        currentRank = i + 1;
        usersWithSameRank = 1;
      } else {
        usersWithSameRank++;
      }

      rankings.push({
        name: userMap.get(record.userId) || 'Unknown',
        loginCount,
        rank: loginCounts.length > 0 ? currentRank : null,
      });

      previousCount = loginCount;
    }

    return {
      data: rankings,
      totalUsers: 20,
    };
  }

  private formatDateTime(date: Date): string {
    return date
      .toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace('T', ' ');
  }
}
