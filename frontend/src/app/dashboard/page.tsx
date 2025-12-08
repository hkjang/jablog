"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  TrendingUp, TrendingDown, Eye, MousePointerClick, Clock, 
  AlertTriangle, Calendar, Zap, Lightbulb, BarChart3
} from "lucide-react";
import styles from "./dashboard.module.css";

interface DashboardSummary {
  metrics: {
    totalViews: number;
    viewsTrend: number;
    totalClicks: number;
    clicksTrend: number;
    avgClickRate: number;
    avgTimeOnPage: number;
    revenue: number;
  };
  contentStats: Record<string, number>;
  alerts: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
  }>;
  upcomingScheduled: Array<{
    id: number;
    title: string;
    platform: string;
    scheduledFor: string;
  }>;
}

interface Recommendations {
  recommendedKeywords: Array<{
    keyword: string;
    volume: number;
    competition: number;
    trend: string;
  }>;
  improvementSuggestions: Array<{
    id: number;
    title: string;
    seoScore: number;
    issues: string[];
    action: string;
  }>;
  topTopics: Array<{
    name: string;
    views: number;
    publishCount: number;
  }>;
  suggestions: string[];
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:4000";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, recsRes] = await Promise.all([
        axios.get(`${API_BASE}/dashboard/summary`),
        axios.get(`${API_BASE}/dashboard/recommendations`)
      ]);
      setSummary(summaryRes.data);
      setRecommendations(recsRes.data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className={`${styles.trend} ${styles.trendUp}`}>
          <TrendingUp size={14} />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className={`${styles.trend} ${styles.trendDown}`}>
          <TrendingDown size={14} />
          {value}%
        </span>
      );
    }
    return <span className={styles.trend}>-</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertTriangle size={48} />
          <p>{error}</p>
          <button onClick={fetchDashboardData} className={styles.retryBtn}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>대시보드</h1>
        <p className={styles.subtitle}>블로그 성과 및 콘텐츠 관리</p>
      </header>

      {/* Key Metrics Cards */}
      <section className={styles.metricsGrid}>
        <div className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricIcon}>
            <Eye size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>총 조회수</span>
            <span className={styles.metricValue}>
              {formatNumber(summary?.metrics.totalViews || 0)}
            </span>
            {renderTrend(summary?.metrics.viewsTrend || 0)}
          </div>
        </div>

        <div className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricIcon}>
            <MousePointerClick size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>총 클릭수</span>
            <span className={styles.metricValue}>
              {formatNumber(summary?.metrics.totalClicks || 0)}
            </span>
            {renderTrend(summary?.metrics.clicksTrend || 0)}
          </div>
        </div>

        <div className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>평균 클릭률</span>
            <span className={styles.metricValue}>
              {summary?.metrics.avgClickRate || 0}%
            </span>
          </div>
        </div>

        <div className={`${styles.metricCard} glass-panel`}>
          <div className={styles.metricIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>평균 체류시간</span>
            <span className={styles.metricValue}>
              {summary?.metrics.avgTimeOnPage || 0}s
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Alerts Section */}
        {summary?.alerts && summary.alerts.length > 0 && (
          <section className={`${styles.alertsSection} glass-panel`}>
            <h2><AlertTriangle size={20} /> 알림</h2>
            <div className={styles.alertsList}>
              {summary.alerts.map((alert) => (
                <div key={alert.id} className={`${styles.alertItem} ${styles[`alert${alert.type}`]}`}>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        <section className={`${styles.recommendationsSection} glass-panel`}>
          <h2><Lightbulb size={20} /> AI 추천</h2>
          <div className={styles.suggestionsList}>
            {recommendations?.suggestions?.map((suggestion, idx) => (
              <div key={idx} className={styles.suggestionItem}>
                <Zap size={16} />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>

          {recommendations?.recommendedKeywords && recommendations.recommendedKeywords.length > 0 && (
            <div className={styles.keywordsSection}>
              <h3>추천 키워드</h3>
              <div className={styles.keywordTags}>
                {recommendations.recommendedKeywords.slice(0, 5).map((kw, idx) => (
                  <span key={idx} className={styles.keywordTag}>
                    {kw.keyword}
                    <span className={styles.keywordVolume}>{formatNumber(kw.volume)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Upcoming Scheduled Posts */}
        <section className={`${styles.scheduledSection} glass-panel`}>
          <h2><Calendar size={20} /> 예정된 발행</h2>
          {summary?.upcomingScheduled && summary.upcomingScheduled.length > 0 ? (
            <div className={styles.scheduledList}>
              {summary.upcomingScheduled.map((post) => (
                <div key={post.id} className={styles.scheduledItem}>
                  <div className={styles.scheduledInfo}>
                    <span className={styles.scheduledTitle}>{post.title}</span>
                    <span className={styles.scheduledPlatform}>{post.platform}</span>
                  </div>
                  <span className={styles.scheduledTime}>
                    {new Date(post.scheduledFor).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>예정된 발행이 없습니다.</p>
          )}
        </section>

        {/* Content Pipeline Status */}
        <section className={`${styles.pipelineSection} glass-panel`}>
          <h2>콘텐츠 현황</h2>
          <div className={styles.pipelineStats}>
            {Object.entries(summary?.contentStats || {}).map(([status, count]) => (
              <div key={status} className={styles.pipelineStat}>
                <span className={styles.pipelineCount}>{count}</span>
                <span className={styles.pipelineLabel}>{status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
