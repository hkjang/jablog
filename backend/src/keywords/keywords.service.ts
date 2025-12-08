import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as googleTrends from 'google-trends-api';

@Injectable()
export class KeywordsService {
  private readonly logger = new Logger(KeywordsService.name);

  constructor(private prisma: PrismaService) {}

  async generateKeywordsForTopic(topicName: string) {
    this.logger.log(`Generating keywords for topic: ${topicName}`);
    
    // Find topic by name first to ensure it exists or create it? 
    // Usually we expect topicId. But let's support by name or finding topic first.
    // For now, let's assume we pass topicId in controller. 
    // But let's keep this method flexible.
    return { error: 'Use generateKeywordsForTopicById' };
  }

  async generateKeywordsForTopicById(topicId: number) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic not found');

    try {
        const result = await googleTrends.relatedQueries({ keyword: topic.name, geo: 'KR' });
        const parsed = JSON.parse(result);

        const rankedLists = parsed.default?.rankedList || [];
        let count = 0;
        
        for (const list of rankedLists) {
             const keywords = list.rankedKeyword || [];
             for (const kw of keywords) {
                 const text = kw.query;
                 const value = kw.value; 
                 // value can be number (volume) or string ("Breakout")
                 
                 let volume = 0;
                 if (typeof value === 'number') volume = value;
                 // if "Breakout", value is huge.

                 await this.prisma.keyword.create({
                     data: {
                         text,
                         volume,
                         topicId: topic.id,
                     }
                 });
                 count++;
             }
        }
        this.logger.log(`Generated ${count} keywords for topic ${topic.name}`);
        return { success: true, count };
    } catch (e) {
        this.logger.error('Error generating keywords', e);
        throw e;
    }
  }

  async getKeywords(topicId: number) {
      return this.prisma.keyword.findMany({ where: { topicId } });
  }
}
