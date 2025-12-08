import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get calendar data for a date range
   */
  async getCalendar(year: number, month: number) {
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

    // Group by date
    const calendar: Record<string, any[]> = {};
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

  /**
   * Get weekly calendar
   */
  async getWeeklyCalendar(startDate: Date) {
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

  /**
   * Update scheduled post time (for drag-drop)
   */
  async updateScheduledTime(scheduleId: number, newTime: Date) {
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

  /**
   * Create a new scheduled post
   */
  async createScheduledPost(contentId: number, platform: Platform, scheduledFor: Date) {
    // Update content status to SCHEDULED
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

  /**
   * Cancel a scheduled post
   */
  async cancelScheduledPost(scheduleId: number) {
    const schedule = await this.prisma.scheduledPost.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      throw new Error('Scheduled post not found');
    }

    // Revert content status to APPROVED
    await this.prisma.content.update({
      where: { id: schedule.contentId },
      data: { status: 'APPROVED' }
    });

    return this.prisma.scheduledPost.delete({
      where: { id: scheduleId }
    });
  }
}
