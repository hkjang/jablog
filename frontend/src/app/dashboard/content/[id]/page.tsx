"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Eye,
  Clock,
  Globe,
  User,
  Tag,
  FileText,
  AlertTriangle,
  CheckCircle,
  Send,
  Calendar,
  X,
  Save,
} from "lucide-react";
import styles from "./contentDetail.module.css";

interface Author {
  id: number;
  name: string;
  email?: string;
}

interface Topic {
  id: number;
  name: string;
}

interface Keyword {
  id: number;
  text: string;
}

interface EditHistory {
  id: number;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user: { id: number; name: string };
}

interface PublishingLog {
  id: number;
  platform: string;
  status: string;
  externalUrl?: string;
  error?: string;
  createdAt: string;
}

interface ScheduledPost {
  id: number;
  platform: string;
  scheduledFor: string;
  status: string;
}

interface ContentDetail {
  id: number;
  title: string;
  body: string;
  excerpt?: string;
  imageUrl?: string;
  status: string;
  platform: string;
  seoScore: number;
  seoIssues: string[];
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  clicks: number;
  avgTimeOnPage: number;
  bounceRate: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author?: Author;
  topic?: Topic;
  keywords: Keyword[];
  editHistory: EditHistory[];
  publishingLogs: PublishingLog[];
  scheduledPosts: ScheduledPost[];
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "초안",
  REVIEW: "검수 대기",
  APPROVED: "승인됨",
  SCHEDULED: "예약됨",
  PUBLISHED: "발행됨",
};

