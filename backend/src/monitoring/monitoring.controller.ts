import { Controller, Get, Patch, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Platform } from '@prisma/client';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * GET /monitoring/api-errors
   * Get paginated API error logs
   */
  @Get('api-errors')
  async getApiErrors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platform') platform?: Platform,
    @Query('resolved') resolved?: string,
  ) {
    return this.monitoringService.getApiErrors(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      platform,
      resolved ? resolved === 'true' : undefined,
    );
  }

  /**
   * GET /monitoring/api-errors/stats
   * Get API error statistics
   */
  @Get('api-errors/stats')
  async getApiErrorStats() {
    return this.monitoringService.getApiErrorStats();
  }

  /**
   * PATCH /monitoring/api-errors/:id/resolve
   * Mark an error as resolved
   */
  @Patch('api-errors/:id/resolve')
  async resolveError(@Param('id', ParseIntPipe) id: number) {
    return this.monitoringService.resolveError(id);
  }
}
