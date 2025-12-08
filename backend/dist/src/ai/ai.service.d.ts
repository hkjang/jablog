import { PrismaService } from '../prisma/prisma.service';
export declare class AiService {
    private prisma;
    constructor(prisma: PrismaService);
    getCoachFeedback(userId?: number): Promise<{
        summary: {
            currentViews: number;
            previousViews: number;
            viewsChange: number;
            trend: string;
        };
        insights: string[];
        recommendedActions: {
            type: string;
            title: string;
            description: string;
            priority: "high" | "medium" | "low";
        }[];
        nextPublishRecommendations: {
            keyword: string;
            volume: number;
            competition: number;
            reason: string;
        }[];
    }>;
    getImprovementSuggestions(contentId: number): Promise<{
        contentId: number;
        title: string;
        currentScore: number;
        suggestions: {
            category: string;
            issue: string;
            suggestion: string;
            priority: "high" | "medium" | "low";
        }[];
        estimatedScoreAfterFix: number;
    }>;
    private getSeoSuggestion;
}
