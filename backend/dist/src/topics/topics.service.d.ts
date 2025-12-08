import { PrismaService } from '../prisma/prisma.service';
export declare class TopicsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    discoverTopics(): Promise<{
        success: boolean;
        count: any;
    }>;
    getTopics(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        score: number;
    }[]>;
}
