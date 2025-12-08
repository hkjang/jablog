import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Post('generate/:topicId')
  async generate(@Param('topicId', ParseIntPipe) topicId: number) {
    return this.keywordsService.generateKeywordsForTopicById(topicId);
  }

  @Get(':topicId')
  async findAll(@Param('topicId', ParseIntPipe) topicId: number) {
    return this.keywordsService.getKeywords(topicId);
  }
}
