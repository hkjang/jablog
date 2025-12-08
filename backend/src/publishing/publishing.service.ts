import { Injectable } from '@nestjs/common';
import { WordpressService } from './wordpress.service';
import { TistoryService } from './tistory.service';

@Injectable()
export class PublishingService {
  constructor(
      private wpService: WordpressService,
      private tistoryService: TistoryService
  ) {}

  async publishToAll(title: string, content: string) {
    const results: any[] = [];
    // Could be parallel
    try {
        const wp = await this.wpService.createPost(title, content);
        if (wp) results.push(wp);
    } catch (e) { console.error(e); }

    try {
        const tistory = await this.tistoryService.createPost(title, content);
        if (tistory) results.push(tistory);
    } catch (e) { console.error(e); }

    return results;
  }
}
