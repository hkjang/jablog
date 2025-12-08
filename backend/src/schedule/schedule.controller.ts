import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Platform } from '@prisma/client';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * GET /schedule/calendar
   * Get monthly calendar data
   */
  @Get('calendar')
  async getCalendar(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    return this.scheduleService.getCalendar(
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }

  /**
   * GET /schedule/calendar/weekly
   * Get weekly calendar data
   */
  @Get('calendar/weekly')
  async getWeeklyCalendar(@Query('startDate') startDate?: string) {
    return this.scheduleService.getWeeklyCalendar(
      startDate ? new Date(startDate) : new Date(),
    );
  }

  /**
   * PATCH /schedule/:id
   * Update scheduled post time
   */
  @Patch(':id')
  async updateScheduledTime(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { scheduledFor: string },
  ) {
    return this.scheduleService.updateScheduledTime(id, new Date(body.scheduledFor));
  }

  /**
   * POST /schedule
   * Create a new scheduled post
   */
  @Post()
  async createScheduledPost(
    @Body() body: { contentId: number; platform: Platform; scheduledFor: string },
  ) {
    return this.scheduleService.createScheduledPost(
      body.contentId,
      body.platform,
      new Date(body.scheduledFor),
    );
  }

  /**
   * DELETE /schedule/:id
   * Cancel a scheduled post
   */
  @Delete(':id')
  async cancelScheduledPost(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.cancelScheduledPost(id);
  }
}
