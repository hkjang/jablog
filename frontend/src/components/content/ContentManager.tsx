"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Globe,
  X,
  Save,
} from "lucide-react";
import styles from "./content.module.css";

interface Author {
  id: number;
  name: string;
}

interface ContentItem {
  id: number;
  title: string;
  excerpt?: string;
  status: string;
  platform: string;
  seoScore: number;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author?: Author;
}

interface PipelineData {
  pipeline: {
    DRAFT: { count: number; items: ContentItem[] };
    REVIEW: { count: number; items: ContentItem[] };
    APPROVED: { count: number; items: ContentItem[] };
    SCHEDULED: { count: number; items: ContentItem[] };
    PUBLISHED: { count: number; items: ContentItem[] };
  };
  totalContents: number;
}

const STATUS_LABELS: Record<string, string> = {
  ALL: "전체",
  DRAFT: "초안",
  REVIEW: "검수 대기",
  APPROVED: "승인됨",
  SCHEDULED: "예약됨",
  PUBLISHED: "발행됨",
};

const STATUS_FILTERS = ["ALL", "DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED"];
const PLATFORM_OPTIONS = ["TISTORY", "WORDPRESS", "BOTH"];

export default function ContentManager() {
  const [allContents, setAllContents] = useState<ContentItem[]>([]);
  const [filteredContents, setFilteredContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    review: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
  });

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    body: "",
    excerpt: "",
    platform: "TISTORY",
    metaTitle: "",
    metaDescription: "",
  });

  const ITEMS_PER_PAGE = 10;
  const API_BASE = "http://localhost:4000";

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<PipelineData>(`${API_BASE}/pipeline/status`);

      // Flatten all contents from pipeline
      const contents: ContentItem[] = [];
      const pipeline = res.data.pipeline;

      Object.values(pipeline).forEach((stage) => {
        contents.push(...stage.items);
      });

      // Sort by updatedAt descending
      contents.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setAllContents(contents);
      setStats({
        total: res.data.totalContents,
        draft: pipeline.DRAFT.count,
        review: pipeline.REVIEW.count,
        approved: pipeline.APPROVED.count,
        scheduled: pipeline.SCHEDULED.count,
        published: pipeline.PUBLISHED.count,
      });
    } catch (e) {
      console.error("Failed to fetch contents:", e);
      setError("콘텐츠 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    let filtered = [...allContents];

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.excerpt?.toLowerCase().includes(term)
      );
    }

    setFilteredContents(filtered);
    setCurrentPage(1);
  }, [allContents, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSeoClass = (score: number) => {
    if (score >= 80) return styles.seoHigh;
    if (score >= 60) return styles.seoMedium;
    return styles.seoLow;
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_BASE}/pipeline/content/${id}`);
      fetchContents();
    } catch (e) {
      console.error("Failed to delete:", e);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleOpenCreateModal = () => {
    setCreateForm({
      title: "",
      body: "",
      excerpt: "",
      platform: "TISTORY",
      metaTitle: "",
      metaDescription: "",
    });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!createForm.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!createForm.body.trim()) {
      alert("본문을 입력해주세요.");
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${API_BASE}/pipeline/content`, {
        title: createForm.title,
        body: createForm.body,
        excerpt: createForm.excerpt || undefined,
        platform: createForm.platform,
        metaTitle: createForm.metaTitle || undefined,
        metaDescription: createForm.metaDescription || undefined,
        status: "DRAFT",
        authorId: 1, // TODO: Get from auth context
      });
      setShowCreateModal(false);
      fetchContents();
    } catch (e: any) {
      console.error("Failed to create:", e);
      alert("콘텐츠 생성에 실패했습니다.");
    } finally {
      setCreating(false);
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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchContents} className={styles.createBtn}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>콘텐츠 관리</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="콘텐츠 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.createBtn} onClick={handleOpenCreateModal}>
            <Plus size={18} />
            새 콘텐츠
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={`${styles.statsBar} glass-panel`}>
        <div className={styles.statItem}>
          <span>전체</span>
          <span>{stats.total}</span>
        </div>
        <div className={styles.statItem}>
          <span>초안</span>
          <span>{stats.draft}</span>
        </div>
        <div className={styles.statItem}>
          <span>검수 대기</span>
          <span>{stats.review}</span>
        </div>
        <div className={styles.statItem}>
          <span>승인됨</span>
          <span>{stats.approved}</span>
        </div>
        <div className={styles.statItem}>
          <span>예약됨</span>
          <span>{stats.scheduled}</span>
        </div>
        <div className={styles.statItem}>
          <span>발행됨</span>
          <span>{stats.published}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            className={`${styles.filterBtn} ${
              statusFilter === status ? styles.filterBtnActive : ""
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className={`${styles.tableWrapper} glass-panel`}>
        {paginatedContents.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>제목</th>
                <th>상태</th>
                <th>플랫폼</th>
                <th>SEO</th>
                <th>작성자</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContents.map((content) => (
                <tr key={content.id}>
                  <td>
                    <div className={styles.contentTitle}>
                      <a href={`/dashboard/content/${content.id}`}>{content.title}</a>
                    </div>
                    {content.excerpt && (
                      <div className={styles.contentExcerpt}>{content.excerpt}</div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status${content.status}`]
                      }`}
                    >
                      {STATUS_LABELS[content.status]}
                    </span>
                  </td>
                  <td>
                    <span className={styles.platformBadge}>
                      <Globe size={12} />
                      {content.platform}
                    </span>
                  </td>
                  <td>
                    <div className={styles.seoScore}>
                      <div className={styles.seoBar}>
                        <div
                          className={`${styles.seoFill} ${getSeoClass(content.seoScore)}`}
                          style={{ width: `${content.seoScore}%` }}
                        />
                      </div>
                      <span className={styles.seoValue}>{content.seoScore}</span>
                    </div>
                  </td>
                  <td>
                    {content.author ? (
                      <div className={styles.author}>
                        <div className={styles.authorAvatar}>
                          {getInitials(content.author.name)}
                        </div>
                        <span className={styles.authorName}>{content.author.name}</span>
                      </div>
                    ) : (
                      <span className={styles.date}>-</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(content.updatedAt)}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <a href={`/dashboard/content/${content.id}`} className={styles.actionBtn} title="보기">
                        <Eye size={16} />
                      </a>
                      <a href={`/dashboard/content/${content.id}`} className={styles.actionBtn} title="편집">
                        <Edit3 size={16} />
                      </a>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        title="삭제"
                        onClick={() => handleDelete(content.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <p>
              {searchTerm || statusFilter !== "ALL"
                ? "검색 결과가 없습니다."
                : "등록된 콘텐츠가 없습니다."}
            </p>
            <button className={styles.createBtn} onClick={handleOpenCreateModal}>
              <Plus size={18} />
              새 콘텐츠 만들기
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            )
            .map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${
                  currentPage === page ? styles.pageBtnActive : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.createModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>새 콘텐츠 만들기</h2>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.createForm}>
              <div className={styles.formGroup}>
                <label>제목 *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="콘텐츠 제목을 입력하세요"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>플랫폼</label>
                  <select
                    value={createForm.platform}
                    onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value })}
                  >
                    {PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>요약 (Excerpt)</label>
                <textarea
                  value={createForm.excerpt}
                  onChange={(e) => setCreateForm({ ...createForm, excerpt: e.target.value })}
                  placeholder="콘텐츠 요약을 입력하세요"
                  rows={2}
                />
              </div>
              <div className={styles.formGroup}>
                <label>본문 *</label>
                <textarea
                  value={createForm.body}
                  onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })}
                  placeholder="콘텐츠 본문을 입력하세요"
                  rows={10}
                />
              </div>
              <div className={styles.formGroup}>
                <label>메타 제목 (SEO)</label>
                <input
                  type="text"
                  value={createForm.metaTitle}
                  onChange={(e) => setCreateForm({ ...createForm, metaTitle: e.target.value })}
                  placeholder="SEO 메타 제목"
                />
              </div>
              <div className={styles.formGroup}>
                <label>메타 설명 (SEO)</label>
                <textarea
                  value={createForm.metaDescription}
                  onChange={(e) => setCreateForm({ ...createForm, metaDescription: e.target.value })}
                  placeholder="SEO 메타 설명"
                  rows={2}
                />
              </div>
              <div className={styles.formActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  취소
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <>생성 중...</>
                  ) : (
                    <>
                      <Save size={16} />
                      생성
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

