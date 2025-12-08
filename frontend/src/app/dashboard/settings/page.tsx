"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Save, Sun, Moon, Monitor, Bell, Target, Layout, User, Link2, 
  RefreshCw, Trash2, Plus, Check, X, Eye, EyeOff, Key, Bot, Sparkles, Edit2
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import styles from "./settings.module.css";

interface UserSettings {
  id: number;
  notificationFrequency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  targetViews: number;
  targetClickRate: number;
  favoriteMenus: string[];
  darkMode: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface PlatformCredential {
  id: number;
  platform: string;
  name: string;
  blogName?: string;
  siteUrl?: string;
  isActive: boolean;
  lastTestedAt?: string;
  lastTestResult?: string;
}

interface AiSettings {
  id: number;
  provider: string;
  model: string;
  apiKey?: string;
  apiUrl?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  contentPrompt?: string;
  titlePrompt?: string;
  autoSeoOptimize: boolean;
  autoTranslate: boolean;
}

type TabId = 'profile' | 'notifications' | 'targets' | 'platform' | 'ai' | 'theme' | 'account';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credentials, setCredentials] = useState<PlatformCredential[]>([]);
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewCredential, setShowNewCredential] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingCredential, setEditingCredential] = useState<PlatformCredential & { accessToken?: string; username?: string; appPassword?: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // New credential form
  const [newCredForm, setNewCredForm] = useState({
    platform: 'TISTORY',
    name: '',
    blogName: '',
    accessToken: '',
    siteUrl: '',
    username: '',
    appPassword: ''
  });

  const API_BASE = "http://localhost:4000";
  const userId = 1; // TODO: Get from auth context

  const tabs: { id: TabId; name: string; icon: React.ReactNode }[] = [
    { id: 'profile', name: '프로필', icon: <User size={18} /> },
    { id: 'notifications', name: '알림', icon: <Bell size={18} /> },
    { id: 'targets', name: '목표 지표', icon: <Target size={18} /> },
    { id: 'platform', name: '플랫폼 연동', icon: <Link2 size={18} /> },
    { id: 'ai', name: 'AI 설정', icon: <Bot size={18} /> },
    { id: 'theme', name: '테마', icon: <Layout size={18} /> },
    { id: 'account', name: '계정 관리', icon: <Key size={18} /> },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, profileRes, credentialsRes, aiSettingsRes] = await Promise.all([
        axios.get(`${API_BASE}/users/${userId}/settings`),
        axios.get(`${API_BASE}/users/${userId}`),
        axios.get(`${API_BASE}/settings/platform-credentials?userId=${userId}`),
        axios.get(`${API_BASE}/settings/ai?userId=${userId}`).catch(() => ({ data: null }))
      ]);
      setSettings(settingsRes.data);
      setProfile(profileRes.data);
      setCredentials(credentialsRes.data);
      setAiSettings(aiSettingsRes.data);
      if (settingsRes.data.darkMode) {
        setTheme(settingsRes.data.darkMode.toLowerCase() as "auto" | "light" | "dark");
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/users/${userId}/settings`, {
        ...settings,
        darkMode: theme.toUpperCase()
      });
      alert("설정이 저장되었습니다.");
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/users/${userId}`, {
        name: profile.name,
        email: profile.email
      });
      alert("프로필이 저장되었습니다.");
    } catch (e) {
      console.error("Failed to save profile:", e);
      alert("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("현재 비밀번호와 새 비밀번호를 모두 입력하세요.");
      return;
    }
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
      alert("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      alert(e.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm("모든 설정을 기본값으로 초기화하시겠습니까?")) return;
    try {
      setSaving(true);
      await axios.delete(`${API_BASE}/users/${userId}/settings`);
      await fetchData();
      alert("설정이 초기화되었습니다.");
    } catch (e) {
      console.error("Failed to reset settings:", e);
      alert("설정 초기화 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (credId: number) => {
    try {
      setTestingId(credId);
      const res = await axios.post(`${API_BASE}/settings/platform-credentials/${credId}/test`);
      await fetchData();
      alert(res.data.success ? "연결 성공!" : `연결 실패: ${res.data.message}`);
    } catch (e: any) {
      alert("연결 테스트 실패: " + (e.response?.data?.message || e.message));
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteCredential = async (credId: number) => {
    if (!confirm("이 플랫폼 연동을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_BASE}/settings/platform-credentials/${credId}`);
      await fetchData();
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCreateCredential = async () => {
    try {
      setSaving(true);
      await axios.post(`${API_BASE}/settings/platform-credentials`, {
        userId,
        ...newCredForm
      });
      setShowNewCredential(false);
      setNewCredForm({ platform: 'TISTORY', name: '', blogName: '', accessToken: '', siteUrl: '', username: '', appPassword: '' });
      await fetchData();
      alert("플랫폼 연동이 추가되었습니다.");
    } catch (e: any) {
      alert(e.response?.data?.message || "추가 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredential = async () => {
    if (!editingCredential) return;
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/settings/platform-credentials/${editingCredential.id}`, {
        name: editingCredential.name,
        blogName: editingCredential.blogName,
        siteUrl: editingCredential.siteUrl,
        accessToken: editingCredential.accessToken,
        username: editingCredential.username,
        appPassword: editingCredential.appPassword,
        isActive: editingCredential.isActive
      });
      setEditingCredential(null);
      await fetchData();
      alert("플랫폼 연동이 수정되었습니다.");
    } catch (e: any) {
      alert(e.response?.data?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAiSettings = async () => {
    if (!aiSettings) return;
    try {
      setSaving(true);
      await axios.put(`${API_BASE}/settings/ai`, {
        userId,
        ...aiSettings
      });
      alert("AI 설정이 저장되었습니다.");
    } catch (e: any) {
      alert(e.response?.data?.message || "AI 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const updateAiSetting = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
    if (!aiSettings) return;
    setAiSettings({ ...aiSettings, [key]: value });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>설정 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>설정</h1>
        <button onClick={handleSaveSettings} className={styles.saveBtn} disabled={saving}>
          <Save size={16} />
          {saving ? "저장 중..." : "저장"}
        </button>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <section className={`${styles.section} glass-panel`}>
            <h2><User size={20} /> 프로필 정보</h2>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>이름</span>
              </div>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>이메일</span>
              </div>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>역할</span>
              </div>
              <span className={styles.badge}>{profile.role}</span>
            </div>
            <div className={styles.buttonRow}>
              <button onClick={handleSaveProfile} className={styles.primaryBtn} disabled={saving}>
                프로필 저장
              </button>
            </div>
          </section>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <section className={`${styles.section} glass-panel`}>
            <h2><Bell size={20} /> 알림</h2>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>알림 주기</span>
                <span className={styles.settingDesc}>알림을 받을 빈도를 설정합니다</span>
              </div>
              <select
                value={settings?.notificationFrequency || "REALTIME"}
                onChange={(e) => updateSetting("notificationFrequency", e.target.value)}
                className={styles.select}
              >
                <option value="REALTIME">실시간</option>
                <option value="HOURLY">1시간마다</option>
                <option value="DAILY">하루 1회</option>
              </select>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>이메일 알림</span>
                <span className={styles.settingDesc}>중요 알림을 이메일로 받습니다</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings?.emailNotifications ?? true}
                  onChange={(e) => updateSetting("emailNotifications", e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>푸시 알림</span>
                <span className={styles.settingDesc}>브라우저 푸시 알림을 받습니다</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings?.pushNotifications ?? true}
                  onChange={(e) => updateSetting("pushNotifications", e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </section>
        )}

        {/* Targets Tab */}
        {activeTab === 'targets' && (
          <section className={`${styles.section} glass-panel`}>
            <h2><Target size={20} /> 목표 지표</h2>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>월간 목표 조회수</span>
                <span className={styles.settingDesc}>달성하고자 하는 월간 조회수</span>
              </div>
              <input
                type="number"
                value={settings?.targetViews || 1000}
                onChange={(e) => updateSetting("targetViews", parseInt(e.target.value))}
                className={styles.input}
                min={0}
              />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>목표 클릭률 (%)</span>
                <span className={styles.settingDesc}>달성하고자 하는 클릭률</span>
              </div>
              <input
                type="number"
                value={settings?.targetClickRate || 5}
                onChange={(e) => updateSetting("targetClickRate", parseFloat(e.target.value))}
                className={styles.input}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
          </section>
        )}

        {/* Platform Tab */}
        {activeTab === 'platform' && (
          <section className={`${styles.section} glass-panel`}>
            <h2><Link2 size={20} /> 플랫폼 연동</h2>
            
            <div className={styles.credentialList}>
              {credentials.map((cred) => (
                <div key={cred.id} className={styles.credentialCard}>
                  <div className={styles.credentialHeader}>
                    <span className={`${styles.platformBadge} ${styles[cred.platform.toLowerCase()]}`}>
                      {cred.platform}
                    </span>
                    <span className={styles.credentialName}>{cred.name}</span>
                    {cred.lastTestResult && (
                      <span className={`${styles.testBadge} ${styles[cred.lastTestResult.toLowerCase()]}`}>
                        {cred.lastTestResult === 'SUCCESS' ? <Check size={12} /> : <X size={12} />}
                        {cred.lastTestResult}
                      </span>
                    )}
                  </div>
                  <div className={styles.credentialInfo}>
                    {cred.blogName && <span>블로그: {cred.blogName}</span>}
                    {cred.siteUrl && <span>URL: {cred.siteUrl}</span>}
                  </div>
                  <div className={styles.credentialActions}>
                    <button
                      onClick={() => setEditingCredential({ ...cred, accessToken: '', username: '', appPassword: '' })}
                      className={styles.iconBtn}
                    >
                      <Edit2 size={16} />
                      수정
                    </button>
                    <button
                      onClick={() => handleTestConnection(cred.id)}
                      className={styles.iconBtn}
                      disabled={testingId === cred.id}
                    >
                      <RefreshCw size={16} className={testingId === cred.id ? styles.spinning : ''} />
                      테스트
                    </button>
                    <button onClick={() => handleDeleteCredential(cred.id)} className={styles.iconBtnDanger}>
                      <Trash2 size={16} />
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!showNewCredential ? (
              <button onClick={() => setShowNewCredential(true)} className={styles.addBtn}>
                <Plus size={18} />
                새 플랫폼 연동 추가
              </button>
            ) : (
              <div className={styles.newCredentialForm}>
                <h3>새 플랫폼 연동</h3>
                <div className={styles.formRow}>
                  <label>플랫폼</label>
                  <select
                    value={newCredForm.platform}
                    onChange={(e) => setNewCredForm({ ...newCredForm, platform: e.target.value })}
                    className={styles.select}
                  >
                    <option value="TISTORY">Tistory</option>
                    <option value="WORDPRESS">WordPress</option>
                  </select>
                </div>
                <div className={styles.formRow}>
                  <label>이름</label>
                  <input
                    type="text"
                    value={newCredForm.name}
                    onChange={(e) => setNewCredForm({ ...newCredForm, name: e.target.value })}
                    placeholder="내 블로그"
                    className={styles.input}
                  />
                </div>
                {newCredForm.platform === 'TISTORY' ? (
                  <>
                    <div className={styles.formRow}>
                      <label>블로그명</label>
                      <input
                        type="text"
                        value={newCredForm.blogName}
                        onChange={(e) => setNewCredForm({ ...newCredForm, blogName: e.target.value })}
                        placeholder="myblog"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label>Access Token</label>
                      <input
                        type="password"
                        value={newCredForm.accessToken}
                        onChange={(e) => setNewCredForm({ ...newCredForm, accessToken: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formRow}>
                      <label>사이트 URL</label>
                      <input
                        type="text"
                        value={newCredForm.siteUrl}
                        onChange={(e) => setNewCredForm({ ...newCredForm, siteUrl: e.target.value })}
                        placeholder="https://myblog.com"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label>사용자명</label>
                      <input
                        type="text"
                        value={newCredForm.username}
                        onChange={(e) => setNewCredForm({ ...newCredForm, username: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label>앱 비밀번호</label>
                      <input
                        type="password"
                        value={newCredForm.appPassword}
                        onChange={(e) => setNewCredForm({ ...newCredForm, appPassword: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                  </>
                )}
                <div className={styles.formActions}>
                  <button onClick={() => setShowNewCredential(false)} className={styles.secondaryBtn}>
                    취소
                  </button>
                  <button onClick={handleCreateCredential} className={styles.primaryBtn} disabled={saving}>
                    추가
                  </button>
                </div>
                </div>
            )}
          </section>
        )}

        {/* Edit Credential Modal */}
        {editingCredential && (
          <div className={styles.modalOverlay} onClick={() => setEditingCredential(null)}>
            <div className={styles.editCredentialModal} onClick={(e) => e.stopPropagation()}>
              <h3><Edit2 size={18} /> 플랫폼 연동 수정</h3>
              <div className={styles.formRow}>
                <label>플랫폼</label>
                <span className={`${styles.platformBadge} ${styles[editingCredential.platform.toLowerCase()]}`}>
                  {editingCredential.platform}
                </span>
              </div>
              <div className={styles.formRow}>
                <label>이름</label>
                <input
                  type="text"
                  value={editingCredential.name}
                  onChange={(e) => setEditingCredential({ ...editingCredential, name: e.target.value })}
                  className={styles.input}
                />
              </div>
              {editingCredential.platform === 'TISTORY' ? (
                <>
                  <div className={styles.formRow}>
                    <label>블로그명</label>
                    <input
                      type="text"
                      value={editingCredential.blogName || ''}
                      onChange={(e) => setEditingCredential({ ...editingCredential, blogName: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Access Token (변경 시에만 입력)</label>
                    <input
                      type="password"
                      value={editingCredential.accessToken || ''}
                      onChange={(e) => setEditingCredential({ ...editingCredential, accessToken: e.target.value })}
                      placeholder="변경하지 않으면 비워두세요"
                      className={styles.input}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formRow}>
                    <label>사이트 URL</label>
                    <input
                      type="text"
                      value={editingCredential.siteUrl || ''}
                      onChange={(e) => setEditingCredential({ ...editingCredential, siteUrl: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>사용자명</label>
                    <input
                      type="text"
                      value={editingCredential.username || ''}
                      onChange={(e) => setEditingCredential({ ...editingCredential, username: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>앱 비밀번호 (변경 시에만 입력)</label>
                    <input
                      type="password"
                      value={editingCredential.appPassword || ''}
                      onChange={(e) => setEditingCredential({ ...editingCredential, appPassword: e.target.value })}
                      placeholder="변경하지 않으면 비워두세요"
                      className={styles.input}
                    />
                  </div>
                </>
              )}
              <div className={styles.formRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editingCredential.isActive}
                    onChange={(e) => setEditingCredential({ ...editingCredential, isActive: e.target.checked })}
                  />
                  활성 상태
                </label>
              </div>
              <div className={styles.formActions}>
                <button onClick={() => setEditingCredential(null)} className={styles.secondaryBtn}>
                  취소
                </button>
                <button onClick={handleUpdateCredential} className={styles.primaryBtn} disabled={saving}>
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Settings Tab */}
        {activeTab === 'ai' && aiSettings && (
          <section className={`${styles.section} glass-panel`}>
            <h2><Bot size={20} /> AI 설정</h2>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>AI 제공자</span>
                <span className={styles.settingDesc}>콘텐츠 생성에 사용할 LLM 제공자</span>
              </div>
              <select
                value={aiSettings.provider}
                onChange={(e) => updateAiSetting("provider", e.target.value)}
                className={styles.select}
              >
                <option value="OLLAMA">Ollama (로컬)</option>
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic</option>
                <option value="GEMINI">Google Gemini</option>
              </select>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>모델</span>
                <span className={styles.settingDesc}>사용할 AI 모델 이름</span>
              </div>
              <input
                type="text"
                value={aiSettings.model}
                onChange={(e) => updateAiSetting("model", e.target.value)}
                className={styles.input}
                placeholder="llama3 / gpt-4 / claude-3"
              />
            </div>

            {aiSettings.provider !== 'OLLAMA' && (
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>API Key</span>
                  <span className={styles.settingDesc}>AI 서비스 API 키</span>
                </div>
                <div className={styles.passwordInput}>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={aiSettings.apiKey || ''}
                    onChange={(e) => updateAiSetting("apiKey", e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className={styles.eyeBtn}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {aiSettings.provider === 'OLLAMA' && (
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>API URL</span>
                  <span className={styles.settingDesc}>Ollama 서버 주소</span>
                </div>
                <input
                  type="text"
                  value={aiSettings.apiUrl || ''}
                  onChange={(e) => updateAiSetting("apiUrl", e.target.value)}
                  className={styles.input}
                  placeholder="http://localhost:11434"
                />
              </div>
            )}

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Temperature ({aiSettings.temperature})</span>
                <span className={styles.settingDesc}>낮을수록 일관되고, 높을수록 창의적</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={aiSettings.temperature}
                onChange={(e) => updateAiSetting("temperature", parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>최대 토큰 ({aiSettings.maxTokens})</span>
                <span className={styles.settingDesc}>생성할 최대 텍스트 길이</span>
              </div>
              <input
                type="number"
                value={aiSettings.maxTokens}
                onChange={(e) => updateAiSetting("maxTokens", parseInt(e.target.value))}
                className={styles.input}
                min={100}
                max={8000}
                step={100}
              />
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>자동 SEO 최적화</span>
                <span className={styles.settingDesc}>생성된 콘텐츠 자동 SEO 최적화</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={aiSettings.autoSeoOptimize}
                  onChange={(e) => updateAiSetting("autoSeoOptimize", e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>자동 번역</span>
                <span className={styles.settingDesc}>생성된 콘텐츠 자동 번역 기능</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={aiSettings.autoTranslate}
                  onChange={(e) => updateAiSetting("autoTranslate", e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <div className={styles.buttonRow}>
              <button onClick={handleSaveAiSettings} className={styles.primaryBtn} disabled={saving}>
                <Sparkles size={16} />
                AI 설정 저장
              </button>
            </div>
          </section>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <section className={`${styles.section} glass-panel`}>
            <h2><Layout size={20} /> 테마</h2>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeBtn} ${theme === "auto" ? styles.themeBtnActive : ""}`}
                onClick={() => setTheme("auto")}
              >
                <Monitor size={24} />
                <span>자동</span>
                <small>시스템 설정에 따름</small>
              </button>
              <button
                className={`${styles.themeBtn} ${theme === "light" ? styles.themeBtnActive : ""}`}
                onClick={() => setTheme("light")}
              >
                <Sun size={24} />
                <span>라이트</span>
                <small>밝은 테마</small>
              </button>
              <button
                className={`${styles.themeBtn} ${theme === "dark" ? styles.themeBtnActive : ""}`}
                onClick={() => setTheme("dark")}
              >
                <Moon size={24} />
                <span>다크</span>
                <small>어두운 테마</small>
              </button>
            </div>
          </section>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <>
            <section className={`${styles.section} glass-panel`}>
              <h2><Key size={20} /> 비밀번호 변경</h2>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>현재 비밀번호</span>
                </div>
                <div className={styles.passwordInput}>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className={styles.eyeBtn}
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>새 비밀번호</span>
                </div>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.buttonRow}>
                <button onClick={handleChangePassword} className={styles.primaryBtn} disabled={saving}>
                  비밀번호 변경
                </button>
              </div>
            </section>

            <section className={`${styles.section} glass-panel ${styles.dangerSection}`}>
              <h2><RefreshCw size={20} /> 설정 관리</h2>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>설정 초기화</span>
                  <span className={styles.settingDesc}>모든 설정을 기본값으로 되돌립니다</span>
                </div>
                <button onClick={handleResetSettings} className={styles.dangerBtn}>
                  <RefreshCw size={16} />
                  초기화
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
