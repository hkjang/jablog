"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = ReportsService_1 = class ReportsService {
    prisma;
    logger = new common_1.Logger(ReportsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateReport(type, format, dateFrom, dateTo) {
        const title = `${type} 리포트 (${dateFrom.toLocaleDateString('ko-KR')} ~ ${dateTo.toLocaleDateString('ko-KR')})`;
        const [contentAnalytics, topicsPerformance, apiErrors, publishingStats,] = await Promise.all([
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
    exportToCsv(reportData) {
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
        csv += '\nTop Topics\n';
        csv += 'Topic,Views,Clicks\n';
        reportData.topTopics.forEach((topic) => {
            csv += `${topic.name},${topic.views},${topic.clicks}\n`;
        });
        return csv;
    }
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
    async getReport(id) {
        return this.prisma.report.findUnique({
            where: { id },
        });
    }
    async generateWeeklyReport() {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return this.generateReport(client_1.ReportType.WEEKLY, client_1.ReportFormat.JSON, lastWeek, today);
    }
    async generateMonthlyReport() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return this.generateReport(client_1.ReportType.MONTHLY, client_1.ReportFormat.JSON, lastMonth, today);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map