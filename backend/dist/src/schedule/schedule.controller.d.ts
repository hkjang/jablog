import { ScheduleService } from './schedule.service';
import { Platform } from '@prisma/client';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    getCalendar(year?: string, month?: string): Promise<{
        year: number;
        month: number;
        startDate: Date;
        endDate: Date;
        events: Record<string, any[]>;
        totalScheduled: number;
    }>;
    getWeeklyCalendar(startDate?: string): Promise<{
        startDate: Date;
        endDate: Date;
        events: {
            id: number;
            contentId: number;
            title: string;
            platform: import("@prisma/client").$Enums.Platform;
            scheduledFor: Date;
            status: string;
        }[];
    }>;
    updateScheduledTime(id: number, body: {
        scheduledFor: string;
    }): Promise<{
        content: {
            title: string;
        };
    } & {
        error: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        platform: import("@prisma/client").$Enums.Platform;
        contentId: number;
        scheduledFor: Date;
        retryCount: number;
    }>;
    createScheduledPost(body: {
        contentId: number;
        platform: Platform;
        scheduledFor: string;
    }): Promise<{
        content: {
            title: string;
        };
    } & {
        error: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        platform: import("@prisma/client").$Enums.Platform;
        contentId: number;
        scheduledFor: Date;
        retryCount: number;
    }>;
    cancelScheduledPost(id: number): Promise<{
        error: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        platform: import("@prisma/client").$Enums.Platform;
        contentId: number;
        scheduledFor: Date;
        retryCount: number;
    }>;
}
