import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/summary
   * Returns dashboard summary with metrics, alerts, and scheduled posts
   */
  @Get('summary')
  async getSummary(@Query('userId') userId?: string) {
    return this.dashboardService.getSummary(userId ? parseInt(userId) : undefined);
  }

  /**
   * GET /dashboard/recommendations
   * Returns AI recommendations for keywords, improvements, and actions
   */
  @Get('recommendations')
  async getRecommendations() {
    return this.dashboardService.getRecommendations();
  }
}
