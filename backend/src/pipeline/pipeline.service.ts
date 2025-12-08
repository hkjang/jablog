import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus, Platform } from '@prisma/client';

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get pipeline status - content count by status
   */
  async getPipelineStatus() {
    const statusCounts = await this.prisma.content.groupBy({
      by: ['status'],
      _count: true
    });

    // Get contents for each status with recent ones first
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

    // Identify bottlenecks
    const bottlenecks: string[] = [];
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

  private async getContentsByStatus(status: ContentStatus, limit: number) {
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

  /**
   * Create new content
   */
  async createContent(data: {
    title: string;
    body: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    status?: ContentStatus;
    platform?: Platform;
    authorId?: number;
  }) {
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

    // Log creation if authorId is provided
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

  /**
   * Get content by ID with full details
   */
  async getContentById(id: number) {
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

  /**
   * Update content status (for Kanban drag-drop)
   */
  async updateContentStatus(contentId: number, newStatus: ContentStatus, userId?: number) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: { status: true }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    const oldStatus = content.status;

    // Update content status
    const updated = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // Log the status change
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

  /**
   * Update content details
   */
  async updateContent(
    contentId: number,
    data: {
      title?: string;
      body?: string;
      excerpt?: string;
      metaTitle?: string;
      metaDescription?: string;
      status?: ContentStatus;
      platform?: Platform;
      userId?: number;
    }
  ) {
    const existingContent = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!existingContent) {
      throw new Error('Content not found');
    }

    const { userId, ...updateData } = data;

    // Update content
    const updated = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Log the edit if userId is provided
    if (userId) {
      const changedFields = Object.keys(updateData).filter(
        key => updateData[key as keyof typeof updateData] !== undefined
      );
      
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

  /**
   * Delete content
   */
  async deleteContent(contentId: number) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Delete related records first
    await this.prisma.editHistory.deleteMany({
      where: { contentId }
    });

    await this.prisma.publishingLog.deleteMany({
      where: { contentId }
    });

    await this.prisma.scheduledPost.deleteMany({
      where: { contentId }
    });

    // Delete the content
    await this.prisma.content.delete({
      where: { id: contentId }
    });

    return { success: true, message: 'Content deleted successfully' };
  }

  /**
   * Get content with filters for search
   */
  async searchContents(filters: {
    query?: string;
    status?: ContentStatus;
    authorId?: number;
    topicId?: number;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    page?: number;
    limit?: number;
  }) {
    const { 
      query, status, authorId, topicId, 
      startDate, endDate, 
      page = 1, limit = 20 
    } = filters;

    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (topicId) where.topicId = topicId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
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
}
