"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { GripVertical, ChevronRight, User, Clock } from "lucide-react";
import styles from "./kanban.module.css";

interface ContentItem {
  id: number;
  title: string;
  status: string;
  platform: string;
  seoScore: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
  };
}

interface PipelineData {
  pipeline: {
    DRAFT: { count: number; items: ContentItem[] };
    REVIEW: { count: number; items: ContentItem[] };
    APPROVED: { count: number; items: ContentItem[] };
    SCHEDULED: { count: number; items: ContentItem[] };
    PUBLISHED: { count: number; items: ContentItem[] };
  };
  bottlenecks: string[];
  totalContents: number;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "초안",
  REVIEW: "검수 대기",
  APPROVED: "승인됨",
  SCHEDULED: "예약됨",
  PUBLISHED: "발행됨",
};

const STATUS_ORDER = ["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED"];

export default function ContentKanban() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const API_BASE = "http://localhost:4000";

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/pipeline/status`);
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch pipeline data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      await axios.patch(`${API_BASE}/pipeline/content/${draggedItem.id}/status`, {
        status: newStatus,
      });
      await fetchPipelineData();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }

    setDraggedItem(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>파이프라인 로딩 중...</p>
      </div>
    );
  }

  if (!data) {
    return <div className={styles.errorContainer}>데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>발행 파이프라인</h1>
        <p className={styles.stats}>총 {data.totalContents}개 콘텐츠</p>
      </header>

      {data.bottlenecks.length > 0 && (
        <div className={styles.bottlenecks}>
          {data.bottlenecks.map((msg, idx) => (
            <div key={idx} className={styles.bottleneckItem}>
              ⚠️ {msg}
            </div>
          ))}
        </div>
      )}

      <div className={styles.kanbanBoard}>
        {STATUS_ORDER.map((status) => {
          const column = data.pipeline[status as keyof typeof data.pipeline];
          const isDropTarget = dragOverColumn === status;

          return (
            <div
              key={status}
              className={`${styles.column} ${isDropTarget ? styles.columnDropTarget : ""}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>{STATUS_LABELS[status]}</span>
                <span className={styles.columnCount}>{column.count}</span>
              </div>

              <div className={styles.columnContent}>
                {column.items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.card} glass-panel`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    <div className={styles.cardDragHandle}>
                      <GripVertical size={14} />
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardPlatform}>{item.platform}</span>
                        <span className={styles.cardScore}>SEO {item.seoScore}</span>
                      </div>
                      <div className={styles.cardFooter}>
                        {item.author && (
                          <span className={styles.cardAuthor}>
                            <User size={12} />
                            {item.author.name}
                          </span>
                        )}
                        <span className={styles.cardDate}>
                          <Clock size={12} />
                          {formatDate(item.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={styles.cardArrow} size={16} />
                  </div>
                ))}

                {column.items.length === 0 && (
                  <div className={styles.emptyColumn}>
                    <p>콘텐츠 없음</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
