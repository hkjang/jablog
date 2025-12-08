import type { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReports(page?: string, limit?: string): Promise<{
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
    downloadReport(id: number, res: Response): Promise<Response<any, Record<string, any>>>;
}
