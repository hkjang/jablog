import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TistoryService {
  private readonly logger = new Logger(TistoryService.name);
  private readonly accessToken = process.env.TISTORY_ACCESS_TOKEN;
  private readonly blogName = process.env.TISTORY_BLOG_NAME;

  async createPost(title: string, content: string, visibility = 0) {
    // visibility: 0 (private), 1 (protected), 3 (published)
    if (!this.accessToken || !this.blogName) {
        this.logger.warn('Tistory config missing');
        return null;
    }

    this.logger.log(`Publishing to Tistory: ${title}`);
    
    try {
        const formData = new URLSearchParams();
        formData.append('access_token', this.accessToken);
        formData.append('output', 'json');
        formData.append('blogName', this.blogName);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('visibility', visibility.toString());

        const response = await fetch('https://www.tistory.com/apis/post/write', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Tistory network error: ${response.status}`);
        }

        const data = await response.json();
        if (data.tistory.status !== '200') {
            throw new Error(`Tistory API Error: ${data.tistory.error_message}`);
        }

        return {
            platform: 'tistory',
            id: data.tistory.postId,
            url: data.tistory.url
        };
    } catch (e) {
        this.logger.error('Tistory publishing failed', e);
        throw e;
    }
  }
}
