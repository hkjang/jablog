import { MonitoringService } from './monitoring.service';
import { Platform } from '@prisma/client';
export declare class MonitoringController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    getApiErrors(page?: string, limit?: string, platform?: Platform, resolved?: string): Promise<{
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
    resolveError(id: number): Promise<{
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
