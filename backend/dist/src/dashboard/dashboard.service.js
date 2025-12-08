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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const [weeklyAnalytics, previousWeekAnalytics, contentStats, recentAlerts, upcomingScheduled] = await Promise.all([
            this.prisma.contentAnalytics.aggregate({
                where: {
                    date: { gte: lastWeek }
                },
                _sum: {
                    views: true,
                    clicks: true,
                    revenue: true
                },
                _avg: {
                    clickRate: true,
                    avgTimeOnPage: true
                }
            }),
            this.prisma.contentAnalytics.aggregate({
                where: {
                    date: {
                        gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
                        lt: lastWeek
                    }
                },
                _sum: {
                    views: true,
                    clicks: true
                }
            }),
            this.prisma.content.groupBy({
                by: ['status'],
                _count: true
            }),
            this.prisma.notification.findMany({
                where: userId ? { userId, read: false } : { read: false },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            this.prisma.scheduledPost.findMany({
                where: {
                    status: 'PENDING',
                    scheduledFor: { gte: today }
                },
                include: { content: { select: { title: true } } },
                orderBy: { scheduledFor: 'asc' },
                take: 5
            })
        ]);
        const currentViews = weeklyAnalytics._sum.views || 0;
        const previousViews = previousWeekAnalytics._sum.views || 0;
        const viewsTrend = previousViews > 0
            ? ((currentViews - previousViews) / previousViews) * 100
            : 0;
        const currentClicks = weeklyAnalytics._sum.clicks || 0;
        const previousClicks = previousWeekAnalytics._sum.clicks || 0;
        const clicksTrend = previousClicks > 0
            ? ((currentClicks - previousClicks) / previousClicks) * 100
            : 0;
        return {
            metrics: {
                totalViews: currentViews,
                viewsTrend: Math.round(viewsTrend * 10) / 10,
                totalClicks: currentClicks,
                clicksTrend: Math.round(clicksTrend * 10) / 10,
                avgClickRate: Math.round((weeklyAnalytics._avg.clickRate || 0) * 100) / 100,
                avgTimeOnPage: Math.round((weeklyAnalytics._avg.avgTimeOnPage || 0) * 10) / 10,
                revenue: weeklyAnalytics._sum.revenue || 0
            },
            contentStats: contentStats.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            alerts: recentAlerts,
            upcomingScheduled: upcomingScheduled.map(s => ({
                id: s.id,
                title: s.content.title,
                platform: s.platform,
                scheduledFor: s.scheduledFor
            }))
        };
    }
    async getRecommendations() {
        const trendingKeywords = await this.prisma.keywordTrend.findMany({
            where: {
                trend: 'RISING',
                date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            include: { keyword: true },
            orderBy: { volume: 'desc' },
            take: 10
        });
        const lowPerformingContent = await this.prisma.content.findMany({
            where: {
                status: 'PUBLISHED',
                seoScore: { lt: 70 }
            },
            select: {
                id: true,
                title: true,
                seoScore: true,
                seoIssues: true,
                views: true
            },
            orderBy: { views: 'asc' },
            take: 5
        });
        const topPerformingTopics = await this.prisma.topicPerformance.findMany({
            include: { topic: true },
            orderBy: { totalViews: 'desc' },
            take: 5
        });
        return {
            recommendedKeywords: trendingKeywords.map(t => ({
                keyword: t.keyword.text,
                volume: t.volume,
                competition: t.keyword.competition,
                trend: t.trend
            })),
            improvementSuggestions: lowPerformingContent.map(c => ({
                id: c.id,
                title: c.title,
                seoScore: c.seoScore,
                issues: c.seoIssues,
                action: `SEO 점수 ${c.seoScore}점 - 개선 필요`
            })),
            topTopics: topPerformingTopics.map(t => ({
                name: t.topic.name,
                views: t.totalViews,
                publishCount: t.publishCount
            })),
            suggestions: [
                trendingKeywords.length > 0
                    ? `"${trendingKeywords[0]?.keyword.text}" 키워드로 새 글 작성 추천`
                    : '새로운 트렌드 키워드를 발굴해보세요',
                lowPerformingContent.length > 0
                    ? `"${lowPerformingContent[0]?.title}" 글의 SEO 개선 필요`
                    : 'SEO 상태가 양호합니다',
                '지난주 대비 성과가 상승 중입니다. 현재 전략을 유지하세요.'
            ]
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map