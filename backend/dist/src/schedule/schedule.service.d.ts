import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';
export declare class ScheduleService {
    private prisma;
    constructor(prisma: PrismaService);
    getCalendar(year: number, month: number): Promise<{
        year: number;
        month: number;
        startDate: Date;
        endDate: Date;
        events: Record<string, any[]>;
        totalScheduled: number;
    }>;
    getWeeklyCalendar(startDate: Date): Promise<{
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
    updateScheduledTime(scheduleId: number, newTime: Date): Promise<{
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
    createScheduledPost(contentId: number, platform: Platform, scheduledFor: Date): Promise<{
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
    cancelScheduledPost(scheduleId: number): Promise<{
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
