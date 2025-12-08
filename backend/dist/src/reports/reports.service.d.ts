import { PrismaService } from '../prisma/prisma.service';
import { ReportType, ReportFormat } from '@prisma/client';
export declare class ReportsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateReport(type: ReportType, format: ReportFormat, dateFrom: Date, dateTo: Date): Promise<{
        id: number;
        title: string;
        format: import("@prisma/client").$Enums.ReportFormat;
        data: {
            period: {
                from: Date;
                to: Date;
            };
            summary: {
                totalViews: number;
                totalClicks: number;
                totalRevenue: number;
                avgClickRate: number;
                avgTimeOnPage: number;
            };
            topTopics: {
                name: string;
                views: number;
                clicks: number;
            }[];
            publishing: {
                success: number;
                failed: number;
            };
            apiErrors: number;
            generatedAt: Date;
        };
    }>;
    exportToCsv(reportData: any): string;
    getReports(page?: number, limit?: number): Promise<{
        reports: {
            id: number;
            createdAt: Date;
            title: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            type: import("@prisma/client").$Enums.ReportType;
            format: import("@prisma/client").$Enums.ReportFormat;
            dateFrom: Date;
            dateTo: Date;
            filePath: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getReport(id: number): Promise<{
        id: number;
        createdAt: Date;
        title: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import("@prisma/client").$Enums.ReportType;
        format: import("@prisma/client").$Enums.ReportFormat;
        dateFrom: Date;
        dateTo: Date;
        filePath: string | null;
    } | null>;
    generateWeeklyReport(): Promise<{
        id: number;
        title: string;
        format: import("@prisma/client").$Enums.ReportFormat;
        data: {
            period: {
                from: Date;
                to: Date;
            };
            summary: {
                totalViews: number;
                totalClicks: number;
                totalRevenue: number;
                avgClickRate: number;
                avgTimeOnPage: number;
            };
            topTopics: {
                name: string;
                views: number;
                clicks: number;
            }[];
            publishing: {
                success: number;
                failed: number;
            };
            apiErrors: number;
            generatedAt: Date;
        };
    }>;
    generateMonthlyReport(): Promise<{
        id: number;
        title: string;
        format: import("@prisma/client").$Enums.ReportFormat;
        data: {
            period: {
                from: Date;
                to: Date;
            };
            summary: {
                totalViews: number;
                totalClicks: number;
                totalRevenue: number;
                avgClickRate: number;
                avgTimeOnPage: number;
            };
            topTopics: {
                name: string;
                views: number;
                clicks: number;
            }[];
            publishing: {
                success: number;
                failed: number;
            };
            apiErrors: number;
            generatedAt: Date;
        };
    }>;
}
