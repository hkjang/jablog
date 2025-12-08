import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get traffic analytics with date range
   */
  async getTrafficAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const analytics = await this.prisma.contentAnalytics.groupBy({
      by: ['date'],
      where: {
        date: { gte: start, lte: end }
      },
      _sum: {
        views: true,
        uniqueVisitors: true,
        clicks: true,
        organicTraffic: true,
        directTraffic: true,
        referralTraffic: true,
        socialTraffic: true,
        revenue: true
      },
      _avg: {
        avgTimeOnPage: true,
        bounceRate: true,
        clickRate: true
      },
      orderBy: { date: 'asc' }
    });

    // Calculate totals
    const totals = await this.prisma.contentAnalytics.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: {
        views: true,
        clicks: true,
        revenue: true,
        organicTraffic: true,
        directTraffic: true,
        referralTraffic: true,
        socialTraffic: true
      },
      _avg: {
        avgTimeOnPage: true,
        bounceRate: true,
        clickRate: true
      }
    });

    return {
      period: { start, end },
      dailyData: analytics.map(day => ({
        date: day.date,
        views: day._sum.views || 0,
        uniqueVisitors: day._sum.uniqueVisitors || 0,
        clicks: day._sum.clicks || 0,
        avgTimeOnPage: Math.round((day._avg.avgTimeOnPage || 0) * 10) / 10,
        bounceRate: Math.round((day._avg.bounceRate || 0) * 100) / 100,
        clickRate: Math.round((day._avg.clickRate || 0) * 100) / 100,
        revenue: day._sum.revenue || 0
      })),
      totals: {
        views: totals._sum.views || 0,
        clicks: totals._sum.clicks || 0,
        avgTimeOnPage: Math.round((totals._avg.avgTimeOnPage || 0) * 10) / 10,
        bounceRate: Math.round((totals._avg.bounceRate || 0) * 100) / 100,
        clickRate: Math.round((totals._avg.clickRate || 0) * 100) / 100,
        revenue: totals._sum.revenue || 0
      },
      trafficSources: {
        organic: totals._sum.organicTraffic || 0,
        direct: totals._sum.directTraffic || 0,
        referral: totals._sum.referralTraffic || 0,
        social: totals._sum.socialTraffic || 0
      }
    };
  }

  /**
   * Compare topic performance
   */
  async getTopicsComparison() {
    const topics = await this.prisma.topic.findMany({
      include: {
        performance: {
          orderBy: { date: 'desc' },
          take: 30
        },
        _count: {
          select: { contents: true, keywords: true }
        }
      }
    });

    return topics.map(topic => {
      const totalViews = topic.performance.reduce((sum, p) => sum + p.totalViews, 0);
      const totalClicks = topic.performance.reduce((sum, p) => sum + p.totalClicks, 0);
      const avgRanking = topic.performance.length > 0 
        ? topic.performance.reduce((sum, p) => sum + p.avgRanking, 0) / topic.performance.length 
        : 0;
      const avgConversionRate = topic.performance.length > 0
        ? topic.performance.reduce((sum, p) => sum + p.conversionRate, 0) / topic.performance.length
        : 0;

      return {
        id: topic.id,
        name: topic.name,
        score: topic.score,
        contentCount: topic._count.contents,
        keywordCount: topic._count.keywords,
        totalViews,
        totalClicks,
        avgRanking: Math.round(avgRanking * 10) / 10,
        avgConversionRate: Math.round(avgConversionRate * 100) / 100,
        clickRate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 10000) / 100 : 0
      };
    }).sort((a, b) => b.totalViews - a.totalViews);
  }

  /**
   * Compare platform performance (Tistory vs WordPress)
   */
  async getPlatformComparison() {
    const platforms = await this.prisma.content.groupBy({
      by: ['platform'],
      _count: true,
      _sum: {
        views: true,
        clicks: true
      },
      _avg: {
        seoScore: true,
        avgTimeOnPage: true,
        bounceRate: true
      }
    });

    const publishLogs = await this.prisma.publishingLog.groupBy({
      by: ['platform', 'status'],
      _count: true
    });

    const platformStats = platforms.map(p => {
      const logs = publishLogs.filter(l => l.platform === p.platform);
      const successCount = logs.find(l => l.status === 'SUCCESS')?._count || 0;
      const failedCount = logs.find(l => l.status === 'FAILED')?._count || 0;
      const totalPublishes = successCount + failedCount;

      return {
        platform: p.platform,
        contentCount: p._count,
        totalViews: p._sum.views || 0,
        totalClicks: p._sum.clicks || 0,
        avgSeoScore: Math.round((p._avg.seoScore || 0) * 10) / 10,
        avgTimeOnPage: Math.round((p._avg.avgTimeOnPage || 0) * 10) / 10,
        bounceRate: Math.round((p._avg.bounceRate || 0) * 100) / 100,
        publishSuccessRate: totalPublishes > 0 
          ? Math.round((successCount / totalPublishes) * 100) 
          : 100
      };
    });

    return platformStats;
  }
}
