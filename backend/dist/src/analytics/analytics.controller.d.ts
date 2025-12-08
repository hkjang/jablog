import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getTrafficAnalytics(startDate?: string, endDate?: string): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        dailyData: {
            date: Date;
            views: number;
            uniqueVisitors: number;
            clicks: number;
            avgTimeOnPage: number;
            bounceRate: number;
            clickRate: number;
            revenue: number;
        }[];
        totals: {
            views: number;
            clicks: number;
            avgTimeOnPage: number;
            bounceRate: number;
            clickRate: number;
            revenue: number;
        };
        trafficSources: {
            organic: number;
            direct: number;
            referral: number;
            social: number;
        };
    }>;
    getTopicsComparison(): Promise<{
        id: number;
        name: string;
        score: number;
        contentCount: number;
        keywordCount: number;
        totalViews: number;
        totalClicks: number;
        avgRanking: number;
        avgConversionRate: number;
        clickRate: number;
    }[]>;
    getPlatformComparison(): Promise<{
        platform: import("@prisma/client").$Enums.Platform;
        contentCount: number;
        totalViews: number;
        totalClicks: number;
        avgSeoScore: number;
        avgTimeOnPage: number;
        bounceRate: number;
        publishSuccessRate: number;
    }[]>;
}
