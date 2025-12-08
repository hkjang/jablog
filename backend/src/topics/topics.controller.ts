import { Controller, Post, Get } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post('discover')
  async discover() {
    return this.topicsService.discoverTopics();
  }

  @Get()
  async findAll() {
    return this.topicsService.getTopics();
  }
}
