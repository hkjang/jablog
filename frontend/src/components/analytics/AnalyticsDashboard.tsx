"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Eye, MousePointerClick, Clock, TrendingUp, Globe } from "lucide-react";
import styles from "./analytics.module.css";

interface TrafficData {
  period: { start: string; end: string };
  dailyData: Array<{
    date: string;
    views: number;
    clicks: number;
    avgTimeOnPage: number;
    clickRate: number;
  }>;
  totals: {
    views: number;
    clicks: number;
    avgTimeOnPage: number;
    clickRate: number;
    revenue: number;
  };
  trafficSources: {
    organic: number;
    direct: number;
    referral: number;
    social: number;
  };
}

interface TopicComparison {
  id: number;
  name: string;
  totalViews: number;
  totalClicks: number;
  avgRanking: number;
  clickRate: number;
  contentCount: number;
}

interface PlatformComparison {
  platform: string;
  contentCount: number;
  totalViews: number;
  totalClicks: number;
  avgSeoScore: number;
  publishSuccessRate: number;
}

const CHART_COLORS = ["#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];

export default function AnalyticsDashboard() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [topicsData, setTopicsData] = useState<TopicComparison[]>([]);
  const [platformsData, setPlatformsData] = useState<PlatformComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  const API_BASE = "http://localhost:4000";

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString();
      
      const [trafficRes, topicsRes, platformsRes] = await Promise.all([
        axios.get(`${API_BASE}/analytics/traffic`, { params: { startDate } }),
        axios.get(`${API_BASE}/analytics/topics-comparison`),
        axios.get(`${API_BASE}/analytics/platforms`)
      ]);
      
      setTrafficData(trafficRes.data);
      setTopicsData(topicsRes.data);
      setPlatformsData(platformsRes.data);
    } catch (e) {
      console.error("Failed to fetch analytics data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const trafficSourcesData = trafficData ? [
    { name: "Organic", value: trafficData.trafficSources.organic },
    { name: "Direct", value: trafficData.trafficSources.direct },
    { name: "Referral", value: trafficData.trafficSources.referral },
    { name: "Social", value: trafficData.trafficSources.social },
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>분석 데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>성과 분석</h1>
        <div className={styles.dateSelector}>
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              className={`${styles.dateBtn} ${dateRange === days ? styles.dateBtnActive : ""}`}
              onClick={() => setDateRange(days)}
            >
              {days}일
            </button>
          ))}
        </div>
      </header>

      {/* Summary Cards */}
      <section className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} glass-panel`}>
          <Eye size={24} className={styles.cardIcon} />
          <div>
            <span className={styles.cardLabel}>총 조회수</span>
            <span className={styles.cardValue}>{formatNumber(trafficData?.totals.views || 0)}</span>
          </div>
        </div>
        <div className={`${styles.summaryCard} glass-panel`}>
          <MousePointerClick size={24} className={styles.cardIcon} />
          <div>
            <span className={styles.cardLabel}>총 클릭수</span>
            <span className={styles.cardValue}>{formatNumber(trafficData?.totals.clicks || 0)}</span>
          </div>
        </div>
        <div className={`${styles.summaryCard} glass-panel`}>
          <TrendingUp size={24} className={styles.cardIcon} />
          <div>
            <span className={styles.cardLabel}>평균 클릭률</span>
            <span className={styles.cardValue}>{trafficData?.totals.clickRate || 0}%</span>
          </div>
        </div>
        <div className={`${styles.summaryCard} glass-panel`}>
          <Clock size={24} className={styles.cardIcon} />
          <div>
            <span className={styles.cardLabel}>평균 체류시간</span>
            <span className={styles.cardValue}>{trafficData?.totals.avgTimeOnPage || 0}s</span>
          </div>
        </div>
      </section>

      {/* Traffic Chart */}
      <section className={`${styles.chartSection} glass-panel`}>
        <h2>일별 트래픽</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData?.dailyData || []}>
              <XAxis 
                dataKey="date" 
                stroke="var(--text-muted)"
                tickFormatter={(val) => new Date(val).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ 
                  background: "var(--bg-secondary)", 
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px"
                }}
              />
              <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartLegend}>
          <span className={styles.legendItem}><span style={{ background: "#8b5cf6" }}></span>조회수</span>
          <span className={styles.legendItem}><span style={{ background: "#ec4899" }}></span>클릭수</span>
        </div>
      </section>

      <div className={styles.twoColumns}>
        {/* Traffic Sources */}
        <section className={`${styles.chartSection} glass-panel`}>
          <h2>트래픽 소스</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficSourcesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {trafficSourcesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Platform Comparison */}
        <section className={`${styles.chartSection} glass-panel`}>
          <h2><Globe size={20} /> 플랫폼 비교</h2>
          <div className={styles.platformList}>
            {platformsData.map((platform) => (
              <div key={platform.platform} className={styles.platformItem}>
                <div className={styles.platformHeader}>
                  <span className={styles.platformName}>{platform.platform}</span>
                  <span className={styles.platformCount}>{platform.contentCount}개</span>
                </div>
                <div className={styles.platformStats}>
                  <span>조회: {formatNumber(platform.totalViews)}</span>
                  <span>클릭: {formatNumber(platform.totalClicks)}</span>
                  <span>SEO: {platform.avgSeoScore}점</span>
                  <span>성공률: {platform.publishSuccessRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Topics Comparison */}
      <section className={`${styles.chartSection} glass-panel`}>
        <h2>주제별 성과 비교</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicsData.slice(0, 10)}>
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ 
                  background: "var(--bg-secondary)", 
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="totalViews" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <table className={styles.topicsTable}>
          <thead>
            <tr>
              <th>주제</th>
              <th>콘텐츠</th>
              <th>조회수</th>
              <th>클릭수</th>
              <th>클릭률</th>
              <th>평균 순위</th>
            </tr>
          </thead>
          <tbody>
            {topicsData.slice(0, 5).map((topic) => (
              <tr key={topic.id}>
                <td>{topic.name}</td>
                <td>{topic.contentCount}</td>
                <td>{formatNumber(topic.totalViews)}</td>
                <td>{formatNumber(topic.totalClicks)}</td>
                <td>{topic.clickRate}%</td>
                <td>{topic.avgRanking || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