const API_BASE = "http://localhost:4000";

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const id = params.id;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<ContentDetail>(
          `${API_BASE}/pipeline/content/${id}`
        );
        setContent(res.data);
        // Initialize edit form with content data
        setEditForm({
          title: res.data.title || "",
          body: res.data.body || "",
          excerpt: res.data.excerpt || "",
          metaTitle: res.data.metaTitle || "",
          metaDescription: res.data.metaDescription || "",
        });
      } catch (e: any) {
        console.error("Failed to fetch content:", e);
        setError(
          e.response?.status === 404
            ? "콘텐츠를 찾을 수 없습니다."
            : "콘텐츠를 불러오는데 실패했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeoClass = (score: number) => {
    if (score >= 80) return styles.seoHigh;
    if (score >= 60) return styles.seoMedium;
    return styles.seoLow;
  };

  // Handle Preview
  const handlePreview = () => {
    setShowPreview(true);
  };

  // Handle Edit
  const handleEdit = () => {
    if (content) {
      setEditForm({
        title: content.title || "",
        body: content.body || "",
        excerpt: content.excerpt || "",
        metaTitle: content.metaTitle || "",
        metaDescription: content.metaDescription || "",
      });
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!content) return;
    
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/pipeline/content/${id}`, {
        ...editForm,
        userId: 1, // TODO: Get from auth context
      });
      setContent({ ...content, ...res.data });
      setShowEditModal(false);
    } catch (e: any) {
      console.error("Failed to save:", e);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/pipeline/content/${id}`);
      router.push("/dashboard/content");
    } catch (e: any) {
      console.error("Failed to delete:", e);
      alert("삭제에 실패했습니다.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>콘텐츠 로딩 중...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className={styles.errorContainer}>
        <AlertTriangle size={48} />
        <p>{error || "콘텐츠를 찾을 수 없습니다."}</p>
        <button onClick={() => router.push("/dashboard/content")} className={styles.backBtn}>
          <ArrowLeft size={18} />
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} />
          뒤로
        </button>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn} onClick={handlePreview}>
            <Eye size={18} />
            미리보기
          </button>
          <button className={styles.actionBtn} onClick={handleEdit}>
            <Edit3 size={18} />
            편집
          </button>
          <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={handleDelete}>
            <Trash2 size={18} />
            삭제
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className={styles.grid}>
        {/* Left Column - Content */}
        <div className={styles.mainColumn}>
          {/* Title Card */}
          <div className={`${styles.card} glass-panel`}>
            <div className={styles.titleSection}>
              <span className={`${styles.statusBadge} ${styles[`status${content.status}`]}`}>
                {STATUS_LABELS[content.status]}
              </span>
              <h1 className={styles.title}>{content.title}</h1>
              <div className={styles.meta}>
                {content.author && (
                  <span className={styles.metaItem}>
                    <User size={14} />
                    {content.author.name}
                  </span>
                )}
                <span className={styles.metaItem}>
                  <Clock size={14} />
                  {formatDate(content.updatedAt)}
                </span>
                <span className={styles.metaItem}>
                  <Globe size={14} />
                  {content.platform}
                </span>
              </div>
            </div>
          </div>

          {/* Body Card */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.cardTitle}>
              <FileText size={18} />
              본문
            </h2>
            <div className={styles.body}>
              {content.body || "본문 내용이 없습니다."}
            </div>
          </div>

          {/* SEO Card */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.cardTitle}>SEO 분석</h2>
            <div className={styles.seoSection}>
              <div className={styles.seoScoreCard}>
                <div className={`${styles.seoScoreValue} ${getSeoClass(content.seoScore)}`}>
                  {content.seoScore}
                </div>
                <span className={styles.seoScoreLabel}>SEO 점수</span>
              </div>
              {content.seoIssues && content.seoIssues.length > 0 && (
                <div className={styles.seoIssues}>
                  <h3>개선 사항</h3>
                  <ul>
                    {content.seoIssues.map((issue, idx) => (
                      <li key={idx}>
                        <AlertTriangle size={14} />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className={styles.sideColumn}>
          {/* Analytics Card */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.cardTitle}>통계</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{content.views.toLocaleString()}</span>
                <span className={styles.statLabel}>조회수</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{content.clicks.toLocaleString()}</span>
                <span className={styles.statLabel}>클릭수</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{content.avgTimeOnPage.toFixed(1)}초</span>
                <span className={styles.statLabel}>평균 체류</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{content.bounceRate.toFixed(1)}%</span>
                <span className={styles.statLabel}>이탈률</span>
              </div>
            </div>
          </div>

          {/* Topic & Keywords */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.cardTitle}>
              <Tag size={18} />
              주제 및 키워드
            </h2>
            {content.topic && (
              <div className={styles.topic}>
                <span className={styles.topicBadge}>{content.topic.name}</span>
              </div>
            )}
            {content.keywords.length > 0 && (
              <div className={styles.keywords}>
                {content.keywords.map((kw) => (
                  <span key={kw.id} className={styles.keywordBadge}>
                    {kw.text}
                  </span>
                ))}
              </div>
            )}
            {!content.topic && content.keywords.length === 0 && (
              <p className={styles.emptyText}>등록된 키워드가 없습니다.</p>
            )}
          </div>

          {/* Scheduled Posts */}
          {content.scheduledPosts.length > 0 && (
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.cardTitle}>
                <Calendar size={18} />
                예약 발행
              </h2>
              <div className={styles.scheduleList}>
                {content.scheduledPosts.map((post) => (
                  <div key={post.id} className={styles.scheduleItem}>
                    <Globe size={14} />
                    <span>{post.platform}</span>
                    <span className={styles.scheduleDate}>
                      {formatDate(post.scheduledFor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publishing Logs */}
          {content.publishingLogs.length > 0 && (
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.cardTitle}>
                <Send size={18} />
                발행 기록
              </h2>
              <div className={styles.logList}>
                {content.publishingLogs.map((log) => (
                  <div key={log.id} className={styles.logItem}>
                    {log.status === "SUCCESS" ? (
                      <CheckCircle size={14} className={styles.successIcon} />
                    ) : (
                      <AlertTriangle size={14} className={styles.errorIcon} />
                    )}
                    <div className={styles.logInfo}>
                      <span className={styles.logPlatform}>{log.platform}</span>
                      <span className={styles.logDate}>
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit History */}
          {content.editHistory.length > 0 && (
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.cardTitle}>
                <Clock size={18} />
                수정 기록
              </h2>
              <div className={styles.historyList}>
                {content.editHistory.slice(0, 5).map((history) => (
                  <div key={history.id} className={styles.historyItem}>
                    <span className={styles.historyUser}>{history.user.name}</span>
                    <span className={styles.historyAction}>{history.action}</span>
                    <span className={styles.historyDate}>
                      {formatDate(history.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className={styles.modalOverlay} onClick={() => setShowPreview(false)}>
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>미리보기</h2>
              <button className={styles.closeBtn} onClick={() => setShowPreview(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.previewContent}>
              <article className={styles.previewArticle}>
                <h1 className={styles.previewTitle}>{content.title}</h1>
                <div className={styles.previewMeta}>
                  <span>{content.author?.name || "작성자 미상"}</span>
                  <span>•</span>
                  <span>{formatDate(content.updatedAt)}</span>
                  <span>•</span>
                  <span>{content.platform}</span>
                </div>
                {content.excerpt && (
                  <p className={styles.previewExcerpt}>{content.excerpt}</p>
                )}
                <div className={styles.previewBody}>
                  {content.body || "본문 내용이 없습니다."}
                </div>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>콘텐츠 편집</h2>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>제목</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="콘텐츠 제목"
                />
              </div>
              <div className={styles.formGroup}>
                <label>요약 (Excerpt)</label>
                <textarea
                  value={editForm.excerpt}
                  onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                  placeholder="콘텐츠 요약..."
                  rows={2}
                />
              </div>
              <div className={styles.formGroup}>
                <label>본문</label>
                <textarea
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  placeholder="콘텐츠 본문..."
                  rows={10}
                />
              </div>
              <div className={styles.formGroup}>
                <label>메타 제목 (SEO)</label>
                <input
                  type="text"
                  value={editForm.metaTitle}
                  onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                  placeholder="SEO 메타 제목"
                />
              </div>
              <div className={styles.formGroup}>
                <label>메타 설명 (SEO)</label>
                <textarea
                  value={editForm.metaDescription}
                  onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                  placeholder="SEO 메타 설명..."
                  rows={2}
                />
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <>저장 중...</>
                  ) : (
                    <>
                      <Save size={16} />
                      저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <AlertTriangle size={48} />
            </div>
            <h2>콘텐츠를 삭제하시겠습니까?</h2>
            <p>이 작업은 되돌릴 수 없습니다. 관련된 모든 기록이 함께 삭제됩니다.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                취소
              </button>
              <button
                className={styles.deleteBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

