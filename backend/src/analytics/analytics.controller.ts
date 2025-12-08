import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/traffic
   * Returns traffic analytics with optional date range
   */
  @Get('traffic')
  async getTrafficAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getTrafficAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * GET /analytics/topics-comparison
   * Returns performance comparison between topics
   */
  @Get('topics-comparison')
  async getTopicsComparison() {
    return this.analyticsService.getTopicsComparison();
  }

  /**
   * GET /analytics/platforms
   * Returns performance comparison between platforms (Tistory/WordPress)
   */
  @Get('platforms')
  async getPlatformComparison() {
    return this.analyticsService.getPlatformComparison();
  }
}
