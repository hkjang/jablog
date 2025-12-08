import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
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

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  /**
   * GET /pipeline/status
   * Returns content counts by status for Kanban board
   */
  @Get('status')
  async getPipelineStatus() {
    return this.pipelineService.getPipelineStatus();
  }

  /**
   * POST /pipeline/content
   * Create new content
   */
  @Post('content')
  async createContent(@Body() body: CreateContentDto) {
    return this.pipelineService.createContent(body);
  }

  /**
   * GET /pipeline/content/:id
   * Get content detail by ID
   */
  @Get('content/:id')
  async getContentById(@Param('id', ParseIntPipe) id: number) {
    return this.pipelineService.getContentById(id);
  }

  /**
   * PUT /pipeline/content/:id
   * Update content details
   */
  @Put('content/:id')
  async updateContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateContentDto,
  ) {
    return this.pipelineService.updateContent(id, body);
  }

  /**
   * DELETE /pipeline/content/:id
   * Delete content
   */
  @Delete('content/:id')
  async deleteContent(@Param('id', ParseIntPipe) id: number) {
    return this.pipelineService.deleteContent(id);
  }

  /**
   * PATCH /pipeline/content/:id/status
   * Update content status (Kanban drag-drop)
   */
  @Patch('content/:id/status')
  async updateContentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ContentStatus; userId?: number },
  ) {
    return this.pipelineService.updateContentStatus(id, body.status, body.userId);
  }

  /**
   * GET /pipeline/search
   * Search contents with filters
   */
  @Get('search')
  async searchContents(
    @Query('query') query?: string,
    @Query('status') status?: ContentStatus,
    @Query('authorId') authorId?: string,
    @Query('topicId') topicId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pipelineService.searchContents({
      query,
      status,
      authorId: authorId ? parseInt(authorId) : undefined,
      topicId: topicId ? parseInt(topicId) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
