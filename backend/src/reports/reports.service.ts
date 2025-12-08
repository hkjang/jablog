import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType, ReportFormat } from '@prisma/client';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a performance report for a given date range
   */
  async generateReport(
    type: ReportType,
    format: ReportFormat,
    dateFrom: Date,
    dateTo: Date,
  ) {
    const title = `${type} 리포트 (${dateFrom.toLocaleDateString('ko-KR')} ~ ${dateTo.toLocaleDateString('ko-KR')})`;

    // Gather analytics data
    const [
      contentAnalytics,
      topicsPerformance,
      apiErrors,
      publishingStats,
    ] = await Promise.all([
      this.prisma.contentAnalytics.aggregate({
        where: { date: { gte: dateFrom, lte: dateTo } },
        _sum: {
          views: true,
          clicks: true,
          revenue: true,
        },
        _avg: {
          clickRate: true,
          avgTimeOnPage: true,
        },
      }),
      this.prisma.topicPerformance.findMany({
        where: { date: { gte: dateFrom, lte: dateTo } },
        include: { topic: { select: { name: true } } },
        orderBy: { totalViews: 'desc' },
        take: 10,
      }),
      this.prisma.apiErrorLog.count({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }),
      this.prisma.publishingLog.groupBy({
        by: ['status'],
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
        _count: true,
      }),
    ]);

    const reportData = {
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalViews: contentAnalytics._sum.views || 0,
        totalClicks: contentAnalytics._sum.clicks || 0,
        totalRevenue: contentAnalytics._sum.revenue || 0,
        avgClickRate: contentAnalytics._avg.clickRate || 0,
        avgTimeOnPage: contentAnalytics._avg.avgTimeOnPage || 0,
      },
      topTopics: topicsPerformance.map(tp => ({
        name: tp.topic.name,
        views: tp.totalViews,
        clicks: tp.totalClicks,
      })),
      publishing: {
        success: publishingStats.find(s => s.status === 'SUCCESS')?._count || 0,
        failed: publishingStats.find(s => s.status === 'FAILED')?._count || 0,
      },
      apiErrors,
      generatedAt: new Date(),
    };

    // Save report to database
    const report = await this.prisma.report.create({
      data: {
        type,
        format,
        title,
        dateFrom,
        dateTo,
        data: reportData,
      },
    });

    this.logger.log(`Generated ${type} report #${report.id}`);

    return {
      id: report.id,
      title,
      format,
      data: reportData,
    };
  }

  /**
   * Export report as CSV string
   */
  exportToCsv(reportData: any): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Views', reportData.summary.totalViews],
      ['Total Clicks', reportData.summary.totalClicks],
      ['Total Revenue', reportData.summary.totalRevenue],
      ['Avg Click Rate', reportData.summary.avgClickRate],
      ['Avg Time on Page', reportData.summary.avgTimeOnPage],
      ['Publishing Success', reportData.publishing.success],
      ['Publishing Failed', reportData.publishing.failed],
      ['API Errors', reportData.apiErrors],
    ];

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    // Add top topics
    csv += '\nTop Topics\n';
    csv += 'Topic,Views,Clicks\n';
    reportData.topTopics.forEach((topic: any) => {
      csv += `${topic.name},${topic.views},${topic.clicks}\n`;
    });

    return csv;
  }

  /**
   * Get all reports
   */
  async getReports(page = 1, limit = 20) {
    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count(),
    ]);

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get single report
   */
  async getReport(id: number) {
    return this.prisma.report.findUnique({
      where: { id },
    });
  }

  /**
   * Generate weekly report automatically
   */
  async generateWeeklyReport() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return this.generateReport(ReportType.WEEKLY, ReportFormat.JSON, lastWeek, today);
  }

  /**
   * Generate monthly report automatically
   */
  async generateMonthlyReport() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    return this.generateReport(ReportType.MONTHLY, ReportFormat.JSON, lastMonth, today);
  }
}
