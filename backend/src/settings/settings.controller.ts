import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpCode } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Platform } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ============================================
  // Platform Credentials
  // ============================================

  /**
   * GET /settings/platform-credentials
   * Get all platform credentials for a user
   */
  @Get('platform-credentials')
  async getPlatformCredentials(@Query('userId', ParseIntPipe) userId: number) {
    return this.settingsService.getPlatformCredentials(userId);
  }

  /**
   * GET /settings/platform-credentials/:id
   * Get specific platform credential
   */
  @Get('platform-credentials/:id')
  async getPlatformCredential(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.getPlatformCredential(id);
  }

  /**
   * POST /settings/platform-credentials
   * Create new platform credential
   */
  @Post('platform-credentials')
  async createPlatformCredential(
    @Body() data: {
      userId: number;
      platform: Platform;
      name: string;
      blogName?: string;
      accessToken?: string;
      apiKey?: string;
      username?: string;
      appPassword?: string;
      siteUrl?: string;
    },
  ) {
    return this.settingsService.createPlatformCredential(data);
  }

  /**
   * PUT /settings/platform-credentials/:id
   * Update platform credential
   */
  @Put('platform-credentials/:id')
  async updatePlatformCredential(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      name?: string;
      blogName?: string;
      accessToken?: string;
      apiKey?: string;
      username?: string;
      appPassword?: string;
      siteUrl?: string;
      isActive?: boolean;
    },
  ) {
    return this.settingsService.updatePlatformCredential(id, data);
  }

  /**
   * DELETE /settings/platform-credentials/:id
   * Delete platform credential
   */
  @Delete('platform-credentials/:id')
  @HttpCode(204)
  async deletePlatformCredential(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.deletePlatformCredential(id);
  }

  /**
   * POST /settings/platform-credentials/:id/test
   * Test platform connection
   */
  @Post('platform-credentials/:id/test')
  async testPlatformConnection(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.testPlatformConnection(id);
  }

  // ============================================
  // AI Settings
  // ============================================

  /**
   * GET /settings/ai?userId=
   * Get AI settings for a user
   */
  @Get('ai')
  async getAiSettings(@Query('userId', ParseIntPipe) userId: number) {
    return this.settingsService.getAiSettings(userId);
  }

  /**
   * PUT /settings/ai
   * Update AI settings
   */
  @Put('ai')
  async updateAiSettings(
    @Body() data: {
      userId: number;
      provider?: string;
      model?: string;
      apiKey?: string;
      apiUrl?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      contentPrompt?: string;
      titlePrompt?: string;
      autoSeoOptimize?: boolean;
      autoTranslate?: boolean;
    },
  ) {
    return this.settingsService.updateAiSettings(data.userId, data);
  }

  /**
   * DELETE /settings/ai
   * Reset AI settings to defaults
   */
  @Delete('ai')
  async resetAiSettings(@Query('userId', ParseIntPipe) userId: number) {
    return this.settingsService.resetAiSettings(userId);
  }
}
