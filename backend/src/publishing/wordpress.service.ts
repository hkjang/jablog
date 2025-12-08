import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WordpressService {
  private readonly logger = new Logger(WordpressService.name);
  private readonly baseUrl = process.env.WORDPRESS_URL; 
  private readonly username = process.env.WORDPRESS_USERNAME;
  private readonly password = process.env.WORDPRESS_APP_PASSWORD;

  async createPost(title: string, content: string, status = 'draft') {
    if (!this.baseUrl) {
        this.logger.warn('WordPress config missing');
        return null;
    }

    this.logger.log(`Publishing to WordPress: ${title}`);
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    
    try {
        const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                title,
                content,
                status
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`WordPress API Error: ${err}`);
        }

        const data = await response.json();
        return {
            platform: 'wordpress',
            id: data.id,
            url: data.link
        };
    } catch (e) {
        this.logger.error('WordPress publishing failed', e);
        throw e;
    }
  }
}
