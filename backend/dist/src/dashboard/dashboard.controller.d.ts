import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(userId?: string): Promise<{
        metrics: {
            totalViews: number;
            viewsTrend: number;
            totalClicks: number;
            clicksTrend: number;
            avgClickRate: number;
            avgTimeOnPage: number;
            revenue: number;
        };
        contentStats: Record<string, number>;
        alerts: {
            id: number;
            createdAt: Date;
            title: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            type: import("@prisma/client").$Enums.NotificationType;
            message: string;
            read: boolean;
            userId: number;
        }[];
        upcomingScheduled: {
            id: number;
            title: string;
            platform: import("@prisma/client").$Enums.Platform;
            scheduledFor: Date;
        }[];
    }>;
    getRecommendations(): Promise<{
        recommendedKeywords: {
            keyword: string;
            volume: number;
            competition: number;
            trend: string;
        }[];
        improvementSuggestions: {
            id: number;
            title: string;
            seoScore: number;
            issues: string[];
            action: string;
        }[];
        topTopics: {
            name: string;
            views: number;
            publishCount: number;
        }[];
        suggestions: string[];
    }>;
}
