import { PrismaService } from '../prisma/prisma.service';
export declare class DuplicateService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateContentHash(text: string): string;
    calculateSimilarity(text1: string, text2: string): number;
    checkDuplicate(title: string, body: string, excludeId?: number): Promise<{
        isDuplicate: boolean;
        similarContent: Array<{
            id: number;
            title: string;
            similarity: number;
        }>;
    }>;
    updateContentHash(contentId: number, body: string): Promise<void>;
    markAsDuplicate(contentId: number): Promise<void>;
}
