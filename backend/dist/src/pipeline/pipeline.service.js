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
exports.PipelineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PipelineService = class PipelineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPipelineStatus() {
        const statusCounts = await this.prisma.content.groupBy({
            by: ['status'],
            _count: true
        });
        const contentsByStatus = await Promise.all([
            this.getContentsByStatus('DRAFT', 10),
            this.getContentsByStatus('REVIEW', 10),
            this.getContentsByStatus('APPROVED', 10),
            this.getContentsByStatus('SCHEDULED', 10),
            this.getContentsByStatus('PUBLISHED', 10),
        ]);
        const pipeline = {
            DRAFT: {
                count: statusCounts.find(s => s.status === 'DRAFT')?._count || 0,
                items: contentsByStatus[0]
            },
            REVIEW: {
                count: statusCounts.find(s => s.status === 'REVIEW')?._count || 0,
                items: contentsByStatus[1]
            },
            APPROVED: {
                count: statusCounts.find(s => s.status === 'APPROVED')?._count || 0,
                items: contentsByStatus[2]
            },
            SCHEDULED: {
                count: statusCounts.find(s => s.status === 'SCHEDULED')?._count || 0,
                items: contentsByStatus[3]
            },
            PUBLISHED: {
                count: statusCounts.find(s => s.status === 'PUBLISHED')?._count || 0,
                items: contentsByStatus[4]
            }
        };
        const bottlenecks = [];
        if (pipeline.DRAFT.count > 10) {
            bottlenecks.push('초안 단계에 많은 콘텐츠가 쌓여있습니다');
        }
        if (pipeline.REVIEW.count > 5) {
            bottlenecks.push('검수 대기 중인 콘텐츠가 많습니다');
        }
        return {
            pipeline,
            bottlenecks,
            totalContents: statusCounts.reduce((sum, s) => sum + s._count, 0)
        };
    }
    async getContentsByStatus(status, limit) {
        return this.prisma.content.findMany({
            where: { status },
            select: {
                id: true,
                title: true,
                status: true,
                platform: true,
                seoScore: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: limit
        });
    }
    async createContent(data) {
        const content = await this.prisma.content.create({
            data: {
                title: data.title,
                body: data.body,
                excerpt: data.excerpt,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                status: data.status || 'DRAFT',
                platform: data.platform || 'TISTORY',
                authorId: data.authorId,
                seoScore: 0,
                views: 0,
                clicks: 0,
                avgTimeOnPage: 0,
                bounceRate: 0,
            },
            include: {
                author: { select: { id: true, name: true } },
            }
        });
        if (data.authorId) {
            await this.prisma.editHistory.create({
                data: {
                    contentId: content.id,
                    userId: data.authorId,
                    action: 'CREATE',
                    field: null,
                    oldValue: null,
                    newValue: null,
                }
            });
        }
        return content;
    }
    async getContentById(id) {
        const content = await this.prisma.content.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, email: true } },
                topic: { select: { id: true, name: true } },
                keywords: { select: { id: true, text: true } },
                editHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                },
                publishingLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                scheduledPosts: {
                    where: { status: 'PENDING' },
                    orderBy: { scheduledFor: 'asc' }
                }
            }
        });
        if (!content) {
            throw new Error('Content not found');
        }
        return content;
    }
    async updateContentStatus(contentId, newStatus, userId) {
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            select: { status: true }
        });
        if (!content) {
            throw new Error('Content not found');
        }
        const oldStatus = content.status;
        const updated = await this.prisma.content.update({
            where: { id: contentId },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        });
        if (userId) {
            await this.prisma.editHistory.create({
                data: {
                    contentId,
                    userId,
                    action: 'STATUS_CHANGE',
                    field: 'status',
                    oldValue: oldStatus,
                    newValue: newStatus
                }
            });
        }
        return updated;
    }
    async updateContent(contentId, data) {
        const existingContent = await this.prisma.content.findUnique({
            where: { id: contentId }
        });
        if (!existingContent) {
            throw new Error('Content not found');
        }
        const { userId, ...updateData } = data;
        const updated = await this.prisma.content.update({
            where: { id: contentId },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });
        if (userId) {
            const changedFields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
            await this.prisma.editHistory.create({
                data: {
                    contentId,
                    userId,
                    action: 'CONTENT_UPDATE',
                    field: changedFields.join(', '),
                    oldValue: null,
                    newValue: null
                }
            });
        }
        return updated;
    }
    async deleteContent(contentId) {
        const content = await this.prisma.content.findUnique({
            where: { id: contentId }
        });
        if (!content) {
            throw new Error('Content not found');
        }
        await this.prisma.editHistory.deleteMany({
            where: { contentId }
        });
        await this.prisma.publishingLog.deleteMany({
            where: { contentId }
        });
        await this.prisma.scheduledPost.deleteMany({
            where: { contentId }
        });
        await this.prisma.content.delete({
            where: { id: contentId }
        });
        return { success: true, message: 'Content deleted successfully' };
    }
    async searchContents(filters) {
        const { query, status, authorId, topicId, startDate, endDate, page = 1, limit = 20 } = filters;
        const where = {};
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { body: { contains: query, mode: 'insensitive' } }
            ];
        }
        if (status)
            where.status = status;
        if (authorId)
            where.authorId = authorId;
        if (topicId)
            where.topicId = topicId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [contents, total] = await Promise.all([
            this.prisma.content.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true } },
                    topic: { select: { id: true, name: true } },
                    keywords: { select: { id: true, text: true } }
                },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            this.prisma.content.count({ where })
        ]);
        return {
            contents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map