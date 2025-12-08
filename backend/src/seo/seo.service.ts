import { Injectable } from '@nestjs/common';

@Injectable()
export class SeoService {
  analyzeContent(content: string) {
    // Basic SEO checks
    const wordCount = content.split(/\s+/).length;
    const issues: string[] = [];
    if (wordCount < 300) issues.push('Content too short (under 300 words).');
    if (!content.includes('# ')) issues.push('Missing H1 title.');

    return { 
        score: Math.max(0, 100 - (issues.length * 20)), 
        issues 
    };
  }
}
