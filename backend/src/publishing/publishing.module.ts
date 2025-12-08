import { Module } from '@nestjs/common';
import { WordpressService } from './wordpress.service';
import { TistoryService } from './tistory.service';
import { PublishingService } from './publishing.service';

@Module({
  providers: [PublishingService, WordpressService, TistoryService],
  exports: [PublishingService],
})
export class PublishingModule {}
