import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * GET /ai/coach
   * Get AI coach feedback and recommendations
   */
  @Get('coach')
  async getCoachFeedback(@Query('userId') userId?: string) {
    return this.aiService.getCoachFeedback(userId ? parseInt(userId) : undefined);
  }

  /**
   * GET /ai/suggestions/:contentId
   * Get improvement suggestions for specific content
   */
  @Get('suggestions/:contentId')
  async getImprovementSuggestions(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.aiService.getImprovementSuggestions(contentId);
  }
}
