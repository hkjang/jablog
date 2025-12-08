import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { LlmService } from './llm/llm.service';
import { OllamaService } from './llm/ollama.service';
import { OpenAiService } from './llm/openai.service';
import { ImageService } from './image/image.service';
import { DuplicateService } from './duplicate.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    ContentService,
    ImageService,
    DuplicateService,
    OllamaService,
    OpenAiService,
    {
      provide: LlmService,
      useFactory: (ollama: OllamaService, openai: OpenAiService) => {
        const provider = process.env.LLM_PROVIDER || 'ollama';
        return provider === 'openai' ? openai : ollama;
      },
      inject: [OllamaService, OpenAiService],
    },
  ],
  exports: [ContentService, ImageService, DuplicateService],
})
export class ContentModule {}

