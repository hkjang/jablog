import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';
export declare class SettingsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getPlatformCredentials(userId: number): Promise<{
        id: number;
        platform: import("@prisma/client").$Enums.Platform;
        name: string;
        blogName: string | null;
        siteUrl: string | null;
        isActive: boolean;
        lastTestedAt: Date | null;
        lastTestResult: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getPlatformCredential(id: number): Promise<{
        id: number;
        userId: number;
        platform: import("@prisma/client").$Enums.Platform;
        name: string;
        blogName: string | null;
        username: string | null;
        siteUrl: string | null;
        isActive: boolean;
        lastTestedAt: Date | null;
        lastTestResult: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createPlatformCredential(data: {
        userId: number;
        platform: Platform;
        name: string;
        blogName?: string;
        accessToken?: string;
        apiKey?: string;
        username?: string;
        appPassword?: string;
        siteUrl?: string;
    }): Promise<{
        id: number;
        platform: import("@prisma/client").$Enums.Platform;
        name: string;
        blogName: string | null;
        siteUrl: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    updatePlatformCredential(id: number, data: {
        name?: string;
        blogName?: string;
        accessToken?: string;
        apiKey?: string;
        username?: string;
        appPassword?: string;
        siteUrl?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        platform: import("@prisma/client").$Enums.Platform;
        name: string;
        blogName: string | null;
        siteUrl: string | null;
        isActive: boolean;
        updatedAt: Date;
    }>;
    deletePlatformCredential(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    testPlatformConnection(id: number): Promise<{
        success: boolean;
        message: string;
        testedAt: Date;
    }>;
    private testTistoryConnection;
    private testWordpressConnection;
    getAiSettings(userId: number): Promise<{
        apiKey: string | null;
        id: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        provider: string;
        model: string;
        apiUrl: string | null;
        temperature: number;
        maxTokens: number;
        systemPrompt: string | null;
        contentPrompt: string | null;
        titlePrompt: string | null;
        autoSeoOptimize: boolean;
        autoTranslate: boolean;
    }>;
    updateAiSettings(userId: number, data: Partial<{
        provider: string;
        model: string;
        apiKey: string;
        apiUrl: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
        contentPrompt: string;
        titlePrompt: string;
        autoSeoOptimize: boolean;
        autoTranslate: boolean;
    }>): Promise<{
        id: number;
        updatedAt: Date;
        provider: string;
        model: string;
        apiUrl: string | null;
        temperature: number;
        maxTokens: number;
        systemPrompt: string | null;
        contentPrompt: string | null;
        titlePrompt: string | null;
        autoSeoOptimize: boolean;
        autoTranslate: boolean;
    }>;
    resetAiSettings(userId: number): Promise<{
        id: number;
        userId: number;
        apiKey: string | null;
        createdAt: Date;
        updatedAt: Date;
        provider: string;
        model: string;
        apiUrl: string | null;
        temperature: number;
        maxTokens: number;
        systemPrompt: string | null;
        contentPrompt: string | null;
        titlePrompt: string | null;
        autoSeoOptimize: boolean;
        autoTranslate: boolean;
    }>;
}
