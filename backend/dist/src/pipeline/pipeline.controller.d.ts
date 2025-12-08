import { PipelineService } from './pipeline.service';
import { ContentStatus, Platform } from '@prisma/client';
interface CreateContentDto {
    title: string;
    body: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    status?: ContentStatus;
    platform?: Platform;
    authorId?: number;
}
interface UpdateContentDto {
    title?: string;
    body?: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    status?: ContentStatus;
    platform?: Platform;
    userId?: number;
}
export declare class PipelineController {
    private readonly pipelineService;
    constructor(pipelineService: PipelineService);
    getPipelineStatus(): Promise<{
        pipeline: {
            DRAFT: {
                count: number;
                items: {
                    id: number;
                    title: string;
                    status: import("@prisma/client").$Enums.ContentStatus;
                    platform: import("@prisma/client").$Enums.Platform;
                    seoScore: number;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: number;
                        name: string;
                    } | null;
                }[];
            };
            REVIEW: {
                count: number;
                items: {
                    id: number;
                    title: string;
                    status: import("@prisma/client").$Enums.ContentStatus;
                    platform: import("@prisma/client").$Enums.Platform;
                    seoScore: number;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: number;
                        name: string;
                    } | null;
                }[];
            };
            APPROVED: {
                count: number;
                items: {
                    id: number;
                    title: string;
                    status: import("@prisma/client").$Enums.ContentStatus;
                    platform: import("@prisma/client").$Enums.Platform;
                    seoScore: number;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: number;
                        name: string;
                    } | null;
                }[];
            };
            SCHEDULED: {
                count: number;
                items: {
                    id: number;
                    title: string;
                    status: import("@prisma/client").$Enums.ContentStatus;
                    platform: import("@prisma/client").$Enums.Platform;
                    seoScore: number;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: number;
                        name: string;
                    } | null;
                }[];
            };
            PUBLISHED: {
                count: number;
                items: {
                    id: number;
                    title: string;
                    status: import("@prisma/client").$Enums.ContentStatus;
                    platform: import("@prisma/client").$Enums.Platform;
                    seoScore: number;
                    createdAt: Date;
                    updatedAt: Date;
                    author: {
                        id: number;
                        name: string;
                    } | null;
                }[];
            };
        };
        bottlenecks: string[];
        totalContents: number;
    }>;
    createContent(body: CreateContentDto): Promise<{
        author: {
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        title: string;
        body: string;
        excerpt: string | null;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ContentStatus;
        platform: import("@prisma/client").$Enums.Platform;
        authorId: number | null;
        topicId: number | null;
        seoScore: number;
        seoIssues: string[];
        metaTitle: string | null;
        metaDescription: string | null;
        views: number;
        clicks: number;
        avgTimeOnPage: number;
        bounceRate: number;
        similarityHash: string | null;
        isDuplicate: boolean;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date | null;
    }>;
    getContentById(id: number): Promise<{
        author: {
            id: number;
            email: string;
            name: string;
        } | null;
        topic: {
            id: number;
            name: string;
        } | null;
        keywords: {
            id: number;
            text: string;
        }[];
        editHistory: ({
            user: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            contentId: number;
            userId: number;
            action: string;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
        })[];
        publishingLogs: {
            error: string | null;
            id: number;
            status: string;
            platform: import("@prisma/client").$Enums.Platform;
            createdAt: Date;
            contentId: number;
            externalId: string | null;
            externalUrl: string | null;
            retryCount: number;
            responseData: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        scheduledPosts: {
            error: string | null;
            id: number;
            status: string;
            platform: import("@prisma/client").$Enums.Platform;
            createdAt: Date;
            updatedAt: Date;
            scheduledFor: Date;
            contentId: number;
            retryCount: number;
        }[];
    } & {
        id: number;
        title: string;
        body: string;
        excerpt: string | null;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ContentStatus;
        platform: import("@prisma/client").$Enums.Platform;
        authorId: number | null;
        topicId: number | null;
        seoScore: number;
        seoIssues: string[];
        metaTitle: string | null;
        metaDescription: string | null;
        views: number;
        clicks: number;
        avgTimeOnPage: number;
        bounceRate: number;
        similarityHash: string | null;
        isDuplicate: boolean;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date | null;
    }>;
    updateContent(id: number, body: UpdateContentDto): Promise<{
        id: number;
        title: string;
        body: string;
        excerpt: string | null;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ContentStatus;
        platform: import("@prisma/client").$Enums.Platform;
        authorId: number | null;
        topicId: number | null;
        seoScore: number;
        seoIssues: string[];
        metaTitle: string | null;
        metaDescription: string | null;
        views: number;
        clicks: number;
        avgTimeOnPage: number;
        bounceRate: number;
        similarityHash: string | null;
        isDuplicate: boolean;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date | null;
    }>;
    deleteContent(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    updateContentStatus(id: number, body: {
        status: ContentStatus;
        userId?: number;
    }): Promise<{
        id: number;
        title: string;
        body: string;
        excerpt: string | null;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ContentStatus;
        platform: import("@prisma/client").$Enums.Platform;
        authorId: number | null;
        topicId: number | null;
        seoScore: number;
        seoIssues: string[];
        metaTitle: string | null;
        metaDescription: string | null;
        views: number;
        clicks: number;
        avgTimeOnPage: number;
        bounceRate: number;
        similarityHash: string | null;
        isDuplicate: boolean;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date | null;
    }>;
    searchContents(query?: string, status?: ContentStatus, authorId?: string, topicId?: string, startDate?: string, endDate?: string, page?: string, limit?: string): Promise<{
        contents: ({
            author: {
                id: number;
                name: string;
            } | null;
            topic: {
                id: number;
                name: string;
            } | null;
            keywords: {
                id: number;
                text: string;
            }[];
        } & {
            id: number;
            title: string;
            body: string;
            excerpt: string | null;
            imageUrl: string | null;
            status: import("@prisma/client").$Enums.ContentStatus;
            platform: import("@prisma/client").$Enums.Platform;
            authorId: number | null;
            topicId: number | null;
            seoScore: number;
            seoIssues: string[];
            metaTitle: string | null;
            metaDescription: string | null;
            views: number;
            clicks: number;
            avgTimeOnPage: number;
            bounceRate: number;
            similarityHash: string | null;
            isDuplicate: boolean;
            createdAt: Date;
            updatedAt: Date;
            publishedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
export {};
