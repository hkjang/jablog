import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as googleTrends from 'google-trends-api';

@Injectable()
export class TopicsService {
  private readonly logger = new Logger(TopicsService.name);

  constructor(private prisma: PrismaService) {}

  async discoverTopics() {
    this.logger.log('Starting topic discovery...');
    try {
      // Fetch daily trends for KR
      const result = await googleTrends.dailyTrends({ geo: 'KR' });
      const parsed = JSON.parse(result);
      
      const days = parsed.default.trendingSearchesDays || [];
      if (days.length === 0) return { success: true, count: 0 };

      const trendingSearches = days[0].trendingSearches || [];
      
      for (const item of trendingSearches) {
        const query = item.title.query;
        // formattedTraffic is like "10K+" or "2M+"
        // We will parse it simply.
        const traffic = item.formattedTraffic || '0'; 
        let score = parseInt(traffic.replace(/[^0-9]/g, '')) || 0;
        
        if (traffic.includes('K')) score *= 1000;
        if (traffic.includes('M')) score *= 1000000;

        await this.prisma.topic.upsert({
          where: { name: query },
          update: { score },
          create: { name: query, score },
        });
        this.logger.log(`Upserted topic: ${query} (Score: ${score})`);
      }
      return { success: true, count: trendingSearches.length };
    } catch (error) {
      this.logger.error('Error discovering topics', error);
      throw error;
    }
  }

  async getTopics() {
    return this.prisma.topic.findMany({
      orderBy: { score: 'desc' },
      take: 20,
    });
  }
}
