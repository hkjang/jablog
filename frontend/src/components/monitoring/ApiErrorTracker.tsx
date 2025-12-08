"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import styles from "./monitoring.module.css";

interface ApiError {
  id: number;
  platform: string;
  endpoint: string;
  method: string;
  statusCode: number | null;
  errorMessage: string;
  retryCount: number;
  resolved: boolean;
  createdAt: string;
}

interface ErrorStats {
  totalErrors: number;
  unresolvedErrors: number;
  last24Hours: number;
  last7Days: number;
  errorRate: number;
  successRate: number;
  byPlatform: Array<{ platform: string; count: number }>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  retryStats: { avgRetries: number; maxRetries: number };
}

export default function ApiErrorTracker() {
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved">("unresolved");

  const API_BASE = "http://localhost:4000";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [errorsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/monitoring/api-errors`, {
          params: { resolved: filter === "unresolved" ? "false" : undefined }
        }),
        axios.get(`${API_BASE}/monitoring/api-errors/stats`)
      ]);
      setErrors(errorsRes.data.errors);
      setStats(statsRes.data);
    } catch (e) {
      console.error("Failed to fetch monitoring data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleResolve = async (errorId: number) => {
    try {
      await axios.patch(`${API_BASE}/monitoring/api-errors/${errorId}/resolve`);
      await fetchData();
    } catch (e) {
      console.error("Failed to resolve error:", e);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>모니터링 데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1><AlertTriangle size={24} /> API 모니터링</h1>
        <button onClick={fetchData} className={styles.refreshBtn}>
          <RefreshCw size={16} />
          새로고침
        </button>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statLabel}>성공률</span>
          <span className={`${styles.statValue} ${styles.statSuccess}`}>
            {stats?.successRate || 100}%
          </span>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statLabel}>미해결 오류</span>
          <span className={`${styles.statValue} ${styles.statError}`}>
            {stats?.unresolvedErrors || 0}
          </span>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statLabel}>최근 24시간</span>
          <span className={styles.statValue}>{stats?.last24Hours || 0}</span>
        </div>
        <div className={`${styles.statCard} glass-panel`}>
          <span className={styles.statLabel}>평균 재시도</span>
          <span className={styles.statValue}>{stats?.retryStats.avgRetries || 0}</span>
        </div>
      </div>

      {/* Platform Breakdown */}
      {stats?.byPlatform && stats.byPlatform.length > 0 && (
        <div className={`${styles.platformSection} glass-panel`}>
          <h2>플랫폼별 오류</h2>
          <div className={styles.platformBars}>
            {stats.byPlatform.map((p) => (
              <div key={p.platform} className={styles.platformBar}>
                <span className={styles.platformName}>{p.platform}</span>
                <div className={styles.barContainer}>
                  <div 
                    className={styles.bar} 
                    style={{ width: `${(p.count / stats.last7Days) * 100}%` }}
                  ></div>
                </div>
                <span className={styles.platformCount}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filter === "unresolved" ? styles.filterTabActive : ""}`}
          onClick={() => setFilter("unresolved")}
        >
          미해결
        </button>
        <button
          className={`${styles.filterTab} ${filter === "all" ? styles.filterTabActive : ""}`}
          onClick={() => setFilter("all")}
        >
          전체
        </button>
      </div>

      {/* Error List */}
      <div className={`${styles.errorList} glass-panel`}>
        {errors.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={48} />
            <p>오류가 없습니다!</p>
          </div>
        ) : (
          errors.map((error) => (
            <div key={error.id} className={styles.errorItem}>
              <div className={styles.errorHeader}>
                <span className={`${styles.method} ${styles[`method${error.method}`]}`}>
                  {error.method}
                </span>
                <span className={styles.endpoint}>{error.endpoint}</span>
                <span className={styles.platform}>{error.platform}</span>
                {error.statusCode && (
                  <span className={styles.statusCode}>{error.statusCode}</span>
                )}
              </div>
              <p className={styles.errorMessage}>{error.errorMessage}</p>
              <div className={styles.errorFooter}>
                <span className={styles.errorMeta}>
                  <Clock size={12} />
                  {formatDate(error.createdAt)}
                </span>
                {error.retryCount > 0 && (
                  <span className={styles.errorMeta}>
                    재시도: {error.retryCount}회
                  </span>
                )}
                {!error.resolved && (
                  <button 
                    onClick={() => handleResolve(error.id)}
                    className={styles.resolveBtn}
                  >
                    해결됨으로 표시
                  </button>
                )}
                {error.resolved && (
                  <span className={styles.resolvedBadge}>
                    <CheckCircle size={12} /> 해결됨
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
