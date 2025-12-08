"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ScheduleService = class ScheduleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCalendar(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const scheduledPosts = await this.prisma.scheduledPost.findMany({
            where: {
                scheduledFor: { gte: startDate, lte: endDate }
            },
            include: {
                content: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        author: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { scheduledFor: 'asc' }
        });
        const calendar = {};
        scheduledPosts.forEach(post => {
            const dateKey = post.scheduledFor.toISOString().split('T')[0];
            if (!calendar[dateKey]) {
                calendar[dateKey] = [];
            }
            calendar[dateKey].push({
                id: post.id,
                contentId: post.contentId,
                title: post.content.title,
                platform: post.platform,
                scheduledFor: post.scheduledFor,
                status: post.status,
                author: post.content.author
            });
        });
        return {
            year,
            month,
            startDate,
            endDate,
            events: calendar,
            totalScheduled: scheduledPosts.length
        };
    }
    async getWeeklyCalendar(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        const scheduledPosts = await this.prisma.scheduledPost.findMany({
            where: {
                scheduledFor: { gte: startDate, lt: endDate }
            },
            include: {
                content: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        platform: true
                    }
                }
            },
            orderBy: { scheduledFor: 'asc' }
        });
        return {
            startDate,
            endDate,
            events: scheduledPosts.map(post => ({
                id: post.id,
                contentId: post.contentId,
                title: post.content.title,
                platform: post.platform,
                scheduledFor: post.scheduledFor,
                status: post.status
            }))
        };
    }
    async updateScheduledTime(scheduleId, newTime) {
        return this.prisma.scheduledPost.update({
            where: { id: scheduleId },
            data: {
                scheduledFor: newTime,
                updatedAt: new Date()
            },
            include: {
                content: { select: { title: true } }
            }
        });
    }
    async createScheduledPost(contentId, platform, scheduledFor) {
        await this.prisma.content.update({
            where: { id: contentId },
            data: { status: 'SCHEDULED' }
        });
        return this.prisma.scheduledPost.create({
            data: {
                contentId,
                platform,
                scheduledFor,
                status: 'PENDING'
            },
            include: {
                content: { select: { title: true } }
            }
        });
    }
    async cancelScheduledPost(scheduleId) {
        const schedule = await this.prisma.scheduledPost.findUnique({
            where: { id: scheduleId }
        });
        if (!schedule) {
            throw new Error('Scheduled post not found');
        }
        await this.prisma.content.update({
            where: { id: schedule.contentId },
            data: { status: 'APPROVED' }
        });
        return this.prisma.scheduledPost.delete({
            where: { id: scheduleId }
        });
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map