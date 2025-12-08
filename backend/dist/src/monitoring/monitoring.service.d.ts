import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';
export declare class MonitoringService {
    private prisma;
    constructor(prisma: PrismaService);
    getApiErrors(page?: number, limit?: number, platform?: Platform, resolved?: boolean): Promise<{
        errors: {
            id: number;
            createdAt: Date;
            platform: import("@prisma/client").$Enums.Platform;
            retryCount: number;
            responseData: import("@prisma/client/runtime/library").JsonValue | null;
            endpoint: string;
            method: string;
            statusCode: number | null;
            errorMessage: string;
            requestData: import("@prisma/client/runtime/library").JsonValue | null;
            resolved: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getApiErrorStats(): Promise<{
        totalErrors: number;
        unresolvedErrors: number;
        last24Hours: number;
        last7Days: number;
        errorRate: number;
        successRate: number;
        byPlatform: {
            platform: import("@prisma/client").$Enums.Platform;
            count: number;
        }[];
        topEndpoints: {
            endpoint: string;
            count: number;
        }[];
        retryStats: {
            avgRetries: number;
            maxRetries: number;
        };
    }>;
    resolveError(errorId: number): Promise<{
        id: number;
        createdAt: Date;
        platform: import("@prisma/client").$Enums.Platform;
        retryCount: number;
        responseData: import("@prisma/client/runtime/library").JsonValue | null;
        endpoint: string;
        method: string;
        statusCode: number | null;
        errorMessage: string;
        requestData: import("@prisma/client/runtime/library").JsonValue | null;
        resolved: boolean;
    }>;
    logError(data: {
        platform: Platform;
        endpoint: string;
        method: string;
        statusCode?: number;
        errorMessage: string;
        requestData?: any;
        responseData?: any;
    }): Promise<{
        id: number;
        createdAt: Date;
        platform: import("@prisma/client").$Enums.Platform;
        retryCount: number;
        responseData: import("@prisma/client/runtime/library").JsonValue | null;
        endpoint: string;
        method: string;
        statusCode: number | null;
        errorMessage: string;
        requestData: import("@prisma/client/runtime/library").JsonValue | null;
        resolved: boolean;
    }>;
}
