import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class DuplicateService {
  private readonly logger = new Logger(DuplicateService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate similarity hash for content
   * Uses a simple bag-of-words approach with normalized text
   */
  calculateContentHash(text: string): string {
    // Normalize text: lowercase, remove special chars, collapse whitespace
    const normalized = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Create hash from normalized text
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Calculate similarity between two texts (Jaccard similarity)
   */
  calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Check if content is duplicate
   * Returns similar content if found
   */
  async checkDuplicate(title: string, body: string, excludeId?: number): Promise<{
    isDuplicate: boolean;
    similarContent: Array<{ id: number; title: string; similarity: number }>;
  }> {
    const contentHash = this.calculateContentHash(body);

    // First, check for exact hash match
    const exactMatch = await this.prisma.content.findFirst({
      where: {
        similarityHash: contentHash,
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: { id: true, title: true },
    });

    if (exactMatch) {
      return {
        isDuplicate: true,
        similarContent: [{ id: exactMatch.id, title: exactMatch.title, similarity: 1.0 }],
      };
    }

    // Check for similar content by comparing titles and bodies
    const recentContents = await this.prisma.content.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: { id: true, title: true, body: true },
      orderBy: { createdAt: 'desc' },
      take: 100, // Check against recent 100 contents
    });

    const similarContent: Array<{ id: number; title: string; similarity: number }> = [];
    const threshold = 0.7; // 70% similarity threshold

    for (const content of recentContents) {
      const titleSimilarity = this.calculateSimilarity(title, content.title);
      const bodySimilarity = this.calculateSimilarity(body, content.body);
      
      // Weight body similarity more than title
      const combinedSimilarity = titleSimilarity * 0.3 + bodySimilarity * 0.7;

      if (combinedSimilarity >= threshold) {
        similarContent.push({
          id: content.id,
          title: content.title,
          similarity: Math.round(combinedSimilarity * 100) / 100,
        });
      }
    }

    // Sort by similarity descending
    similarContent.sort((a, b) => b.similarity - a.similarity);

    return {
      isDuplicate: similarContent.length > 0 && similarContent[0].similarity >= 0.9,
      similarContent: similarContent.slice(0, 5), // Return top 5
    };
  }

  /**
   * Update content with similarity hash
   */
  async updateContentHash(contentId: number, body: string): Promise<void> {
    const hash = this.calculateContentHash(body);
    await this.prisma.content.update({
      where: { id: contentId },
      data: { 
        similarityHash: hash,
        isDuplicate: false,
      },
    });
  }

  /**
   * Mark content as duplicate
   */
  async markAsDuplicate(contentId: number): Promise<void> {
    await this.prisma.content.update({
      where: { id: contentId },
      data: { isDuplicate: true },
    });
  }
}
