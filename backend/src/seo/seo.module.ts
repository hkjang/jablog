import { Module } from '@nestjs/common';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';

@Module({
  providers: [SeoService],
  controllers: [SeoController]
})
export class SeoModule {}
