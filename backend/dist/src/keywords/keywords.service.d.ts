import { PrismaService } from '../prisma/prisma.service';
export declare class KeywordsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateKeywordsForTopic(topicName: string): Promise<{
        error: string;
    }>;
    generateKeywordsForTopicById(topicId: number): Promise<{
        success: boolean;
        count: number;
    }>;
    getKeywords(topicId: number): Promise<{
        id: number;
        text: string;
        volume: number;
        competition: number;
        topicId: number | null;
    }[]>;
}
