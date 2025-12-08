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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrafficAnalytics(startDate, endDate) {
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map