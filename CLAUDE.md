# quickfigure.net — 도구형 AdSense/CPA 수익 사이트

## 프로젝트 개요
- 영어+한국어 다국어 온라인 유틸리티 도구 사이트
- 수익 모델: Google AdSense (CPC/CPM) + CPA 제휴
- 목표: 100개 이상 유틸리티 도구 + 블로그 포스트 → SEO 트래픽 → 광고 수익
- 전략: 고CPC 영어 키워드(finance, health, dev) + 저경쟁 롱테일 키워드 우선

## 기술 스택
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- 배포: Vercel (main 브랜치 자동배포)
- 도메인: quickfigure.net (Namecheap)
- GitHub: woohacompany/quickfigure

## 프로젝트 구조
```
quickfigure/
├── app/
│   ├── [locale]/                  # 다국어 (en, ko)
│   │   ├── layout.tsx             # 로케일별 레이아웃
│   │   ├── page.tsx               # 홈페이지 (도구 목록)
│   │   ├── tools/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # 개별 도구 페이지
│   │   └── blog/
│   │       └── [slug]/
│   │           └── page.tsx       # 블로그 포스트
│   ├── layout.tsx                 # 루트 레이아웃 (AdSense 스크립트)
│   └── globals.css
├── components/
│   ├── ToolCard.tsx               # 도구 카드 컴포넌트
│   ├── AdBanner.tsx               # AdSense 광고 배너
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── SEOHead.tsx                # 메타태그 컴포넌트
├── lib/
│   ├── tools.ts                   # 도구 목록 데이터
│   ├── categories.ts              # 카테고리 정의
│   └── i18n.ts                    # 다국어 유틸
├── public/
│   ├── sitemap.xml
│   └── robots.txt
├── .claudeignore
├── CLAUDE.md                      # 이 파일
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 도구 페이지 생성 규칙 (핵심 패턴)

### 1. 도구 데이터 등록 (lib/tools.ts)
새 도구를 추가할 때 반드시 lib/tools.ts에 먼저 등록한다:
```typescript
{
  slug: "adsense-calculator",              // URL 슬러그 (영문, kebab-case)
  category: "finance",                     // 카테고리 (아래 목록 참조)
  icon: "💰",                              // 이모지 아이콘
  title: {
    en: "AdSense Revenue Calculator",      // 영문 제목 (H1, og:title)
    ko: "애드센스 수익 계산기"               // 한국어 제목
  },
  description: {
    en: "Estimate your Google AdSense earnings...",   // 영문 설명 (meta description, 150자 내외)
    ko: "구글 애드센스 예상 수익을 계산하세요..."       // 한국어 설명
  },
  keywords: {
    en: ["adsense calculator", "ad revenue estimator", "cpc calculator"],
    ko: ["애드센스 계산기", "광고 수익 계산", "CPC 계산"]
  }
}
```

### 2. 도구 페이지 구조 (app/[locale]/tools/[slug]/page.tsx)
모든 도구 페이지는 동일한 구조를 따른다:
```
┌─────────────────────────────────────┐
│  Header (네비게이션)                   │
├─────────────────────────────────────┤
│  H1: 도구 제목                        │
│  p: 도구 설명 (1~2줄)                  │
├─────────────────────────────────────┤
│  [AdSense 상단 배너 - 728x90]         │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  도구 UI (입력 + 결과)          │  │
│  │  - 입력 필드들                   │  │
│  │  - 계산/변환 버튼                │  │
│  │  - 결과 표시 영역                │  │
│  │  - 복사 버튼                    │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  [AdSense 중간 배너 - 반응형]         │
├─────────────────────────────────────┤
│  H2: How to Use / 사용 방법           │
│  (3~5 단계 설명)                      │
├─────────────────────────────────────┤
│  H2: FAQ (자주 묻는 질문)              │
│  (3~5개 Q&A, Schema.org FAQPage)     │
├─────────────────────────────────────┤
│  H2: Related Tools / 관련 도구         │
│  (같은 카테고리 도구 3~4개 카드)        │
├─────────────────────────────────────┤
│  [AdSense 하단 배너 - 반응형]          │
├─────────────────────────────────────┤
│  Footer                               │
└─────────────────────────────────────┘
```

### 3. SEO 필수 요소 (모든 도구 페이지에 반드시 포함)
- title 태그: "[도구명] - Free Online Tool | QuickFigure"
- meta description: 150자 내외, 핵심 키워드 포함
- H1: 페이지당 1개만
- H2: How to Use, FAQ, Related Tools
- Schema.org: FAQPage + WebApplication 구조화 데이터
- Open Graph: og:title, og:description, og:url, og:image
- canonical URL: https://quickfigure.net/[locale]/tools/[slug]
- hreflang: en ↔ ko 상호 참조

### 4. AdSense 배치 규칙
- 상단: 도구 설명 바로 아래, 도구 UI 위 (728x90 또는 반응형)
- 중간: 도구 UI와 사용법 설명 사이 (반응형)
- 하단: FAQ 아래, Footer 위 (반응형)
- 광고 컴포넌트: components/AdBanner.tsx 사용
- AdSense 퍼블리셔 ID: (발급 후 여기에 기입)
- 자동광고 스크립트: app/layout.tsx의 <head> 안

### 5. 카테고리 목록
```
finance    - 금융/재무 계산기 (고CPC: $2~$10)
health     - 건강/의료 계산기 (고CPC: $1~$8)
dev        - 개발자 도구 (중CPC: $0.5~$3)
text       - 텍스트 도구 (저CPC지만 고트래픽)
converter  - 단위 변환기 (저CPC지만 고트래픽)
math       - 수학 계산기 (중CPC: $0.5~$2)
image      - 이미지 도구 (중CPC)
date       - 날짜/시간 도구 (저CPC지만 고트래픽)
crypto     - 암호화/보안 도구 (중CPC)
seo        - SEO 도구 (고CPC: $1~$5)
```

### 6. 도구 제작 시 지켜야 할 코딩 규칙
- 모든 계산은 클라이언트에서 실행 ("use client")
- 외부 API 호출 없음 (빠른 로딩 + 무료 운영)
- 모바일 우선 반응형 디자인 (Tailwind breakpoints)
- 입력값 유효성 검사 필수
- 결과에 "복사" 버튼 포함
- 영문/한국어 UI 텍스트는 locale에 따라 분기
- 로딩 상태 불필요 (클라이언트 계산이라 즉시 반환)

## 새 도구 추가 절차 (Claude Code에게 요청 시)
1. lib/tools.ts에 도구 데이터 추가
2. app/[locale]/tools/[slug]/page.tsx 생성
3. 영문 + 한국어 버전 동시 지원
4. SEO 메타태그 + Schema.org 구조화 데이터
5. AdSense 배너 3개 배치
6. 사용법(How to Use) 섹션 작성
7. FAQ 3~5개 작성
8. 관련 도구 링크 연결

## 블로그 포스트 규칙
- 도구와 연계된 정보성 콘텐츠 (예: "How to Calculate AdSense Revenue" → adsense-calculator 도구 링크)
- 1,500자 이상 (영문 기준)
- H1 1개, H2 3~5개, 내부 링크 2개 이상
- 관련 도구 페이지로 CTA 포함

## 자주 쓰는 명령어
```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# 배포 (main push)
git add . && git commit -m "add: [도구명]" && git push origin main
```

## 주의사항
- 절대 서버 컴포넌트에서 useState/useEffect 사용하지 말 것
- AdSense 정책: 자동 클릭 유도 금지, 성인/도박/불법 콘텐츠 금지
- 이미지 최적화: next/image 사용, WebP 포맷 우선
- 페이지 속도: Core Web Vitals 통과 필수 (LCP < 2.5s)
