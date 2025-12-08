import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get API error logs with pagination
   */
  async getApiErrors(page = 1, limit = 20, platform?: Platform, resolved?: boolean) {
    const where: any = {};
    if (platform) where.platform = platform;
    if (resolved !== undefined) where.resolved = resolved;

    const [errors, total] = await Promise.all([
      this.prisma.apiErrorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.apiErrorLog.count({ where })
    ]);

    return {
      errors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get API error statistics
   */
  async getApiErrorStats() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalErrors,
      unresolvedErrors,
      last24HoursCount,
      last7DaysCount,
      byPlatform,
      byEndpoint,
      retryStats
    ] = await Promise.all([
      this.prisma.apiErrorLog.count(),
      this.prisma.apiErrorLog.count({ where: { resolved: false } }),
      this.prisma.apiErrorLog.count({ where: { createdAt: { gte: last24Hours } } }),
      this.prisma.apiErrorLog.count({ where: { createdAt: { gte: last7Days } } }),
      this.prisma.apiErrorLog.groupBy({
        by: ['platform'],
        _count: true,
        where: { createdAt: { gte: last7Days } }
      }),
      this.prisma.apiErrorLog.groupBy({
        by: ['endpoint'],
        _count: true,
        where: { createdAt: { gte: last7Days } },
        orderBy: { _count: { endpoint: 'desc' } },
        take: 5
      }),
      this.prisma.apiErrorLog.aggregate({
        _avg: { retryCount: true },
        _max: { retryCount: true },
        where: { createdAt: { gte: last7Days } }
      })
    ]);

    // Calculate success rate from publishing logs
    const publishingStats = await this.prisma.publishingLog.groupBy({
      by: ['status'],
      _count: true,
      where: { createdAt: { gte: last7Days } }
    });

    const successCount = publishingStats.find(s => s.status === 'SUCCESS')?._count || 0;
    const failedCount = publishingStats.find(s => s.status === 'FAILED')?._count || 0;
    const totalPublishes = successCount + failedCount;

    return {
      totalErrors,
      unresolvedErrors,
      last24Hours: last24HoursCount,
      last7Days: last7DaysCount,
      errorRate: totalPublishes > 0 
        ? Math.round((failedCount / totalPublishes) * 10000) / 100 
        : 0,
      successRate: totalPublishes > 0 
        ? Math.round((successCount / totalPublishes) * 10000) / 100 
        : 100,
      byPlatform: byPlatform.map(p => ({
        platform: p.platform,
        count: p._count
      })),
      topEndpoints: byEndpoint.map(e => ({
        endpoint: e.endpoint,
        count: e._count
      })),
      retryStats: {
        avgRetries: Math.round((retryStats._avg.retryCount || 0) * 10) / 10,
        maxRetries: retryStats._max.retryCount || 0
      }
    };
  }

  /**
   * Mark error as resolved
   */
  async resolveError(errorId: number) {
    return this.prisma.apiErrorLog.update({
      where: { id: errorId },
      data: { resolved: true }
    });
  }

  /**
   * Log an API error
   */
  async logError(data: {
    platform: Platform;
    endpoint: string;
    method: string;
    statusCode?: number;
    errorMessage: string;
    requestData?: any;
    responseData?: any;
  }) {
    return this.prisma.apiErrorLog.create({
      data: {
        ...data,
        retryCount: 0,
        resolved: false
      }
    });
  }
}
