import { Controller, Post, Body } from '@nestjs/common';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post('analyze')
  analyze(@Body('content') content: string) {
    return this.seoService.analyzeContent(content);
  }
}
