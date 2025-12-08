import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  async generateImage(prompt: string): Promise<string> {
    // Return placeholder URL for now
    return 'https://via.placeholder.com/800x400.png?text=' + encodeURIComponent(prompt.substring(0, 20));
  }
}
