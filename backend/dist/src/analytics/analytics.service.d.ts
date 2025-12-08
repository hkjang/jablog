import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTrafficAnalytics(startDate?: Date, endDate?: Date): Promise<{
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
