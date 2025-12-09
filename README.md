# JaBlog

AI 기반 블로그 콘텐츠 자동화 플랫폼

## 📖 소개

JaBlog는 블로그 콘텐츠 생성부터 발행까지 전 과정을 자동화하는 플랫폼입니다. AI 기반 콘텐츠 생성, 다중 플랫폼 동시 발행, 예약 발행, 키워드 분석 및 SEO 최적화 기능을 제공합니다.

## ✨ 주요 기능

| 기능                  | 설명                                                 |
| --------------------- | ---------------------------------------------------- |
| 📊 **대시보드**       | 조회수, 클릭수, AI 추천, 콘텐츠 현황 실시간 모니터링 |
| 🤖 **AI 콘텐츠 생성** | OpenAI, Anthropic, Gemini, Ollama 지원               |
| 📝 **콘텐츠 관리**    | 칸반 보드 기반 워크플로우 관리                       |
| 🚀 **자동 발행**      | WordPress, Tistory 동시 발행                         |
| 📅 **예약 발행**      | 캘린더 기반 예약 발행                                |
| 🔍 **키워드 분석**    | Google Trends 연동 트렌드 분석                       |
| 📈 **SEO 최적화**     | 콘텐츠 SEO 점수 자동 분석                            |
| 📉 **성과 분석**      | 플랫폼별 통계 및 분석                                |

## 🛠️ 기술 스택

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules
- **State Management**: React Hooks

### External APIs

- Google Trends API
- WordPress REST API
- Tistory Open API
- LLM APIs (OpenAI, Anthropic, Gemini, Ollama)

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- PostgreSQL
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/jablog.git
cd jablog

# 의존성 설치
npm install

# 환경 변수 설정
cp backend/.env.example backend/.env
# .env 파일에 데이터베이스 및 API 키 설정

# 데이터베이스 마이그레이션
cd backend
npx prisma migrate dev
npx prisma db seed

# 개발 서버 실행
npm run dev
```

### 실행

```bash
# 전체 프로젝트 실행 (루트에서)
npm run dev

# 또는 개별 실행
# 백엔드
cd backend && npm run start:dev

# 프론트엔드
cd frontend && npm run dev
```

### 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

## 📁 프로젝트 구조

```
jablog/
├── backend/                 # NestJS 백엔드
│   ├── src/
│   │   ├── ai/             # AI 콘텐츠 생성
│   │   ├── analytics/      # 성과 분석
│   │   ├── content/        # 콘텐츠 관리
│   │   ├── dashboard/      # 대시보드 API
│   │   ├── keywords/       # 키워드 분석
│   │   ├── pipeline/       # 발행 파이프라인
│   │   ├── publishing/     # WordPress/Tistory 발행
│   │   ├── schedule/       # 예약 발행
│   │   ├── seo/            # SEO 분석
│   │   ├── settings/       # 설정 관리
│   │   └── users/          # 사용자 관리
│   └── prisma/             # Prisma 스키마 및 마이그레이션
│
├── frontend/               # Next.js 프론트엔드
│   └── src/
│       ├── app/            # App Router 페이지
│       └── components/     # UI 컴포넌트
│
└── docs/                   # 사용자 가이드 문서
```

## 📚 문서

자세한 사용법은 [docs/](./docs/README.md) 폴더를 참조하세요.

| 문서                                                | 설명                     |
| --------------------------------------------------- | ------------------------ |
| [전체 사용자 가이드](./docs/user-guide.md)          | 서비스 개요 및 사용 방법 |
| [대시보드 가이드](./docs/dashboard-guide.md)        | 대시보드 화면 설명       |
| [자동 포스팅 가이드](./docs/auto-posting-guide.md)  | 발행 기능 사용법         |
| [키워드 가이드](./docs/keyword-guide.md)            | 키워드 분석 사용법       |
| [SEO 가이드](./docs/seo-guide.md)                   | SEO 최적화 가이드        |
| [오류 해결 가이드](./docs/troubleshooting-guide.md) | 문제 해결 방법           |
| [관리자 가이드](./docs/admin-guide.md)              | 시스템 운영 가이드       |

## ⚙️ 환경 변수

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jablog"

# JWT
JWT_SECRET="your-jwt-secret"

# AI APIs (선택)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

## 🔐 사용자 역할

| 역할   | 권한               |
| ------ | ------------------ |
| ADMIN  | 전체 시스템 관리   |
| EDITOR | 콘텐츠 관리 + 발행 |
| AUTHOR | 본인 콘텐츠 작성   |
| VIEWER | 읽기 전용          |

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 PR을 환영합니다!

---

_Made with ❤️ by JaBlog Team_
