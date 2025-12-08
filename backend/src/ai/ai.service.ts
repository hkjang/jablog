import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get AI coach feedback based on performance analysis
   */
  async getCoachFeedback(userId?: number) {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Compare this week vs last week
    const [thisWeekViews, lastWeekViews, lowPerformingContent, risingKeywords, failedPublishes] = await Promise.all([
      this.prisma.contentAnalytics.aggregate({
        where: { date: { gte: lastWeek } },
        _sum: { views: true }
      }),
      this.prisma.contentAnalytics.aggregate({
        where: { date: { gte: previousWeek, lt: lastWeek } },
        _sum: { views: true }
      }),
      this.prisma.content.findMany({
        where: {
          status: 'PUBLISHED',
          views: { lt: 100 }
        },
        select: { id: true, title: true, views: true, seoScore: true, seoIssues: true },
        orderBy: { publishedAt: 'desc' },
        take: 5
      }),
      this.prisma.keywordTrend.findMany({
        where: {
          trend: 'RISING',
          date: { gte: lastWeek }
        },
        include: { keyword: true },
        orderBy: { volume: 'desc' },
        take: 5
      }),
      this.prisma.publishingLog.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: lastWeek }
        }
      })
    ]);

    const currentViews = thisWeekViews._sum.views || 0;
    const previousViews = lastWeekViews._sum.views || 0;
    const viewsChange = previousViews > 0 
      ? ((currentViews - previousViews) / previousViews) * 100 
      : 0;

    // Generate AI insights
    const insights: string[] = [];
    const actions: { type: string; title: string; description: string; priority: 'high' | 'medium' | 'low' }[] = [];

    // Views trend analysis
    if (viewsChange < -10) {
      insights.push(`⚠️ 지난주 대비 조회수가 ${Math.abs(Math.round(viewsChange))}% 감소했습니다.`);
      actions.push({
        type: 'analyze',
        title: '조회수 하락 원인 분석',
        description: '최근 발행된 콘텐츠의 SEO 점수와 키워드 경쟁도를 확인하세요.',
        priority: 'high'
      });
    } else if (viewsChange > 10) {
      insights.push(`🎉 지난주 대비 조회수가 ${Math.round(viewsChange)}% 증가했습니다!`);
    }

    // Low performing content
    if (lowPerformingContent.length > 0) {
      insights.push(`📊 ${lowPerformingContent.length}개의 콘텐츠가 낮은 성과를 보이고 있습니다.`);
      lowPerformingContent.slice(0, 3).forEach(content => {
        actions.push({
          type: 'improve',
          title: `"${content.title}" 개선`,
          description: content.seoIssues.length > 0 
            ? `SEO 이슈: ${content.seoIssues[0]}`
            : `현재 ${content.views}회 조회, SEO 점수 ${content.seoScore}점`,
          priority: 'medium'
        });
      });
    }

    // Rising keywords
    if (risingKeywords.length > 0) {
      insights.push(`🔥 ${risingKeywords.length}개의 상승 추세 키워드가 발견되었습니다.`);
      actions.push({
        type: 'create',
        title: `"${risingKeywords[0].keyword.text}" 관련 콘텐츠 작성`,
        description: `검색량 ${risingKeywords[0].volume}, 경쟁도 ${risingKeywords[0].keyword.competition}`,
        priority: 'high'
      });
    }

    // Failed publishes
    if (failedPublishes > 0) {
      insights.push(`⚠️ 지난주 ${failedPublishes}건의 발행 실패가 있었습니다.`);
      actions.push({
        type: 'fix',
        title: 'API 연동 상태 점검',
        description: '발행 실패 로그를 확인하고 API 설정을 점검하세요.',
        priority: 'high'
      });
    }

    return {
      summary: {
        currentViews,
        previousViews,
        viewsChange: Math.round(viewsChange * 10) / 10,
        trend: viewsChange > 5 ? 'up' : viewsChange < -5 ? 'down' : 'stable'
      },
      insights,
      recommendedActions: actions,
      nextPublishRecommendations: risingKeywords.slice(0, 3).map(k => ({
        keyword: k.keyword.text,
        volume: k.volume,
        competition: k.keyword.competition,
        reason: '상승 추세 키워드'
      }))
    };
  }

  /**
   * Get content improvement suggestions
   */
  async getImprovementSuggestions(contentId: number) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        keywords: true,
        topic: true
      }
    });

    if (!content) {
      throw new Error('Content not found');
    }

    const suggestions: { category: string; issue: string; suggestion: string; priority: 'high' | 'medium' | 'low' }[] = [];

    // SEO analysis
    if (content.seoScore < 70) {
      content.seoIssues.forEach(issue => {
        suggestions.push({
          category: 'SEO',
          issue,
          suggestion: this.getSeoSuggestion(issue),
          priority: content.seoScore < 50 ? 'high' : 'medium'
        });
      });
    }

    // Title analysis
    if (content.title.length < 30) {
      suggestions.push({
        category: '제목',
        issue: '제목이 너무 짧습니다',
        suggestion: '30-60자 사이의 제목이 검색 결과에서 더 좋은 성과를 보입니다.',
        priority: 'medium'
      });
    }

    // Meta description
    if (!content.metaDescription) {
      suggestions.push({
        category: 'Meta',
        issue: '메타 설명이 없습니다',
        suggestion: '150-160자의 매력적인 메타 설명을 추가하세요.',
        priority: 'high'
      });
    }

    // Keywords
    if (content.keywords.length < 3) {
      suggestions.push({
        category: '키워드',
        issue: '키워드가 부족합니다',
        suggestion: '3-5개의 관련 키워드를 추가하여 검색 노출을 높이세요.',
        priority: 'medium'
      });
    }

    return {
      contentId,
      title: content.title,
      currentScore: content.seoScore,
      suggestions,
      estimatedScoreAfterFix: Math.min(100, content.seoScore + (suggestions.length * 10))
    };
  }

  private getSeoSuggestion(issue: string): string {
    const suggestions: Record<string, string> = {
      'Content too short (under 300 words).': '최소 300단어 이상의 콘텐츠를 작성하세요. 깊이 있는 내용이 검색 순위에 유리합니다.',
      'Missing H1 title.': '글의 시작 부분에 # 마크다운을 사용하여 H1 제목을 추가하세요.',
      'No meta description.': '검색 결과에 표시될 매력적인 메타 설명을 추가하세요.'
    };
    return suggestions[issue] || '해당 이슈를 수정하여 SEO 점수를 개선하세요.';
  }
}
