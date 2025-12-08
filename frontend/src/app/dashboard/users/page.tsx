"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, UserPlus, Search, Edit2, Trash2, Shield, 
  Mail, Calendar, Check, X, RefreshCw
} from "lucide-react";
import styles from "./users.module.css";

interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "VIEWER" as 'ADMIN' | 'EDITOR' | 'VIEWER'
  });

  const API_BASE = "http://localhost:4000";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = roleFilter ? `?role=${roleFilter}` : "";
      const res = await axios.get(`${API_BASE}/users${params}`);
      setUsers(res.data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleCreateUser = async () => {
    try {
      setSaving(true);
      await axios.post(`${API_BASE}/users`, formData);
      setShowAddModal(false);
      setFormData({ email: "", password: "", name: "", role: "VIEWER" });
      await fetchUsers();
      alert("사용자가 생성되었습니다.");
    } catch (e: any) {
      alert(e.response?.data?.message || "사용자 생성 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.isActive
      });
      setEditingUser(null);
      await fetchUsers();
      alert("사용자 정보가 수정되었습니다.");
    } catch (e: any) {
      alert(e.response?.data?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("정말 이 사용자를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${userId}`);
      await fetchUsers();
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return styles.roleAdmin;
      case 'EDITOR': return styles.roleEditor;
      default: return styles.roleViewer;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>사용자 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <Users size={28} />
          <h1>사용자 관리</h1>
        </div>
        <button onClick={() => setShowAddModal(true)} className={styles.addBtn}>
          <UserPlus size={18} />
          사용자 추가
        </button>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.roleSelect}
        >
          <option value="">모든 역할</option>
          <option value="ADMIN">관리자</option>
          <option value="EDITOR">편집자</option>
          <option value="VIEWER">뷰어</option>
        </select>
        <button onClick={fetchUsers} className={styles.refreshBtn}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Users Table */}
      <div className={`${styles.tableWrapper} glass-panel`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>사용자</th>
              <th>이메일</th>
              <th>역할</th>
              <th>상태</th>
              <th>가입일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className={styles.userName}>{user.name}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.emailCell}>
                    <Mail size={14} />
                    {user.email}
                  </div>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
                    <Shield size={12} />
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                    {user.isActive ? <Check size={12} /> : <X size={12} />}
                    {user.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td>
                  <div className={styles.dateCell}>
                    <Calendar size={14} />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => setEditingUser(user)}
                      className={styles.editBtn}
                      title="수정"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={styles.deleteBtn}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <Users size={48} />
            <p>사용자가 없습니다</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2><UserPlus size={20} /> 새 사용자 추가</h2>
            <div className={styles.formGroup}>
              <label>이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="사용자 이름"
              />
            </div>
            <div className={styles.formGroup}>
              <label>이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label>비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="초기 비밀번호"
              />
            </div>
            <div className={styles.formGroup}>
              <label>역할</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="VIEWER">뷰어</option>
                <option value="EDITOR">편집자</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>
                취소
              </button>
              <button onClick={handleCreateUser} className={styles.submitBtn} disabled={saving}>
                {saving ? "생성 중..." : "사용자 생성"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2><Edit2 size={20} /> 사용자 수정</h2>
            <div className={styles.formGroup}>
              <label>이름</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>이메일</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>역할</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
              >
                <option value="VIEWER">뷰어</option>
                <option value="EDITOR">편집자</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                />
                활성 상태
              </label>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setEditingUser(null)} className={styles.cancelBtn}>
                취소
              </button>
              <button onClick={handleUpdateUser} className={styles.submitBtn} disabled={saving}>
                {saving ? "저장 중..." : "변경 저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
