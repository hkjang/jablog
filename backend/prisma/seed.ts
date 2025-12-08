import { PrismaClient, UserRole, ContentStatus, Platform, NotificationType, ReportType, ReportFormat } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  log: ['info'],
});

async function main() {
  console.log('🌱 Start seeding ...');

  // ============================================
  // 1. USERS
  // ============================================
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jablog.com' },
    update: {},
    create: {
      email: 'admin@jablog.com',
      password: hashedPassword,
      name: '관리자',
      role: UserRole.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      isActive: true,
      settings: {
        create: {
          notificationFrequency: 'REALTIME',
          emailNotifications: true,
          pushNotifications: true,
          targetViews: 5000,
          targetClickRate: 8.0,
          favoriteMenus: ['dashboard', 'analytics', 'settings'],
          darkMode: 'AUTO',
        },
      },
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@jablog.com' },
    update: {},
    create: {
      email: 'editor@jablog.com',
      password: hashedPassword,
      name: '김편집',
      role: UserRole.EDITOR,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
      isActive: true,
      settings: {
        create: {
          notificationFrequency: 'HOURLY',
          emailNotifications: true,
          pushNotifications: false,
          targetViews: 2000,
          targetClickRate: 5.0,
          favoriteMenus: ['content', 'pipeline'],
          darkMode: 'DARK',
        },
      },
    },
  });

  const marketer = await prisma.user.upsert({
    where: { email: 'marketer@jablog.com' },
    update: {},
    create: {
      email: 'marketer@jablog.com',
      password: hashedPassword,
      name: '박마케터',
      role: UserRole.MARKETER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marketer',
      isActive: true,
      settings: {
        create: {
          notificationFrequency: 'DAILY',
          emailNotifications: true,
          pushNotifications: true,
          targetViews: 10000,
          targetClickRate: 10.0,
          favoriteMenus: ['analytics', 'calendar'],
          darkMode: 'LIGHT',
        },
      },
    },
  });

  const techAdmin = await prisma.user.upsert({
    where: { email: 'tech@jablog.com' },
    update: {},
    create: {
      email: 'tech@jablog.com',
      password: hashedPassword,
      name: '이기술',
      role: UserRole.TECH_ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
      isActive: true,
      settings: {
        create: {
          notificationFrequency: 'REALTIME',
          emailNotifications: true,
          pushNotifications: true,
          targetViews: 3000,
          targetClickRate: 6.0,
          favoriteMenus: ['monitoring', 'settings'],
          darkMode: 'DARK',
        },
      },
    },
  });

  console.log(`  ✅ Created ${4} users`);

  // ============================================
  // 2. TOPICS & KEYWORDS
  // ============================================
  console.log('📚 Creating topics and keywords...');

  const topics = [
    {
      name: 'AI & 머신러닝',
      score: 95,
      keywords: [
        { text: 'ChatGPT', volume: 50000, competition: 0.9 },
        { text: 'GPT-4o', volume: 30000, competition: 0.85 },
        { text: '생성형 AI', volume: 25000, competition: 0.7 },
        { text: '프롬프트 엔지니어링', volume: 15000, competition: 0.6 },
        { text: 'AI 코딩', volume: 20000, competition: 0.75 },
      ],
    },
    {
      name: '웹개발',
      score: 88,
      keywords: [
        { text: 'Next.js 14', volume: 18000, competition: 0.65 },
        { text: 'React 서버 컴포넌트', volume: 12000, competition: 0.55 },
        { text: 'TypeScript 팁', volume: 22000, competition: 0.6 },
        { text: 'Tailwind CSS', volume: 28000, competition: 0.7 },
        { text: 'Prisma ORM', volume: 8000, competition: 0.4 },
      ],
    },
    {
      name: '클라우드 & DevOps',
      score: 82,
      keywords: [
        { text: 'Docker 입문', volume: 15000, competition: 0.5 },
        { text: 'Kubernetes', volume: 20000, competition: 0.75 },
        { text: 'AWS Lambda', volume: 12000, competition: 0.6 },
        { text: 'CI/CD 파이프라인', volume: 9000, competition: 0.45 },
        { text: 'Terraform', volume: 7000, competition: 0.5 },
      ],
    },
    {
      name: '모바일 개발',
      score: 75,
      keywords: [
        { text: 'Flutter 3', volume: 25000, competition: 0.65 },
        { text: 'React Native', volume: 30000, competition: 0.7 },
        { text: 'Swift UI', volume: 18000, competition: 0.55 },
        { text: 'Kotlin Multiplatform', volume: 8000, competition: 0.4 },
      ],
    },
    {
      name: '데이터 사이언스',
      score: 85,
      keywords: [
        { text: 'Python 데이터분석', volume: 35000, competition: 0.6 },
        { text: 'Pandas 튜토리얼', volume: 20000, competition: 0.5 },
        { text: '데이터 시각화', volume: 15000, competition: 0.45 },
        { text: 'SQL 최적화', volume: 12000, competition: 0.5 },
      ],
    },
    {
      name: '사이버 보안',
      score: 78,
      keywords: [
        { text: '해킹 방어', volume: 10000, competition: 0.55 },
        { text: 'OWASP Top 10', volume: 8000, competition: 0.4 },
        { text: '웹 보안', volume: 12000, competition: 0.5 },
        { text: '취약점 분석', volume: 6000, competition: 0.45 },
      ],
    },
  ];

  const createdTopics: Record<string, number> = {};
  const createdKeywords: Record<string, number> = {};

  for (const topicData of topics) {
    const topic = await prisma.topic.upsert({
      where: { name: topicData.name },
      update: { score: topicData.score },
      create: {
        name: topicData.name,
        score: topicData.score,
        keywords: {
          create: topicData.keywords,
        },
      },
      include: { keywords: true },
    });
    createdTopics[topic.name] = topic.id;
    topic.keywords.forEach(kw => {
      createdKeywords[kw.text] = kw.id;
    });

    // Create topic performance data for last 30 days
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      await prisma.topicPerformance.upsert({
        where: { topicId_date: { topicId: topic.id, date } },
        update: {},
        create: {
          topicId: topic.id,
          date,
          totalViews: Math.floor(Math.random() * 5000) + 1000,
          totalClicks: Math.floor(Math.random() * 500) + 50,
          avgRanking: Math.random() * 10 + 1,
          conversionRate: Math.random() * 5,
          publishCount: Math.floor(Math.random() * 5),
        },
      });
    }
  }

  console.log(`  ✅ Created ${Object.keys(createdTopics).length} topics with keywords`);

  // Create keyword trends for each keyword
  console.log('📈 Creating keyword trends...');
  const keywordIds = Object.values(createdKeywords);
  const today = new Date();
  
  for (const keywordId of keywordIds) {
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const trends = ['RISING', 'FALLING', 'STABLE'];
      
      await prisma.keywordTrend.upsert({
        where: { keywordId_date: { keywordId, date } },
        update: {},
        create: {
          keywordId,
          date,
          volume: Math.floor(Math.random() * 10000) + 5000,
          competition: Math.random() * 0.5 + 0.3,
          ranking: Math.floor(Math.random() * 50) + 1,
          trend: trends[Math.floor(Math.random() * 3)],
        },
      });
    }
  }

  console.log(`  ✅ Created keyword trends for ${keywordIds.length} keywords`);

  // ============================================
  // 3. CONTENTS
  // ============================================
  console.log('📝 Creating contents...');

  const contents = [
    {
      title: 'ChatGPT를 활용한 블로그 글쓰기 완벽 가이드',
      body: `# ChatGPT로 블로그 글쓰기\n\n## 서론\n블로그 글쓰기는 이제 AI와 함께 더욱 효율적으로 할 수 있습니다.\n\n## 본론\n1. 주제 선정\n2. 아웃라인 작성\n3. 초안 작성\n4. 편집 및 검토\n\n## 결론\nAI를 도구로 활용하면서도 자신만의 관점을 잃지 마세요.`,
      excerpt: 'AI를 활용한 효율적인 블로그 글쓰기 방법을 알아봅니다.',
      status: ContentStatus.PUBLISHED,
      platform: Platform.TISTORY,
      topic: 'AI & 머신러닝',
      seoScore: 92,
      views: 15420,
      clicks: 892,
      publishedAt: new Date('2024-11-15'),
    },
    {
      title: 'Next.js 14 App Router 완벽 정리',
      body: `# Next.js 14 App Router\n\n## 새로운 기능들\n- Server Components\n- Streaming\n- Parallel Routes\n\n## 마이그레이션 가이드\n기존 pages 디렉토리에서 app 디렉토리로 전환하는 방법을 설명합니다.`,
      excerpt: 'Next.js 14의 App Router 기능을 상세히 알아봅니다.',
      status: ContentStatus.PUBLISHED,
      platform: Platform.BOTH,
      topic: '웹개발',
      seoScore: 88,
      views: 8930,
      clicks: 567,
      publishedAt: new Date('2024-11-20'),
    },
    {
      title: 'Docker 컨테이너화 실전 가이드',
      body: `# Docker 실전 가이드\n\n## Docker란?\n컨테이너 기반의 가상화 기술입니다.\n\n## Dockerfile 작성법\n\`\`\`dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["npm", "start"]\n\`\`\``,
      excerpt: 'Docker를 활용한 애플리케이션 컨테이너화 방법을 배웁니다.',
      status: ContentStatus.SCHEDULED,
      platform: Platform.TISTORY,
      topic: '클라우드 & DevOps',
      seoScore: 85,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
    {
      title: 'Flutter 3.0 크로스플랫폼 앱 개발',
      body: `# Flutter 3.0 가이드\n\n## 왜 Flutter인가?\n- Hot Reload\n- 풍부한 위젯\n- 단일 코드베이스\n\n## 첫 앱 만들기\n\`\`\`dart\nimport 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(MyApp());\n}\n\`\`\``,
      excerpt: 'Flutter 3.0으로 iOS, Android 앱을 동시에 개발하는 방법',
      status: ContentStatus.REVIEW,
      platform: Platform.WORDPRESS,
      topic: '모바일 개발',
      seoScore: 78,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
    {
      title: 'Python Pandas로 데이터 분석 시작하기',
      body: `# Pandas 데이터 분석\n\n## Pandas 설치\n\`\`\`bash\npip install pandas\n\`\`\`\n\n## 기본 사용법\n\`\`\`python\nimport pandas as pd\ndf = pd.read_csv('data.csv')\ndf.head()\n\`\`\``,
      excerpt: 'Python Pandas 라이브러리를 활용한 데이터 분석 입문',
      status: ContentStatus.DRAFT,
      platform: Platform.TISTORY,
      topic: '데이터 사이언스',
      seoScore: 65,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
    {
      title: 'OWASP Top 10 보안 취약점 대응 가이드',
      body: `# OWASP Top 10\n\n## 주요 취약점\n1. Injection\n2. Broken Authentication\n3. Sensitive Data Exposure\n\n## 대응 방법\n각 취약점에 대한 대응 방법을 상세히 설명합니다.`,
      excerpt: '웹 애플리케이션 보안 취약점 Top 10과 대응 방법',
      status: ContentStatus.APPROVED,
      platform: Platform.BOTH,
      topic: '사이버 보안',
      seoScore: 82,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
    {
      title: 'TypeScript 고급 타입 활용법',
      body: `# TypeScript 고급 타입\n\n## Generic 타입\n\`\`\`typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\`\`\`\n\n## Utility Types\n- Partial<T>\n- Required<T>\n- Pick<T, K>`,
      excerpt: 'TypeScript의 고급 타입 기능을 마스터하세요',
      status: ContentStatus.PUBLISHED,
      platform: Platform.TISTORY,
      topic: '웹개발',
      seoScore: 90,
      views: 6780,
      clicks: 423,
      publishedAt: new Date('2024-11-25'),
    },
    {
      title: 'GPT-4o API 활용 완벽 가이드',
      body: `# GPT-4o API 가이드\n\n## API 키 발급\nOpenAI 공식 사이트에서 API 키를 발급받습니다.\n\n## 기본 사용법\n\`\`\`javascript\nconst response = await openai.chat.completions.create({\n  model: "gpt-4o",\n  messages: [{role: "user", content: "Hello!"}]\n});\n\`\`\``,
      excerpt: 'GPT-4o API를 활용한 AI 애플리케이션 개발',
      status: ContentStatus.PUBLISHED,
      platform: Platform.BOTH,
      topic: 'AI & 머신러닝',
      seoScore: 95,
      views: 23450,
      clicks: 1567,
      publishedAt: new Date('2024-11-28'),
    },
    {
      title: 'AWS Lambda 서버리스 아키텍처',
      body: `# AWS Lambda 가이드\n\n## 서버리스란?\n서버 관리 없이 코드를 실행할 수 있는 컴퓨팅 서비스입니다.\n\n## Lambda 함수 작성\n\`\`\`javascript\nexports.handler = async (event) => {\n  return { statusCode: 200, body: 'Hello!' };\n};\n\`\`\``,
      excerpt: 'AWS Lambda를 활용한 서버리스 아키텍처 구축',
      status: ContentStatus.SCHEDULED,
      platform: Platform.WORDPRESS,
      topic: '클라우드 & DevOps',
      seoScore: 86,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
    {
      title: 'React Native vs Flutter 비교 분석',
      body: `# 크로스플랫폼 프레임워크 비교\n\n## React Native\n- JavaScript 기반\n- 풍부한 생태계\n\n## Flutter\n- Dart 언어\n- 빠른 성능\n\n## 결론\n프로젝트 요구사항에 따라 선택하세요.`,
      excerpt: '두 크로스플랫폼 프레임워크의 장단점 비교',
      status: ContentStatus.PUBLISHED,
      platform: Platform.TISTORY,
      topic: '모바일 개발',
      seoScore: 84,
      views: 4560,
      clicks: 234,
      publishedAt: new Date('2024-11-22'),
    },
    {
      title: '프롬프트 엔지니어링 실전 테크닉',
      body: `# 프롬프트 엔지니어링\n\n## 기본 원칙\n1. 명확하게 작성하기\n2. 구조화된 출력 요청\n3. 예시 제공하기\n\n## 고급 테크닉\n- Chain of Thought\n- Few-shot Learning\n- Role Playing`,
      excerpt: 'AI를 효과적으로 활용하기 위한 프롬프트 작성 기법',
      status: ContentStatus.DRAFT,
      platform: Platform.BOTH,
      topic: 'AI & 머신러닝',
      seoScore: 72,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
    {
      title: 'SQL 성능 최적화 필수 가이드',
      body: `# SQL 최적화\n\n## 인덱스 활용\n적절한 인덱스 설계가 성능의 핵심입니다.\n\n## 쿼리 최적화\n\`\`\`sql\n-- Bad\nSELECT * FROM users WHERE name LIKE '%kim%'\n\n-- Good\nSELECT id, name FROM users WHERE name LIKE 'kim%'\n\`\`\``,
      excerpt: 'SQL 쿼리 성능을 극대화하는 최적화 기법',
      status: ContentStatus.REVIEW,
      platform: Platform.TISTORY,
      topic: '데이터 사이언스',
      seoScore: 80,
      views: 0,
      clicks: 0,
      publishedAt: null,
    },
  ];

  const createdContents: number[] = [];
  const users = [admin, editor, marketer, techAdmin];

  for (const contentData of contents) {
    const topicId = createdTopics[contentData.topic];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const content = await prisma.content.upsert({
      where: { id: contentData.title.length }, // Unique enough for demo
      update: {},
      create: {
        title: contentData.title,
        body: contentData.body,
        excerpt: contentData.excerpt,
        status: contentData.status,
        platform: contentData.platform,
        authorId: randomUser.id,
        topicId,
        seoScore: contentData.seoScore,
        views: contentData.views,
        clicks: contentData.clicks,
        avgTimeOnPage: Math.random() * 180 + 60,
        bounceRate: Math.random() * 40 + 20,
        metaTitle: contentData.title,
        metaDescription: contentData.excerpt,
        publishedAt: contentData.publishedAt,
        seoIssues: contentData.seoScore < 80 
          ? ['메타 설명 최적화 필요', '이미지 alt 태그 누락'] 
          : [],
      },
    });
    createdContents.push(content.id);
  }

  console.log(`  ✅ Created ${createdContents.length} contents`);

  // ============================================
  // 4. CONTENT ANALYTICS
  // ============================================
  console.log('📊 Creating content analytics...');

  // Only for published contents
  const publishedContents = await prisma.content.findMany({
    where: { status: ContentStatus.PUBLISHED },
  });

  for (const content of publishedContents) {
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await prisma.contentAnalytics.upsert({
        where: { contentId_date: { contentId: content.id, date } },
        update: {},
        create: {
          contentId: content.id,
          date,
          views: Math.floor(Math.random() * 1000) + 100,
          uniqueVisitors: Math.floor(Math.random() * 800) + 80,
          pageViews: Math.floor(Math.random() * 1200) + 120,
          avgTimeOnPage: Math.random() * 180 + 60,
          bounceRate: Math.random() * 40 + 20,
          scrollDepth: Math.random() * 40 + 50,
          organicTraffic: Math.floor(Math.random() * 500) + 50,
          directTraffic: Math.floor(Math.random() * 200) + 20,
          referralTraffic: Math.floor(Math.random() * 150) + 15,
          socialTraffic: Math.floor(Math.random() * 100) + 10,
          clicks: Math.floor(Math.random() * 100) + 10,
          clickRate: Math.random() * 8 + 2,
          conversions: Math.floor(Math.random() * 20),
          revenue: Math.random() * 50,
        },
      });
    }
  }

  console.log(`  ✅ Created analytics for ${publishedContents.length} published contents`);

  // ============================================
  // 5. SCHEDULED POSTS
  // ============================================
  console.log('📅 Creating scheduled posts...');

  const scheduledContents = await prisma.content.findMany({
    where: { status: ContentStatus.SCHEDULED },
  });

  for (const content of scheduledContents) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7) + 1);
    futureDate.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0);

    await prisma.scheduledPost.create({
      data: {
        contentId: content.id,
        platform: content.platform,
        scheduledFor: futureDate,
        status: 'PENDING',
        retryCount: 0,
      },
    });
  }

  console.log(`  ✅ Created ${scheduledContents.length} scheduled posts`);

  // ============================================
  // 6. PUBLISHING LOGS
  // ============================================
  console.log('📤 Creating publishing logs...');

  for (const content of publishedContents) {
    await prisma.publishingLog.create({
      data: {
        contentId: content.id,
        platform: content.platform,
        status: 'SUCCESS',
        externalId: `ext-${content.id}-${Date.now()}`,
        externalUrl: `https://example.tistory.com/${content.id}`,
        retryCount: 0,
        responseData: { success: true, postId: content.id },
      },
    });
  }

  console.log(`  ✅ Created ${publishedContents.length} publishing logs`);

  // ============================================
  // 7. EDIT HISTORY
  // ============================================
  console.log('📜 Creating edit history...');

  for (const content of publishedContents) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    await prisma.editHistory.createMany({
      data: [
        {
          contentId: content.id,
          userId: randomUser.id,
          action: 'CREATE',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          contentId: content.id,
          userId: randomUser.id,
          action: 'UPDATE',
          field: 'body',
          oldValue: '이전 내용...',
          newValue: '수정된 내용...',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          contentId: content.id,
          userId: randomUser.id,
          action: 'STATUS_CHANGE',
          field: 'status',
          oldValue: 'DRAFT',
          newValue: 'REVIEW',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          contentId: content.id,
          userId: randomUser.id,
          action: 'PUBLISH',
          field: 'status',
          oldValue: 'APPROVED',
          newValue: 'PUBLISHED',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  console.log(`  ✅ Created edit history records`);

  // ============================================
  // 8. API ERROR LOGS
  // ============================================
  console.log('🚨 Creating API error logs...');

  const apiErrors = [
    {
      platform: Platform.TISTORY,
      endpoint: '/api/posts',
      method: 'POST',
      statusCode: 401,
      errorMessage: 'Access token expired',
      resolved: true,
    },
    {
      platform: Platform.WORDPRESS,
      endpoint: '/wp-json/wp/v2/posts',
      method: 'POST',
      statusCode: 500,
      errorMessage: 'Internal server error',
      resolved: false,
    },
    {
      platform: Platform.TISTORY,
      endpoint: '/api/posts',
      method: 'POST',
      statusCode: 429,
      errorMessage: 'Rate limit exceeded',
      resolved: true,
    },
    {
      platform: Platform.WORDPRESS,
      endpoint: '/wp-json/wp/v2/media',
      method: 'POST',
      statusCode: 413,
      errorMessage: 'Request entity too large',
      resolved: false,
    },
  ];

  for (const error of apiErrors) {
    await prisma.apiErrorLog.create({
      data: {
        ...error,
        requestData: { sample: 'request data' },
        responseData: { error: error.errorMessage },
        retryCount: Math.floor(Math.random() * 3),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`  ✅ Created ${apiErrors.length} API error logs`);

  // ============================================
  // 9. NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating notifications...');

  const notifications = [
    {
      userId: admin.id,
      type: NotificationType.PUBLISH_SUCCESS,
      title: '발행 완료',
      message: '"ChatGPT를 활용한 블로그 글쓰기 완벽 가이드" 글이 성공적으로 발행되었습니다.',
      read: true,
    },
    {
      userId: admin.id,
      type: NotificationType.API_ERROR,
      title: 'API 오류 발생',
      message: 'Tistory API에서 인증 오류가 발생했습니다. 토큰을 갱신해주세요.',
      read: false,
    },
    {
      userId: editor.id,
      type: NotificationType.SEO_WARNING,
      title: 'SEO 점수 낮음',
      message: '"프롬프트 엔지니어링 실전 테크닉" 글의 SEO 점수가 80점 미만입니다.',
      read: false,
    },
    {
      userId: editor.id,
      type: NotificationType.SCHEDULE_REMINDER,
      title: '예약 발행 알림',
      message: '내일 오전 10시에 "Docker 컨테이너화 실전 가이드" 글이 발행될 예정입니다.',
      read: false,
    },
    {
      userId: marketer.id,
      type: NotificationType.KEYWORD_ALERT,
      title: '키워드 트렌드 상승',
      message: '"ChatGPT" 키워드의 검색량이 지난 주 대비 50% 상승했습니다.',
      read: true,
    },
    {
      userId: marketer.id,
      type: NotificationType.PUBLISH_SUCCESS,
      title: '발행 완료',
      message: '"GPT-4o API 활용 완벽 가이드" 글이 Tistory와 WordPress에 동시 발행되었습니다.',
      read: false,
    },
    {
      userId: techAdmin.id,
      type: NotificationType.API_ERROR,
      title: 'WordPress API 오류',
      message: 'WordPress API에서 500 에러가 발생했습니다. 서버 상태를 확인해주세요.',
      read: false,
    },
    {
      userId: techAdmin.id,
      type: NotificationType.SYSTEM,
      title: '시스템 업데이트',
      message: '새로운 기능이 추가되었습니다: 콘텐츠 중복 감지 기능',
      read: true,
    },
    {
      userId: admin.id,
      type: NotificationType.DUPLICATE_DETECTED,
      title: '중복 콘텐츠 감지',
      message: '작성 중인 글과 기존 글 사이에 유사도가 높습니다. 확인해주세요.',
      read: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: {
        ...notification,
        data: { source: 'seed' },
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`  ✅ Created ${notifications.length} notifications`);

  // ============================================
  // 10. REPORTS
  // ============================================
  console.log('📋 Creating reports...');

  const reports = [
    {
      type: ReportType.WEEKLY,
      format: ReportFormat.PDF,
      title: '주간 블로그 성과 리포트 - 2024년 11월 4주차',
      dateFrom: new Date('2024-11-18'),
      dateTo: new Date('2024-11-24'),
    },
    {
      type: ReportType.MONTHLY,
      format: ReportFormat.CSV,
      title: '월간 블로그 성과 리포트 - 2024년 11월',
      dateFrom: new Date('2024-11-01'),
      dateTo: new Date('2024-11-30'),
    },
    {
      type: ReportType.CUSTOM,
      format: ReportFormat.JSON,
      title: 'AI 토픽 성과 분석 리포트',
      dateFrom: new Date('2024-11-01'),
      dateTo: new Date('2024-11-30'),
    },
  ];

  for (const report of reports) {
    await prisma.report.create({
      data: {
        ...report,
        data: {
          totalViews: Math.floor(Math.random() * 100000) + 10000,
          totalClicks: Math.floor(Math.random() * 10000) + 1000,
          avgClickRate: Math.random() * 10 + 2,
          topContent: 'ChatGPT를 활용한 블로그 글쓰기 완벽 가이드',
        },
        filePath: `/reports/${report.type.toLowerCase()}_${Date.now()}.${report.format.toLowerCase()}`,
      },
    });
  }

  console.log(`  ✅ Created ${reports.length} reports`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   👤 Users: 4 (admin, editor, marketer, tech_admin)`);
  console.log(`   📚 Topics: ${Object.keys(createdTopics).length}`);
  console.log(`   🔑 Keywords: ${Object.keys(createdKeywords).length}`);
  console.log(`   📝 Contents: ${contents.length}`);
  console.log(`   📅 Scheduled Posts: ${scheduledContents.length}`);
  console.log(`   🔔 Notifications: ${notifications.length}`);
  console.log(`   📋 Reports: ${reports.length}`);
  console.log('\n🔐 Login Credentials:');
  console.log('   Email: admin@jablog.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
