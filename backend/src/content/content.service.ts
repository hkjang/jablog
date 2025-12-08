import { Injectable } from '@nestjs/common';
import { LlmService } from './llm/llm.service';

import { ImageService } from './image/image.service';

@Injectable()
export class ContentService {
  constructor(
      private llmService: LlmService,
      private imageService: ImageService
  ) {}

  async createDraft(topic: string, keywords: string[]) {
    const prompt = `
    Write a blog post about "${topic}".
    Target Audience: General.
    Keywords: ${keywords.join(', ')}.
    Include: Title, Introduction, Body with headings, Conclusion.
    Tone: Informative and Engaging.
    Format: Markdown.
    `;
    
    const [content, imageUrl] = await Promise.all([
        this.llmService.generate(prompt),
        this.imageService.generateImage(topic)
    ]);

    return {
      topic,
      content,
      imageUrl,
      createdAt: new Date(),
      status: 'DRAFT',
    };
  }
}
