import type { Locale } from "./dictionaries";
import type { BlogPost } from "./blog";

export type AuthorId = "seokjun" | "haeun" | "minjae" | "yuri";

export interface Author {
  id: AuthorId;
  initials: string;
  name: { en: string; ko: string };
  bio: { en: string; ko: string };
  color: string; // Tailwind bg class
  textColor: string; // Tailwind text class for contrast on avatar
}

export const authors: Record<AuthorId, Author> = {
  seokjun: {
    id: "seokjun",
    initials: "SJ",
    name: { en: "Seokjun", ko: "석준" },
    bio: {
      en: "Founder of QuickFigure. Building tools that make complex calculations and document tasks simple for everyone.",
      ko: "QuickFigure 대표. 복잡한 계산과 문서 작업을 누구나 쉽게 할 수 있도록 도구를 만듭니다.",
    },
    color: "bg-blue-600",
    textColor: "text-white",
  },
  haeun: {
    id: "haeun",
    initials: "HE",
    name: { en: "Haeun", ko: "하은" },
    bio: {
      en: "Content editor. Making everyday tool guides easy and fun to follow.",
      ko: "콘텐츠 에디터. 일상에서 자주 쓰는 도구의 활용법을 쉽고 재미있게 전달합니다.",
    },
    color: "bg-purple-600",
    textColor: "text-white",
  },
  minjae: {
    id: "minjae",
    initials: "MJ",
    name: { en: "Minjae", ko: "민재" },
    bio: {
      en: "Developer & tech writer. Deep dives into dev tools and file conversion technology.",
      ko: "개발자 겸 테크 라이터. 개발 도구와 파일 변환 기술을 깊이 있게 다룹니다.",
    },
    color: "bg-emerald-600",
    textColor: "text-white",
  },
  yuri: {
    id: "yuri",
    initials: "YR",
    name: { en: "Yuri", ko: "유리" },
    bio: {
      en: "Real estate & finance editor. Breaking down calculations for homebuying and wealth management.",
      ko: "부동산·재테크 전문 에디터. 내 집 마련과 자산 관리에 필요한 계산법을 정리합니다.",
    },
    color: "bg-orange-500",
    textColor: "text-white",
  },
};

// ── Slug → Author mapping ──
// Finance (tax, loan, salary, retirement, year-end tax, income tax, etc.) → seokjun
// Lifestyle/health/date/utility (BMI, sleep, age, word-counter, symbols, D-Day, etc.) → haeun
// Dev tools + image/file tools (JSON, Base64, PDF, image, etc.) → minjae
// Real estate / investment (jeonse, acquisition tax, DSR, rent conversion, etc.) → yuri

const slugAuthorMap: Record<string, AuthorId> = {
  // ── 유리 (Yuri) — 부동산/투자 ──
  "jeonse-vs-wolse-guide": "yuri",
  "rent-conversion-guide": "yuri",
  "acquisition-tax-guide": "yuri",
  "dsr-guide": "yuri",
  "area-guide": "yuri",
  "mortgage-calculator-guide": "yuri",
  "mortgage-refinance-guide-2026": "yuri",
  "pay-off-mortgage-faster": "yuri",
  "roi-calculator-investment-guide": "yuri",
  "capital-gains-guide": "yuri",
  "capital-gains-tax-guide": "yuri",
  "how-to-calculate-net-worth": "yuri",

  // ── 민재 (Minjae) — 개발자 도구 + 이미지/파일 ──
  "json-formatting-best-practices": "minjae",
  "json-formatter-guide": "minjae",
  "understanding-base64-encoding": "minjae",
  "base64-encoding-guide": "minjae",
  "how-to-create-strong-passwords": "minjae",
  "hex-to-rgb-color-converter-guide": "minjae",
  "color-picker-guide": "minjae",
  "markdown-guide": "minjae",
  "text-diff-guide": "minjae",
  "uuid-generator-guide": "minjae",
  "regex-tester-guide": "minjae",
  "hash-generator-guide": "minjae",
  "url-encoder-guide": "minjae",
  "css-gradient-guide": "minjae",
  "pdf-to-word-guide": "minjae",
  "pdf-compress-guide": "minjae",
  "pdf-to-excel-conversion-guide": "minjae",
  "excel-merge-guide": "minjae",
  "excel-to-pdf-conversion-guide": "minjae",
  "image-upscale-guide": "minjae",
  "image-crop-guide": "minjae",
  "image-kb-guide": "minjae",
  "watermark-guide": "minjae",
  "how-to-make-gif-from-images": "minjae",
  "how-to-rotate-images-online": "minjae",
  "image-to-vector-svg-complete-guide": "minjae",

  // ── 하은 (Haeun) — 생활/건강/날짜/유틸리티 ──
  "bmi-calculator-guide": "haeun",
  "bmr-vs-bmi-difference": "haeun",
  "calorie-calculator-guide": "haeun",
  "calories-to-lose-weight": "haeun",
  "body-fat-guide": "haeun",
  "age-calculator-guide": "haeun",
  "korean-age-vs-international-age": "haeun",
  "sleep-guide": "haeun",
  "alcohol-guide": "haeun",
  "dday-guide": "haeun",
  "date-guide": "haeun",
  "gpa-guide": "haeun",
  "how-to-count-words-in-essay": "haeun",
  "word-counter-guide": "haeun",
  "text-case-conversion-guide": "haeun",
  "copy-paste-symbols-special-characters": "haeun",
  "special-characters-for-sns": "haeun",
  "special-characters-keyboard-shortcut": "haeun",
  "character-count-guide": "haeun",
  "lorem-ipsum-history-and-usage": "haeun",
  "how-to-create-qr-code-free": "haeun",
  "unit-converter-guide": "haeun",
  "percentage-calculator-guide": "haeun",
  "pomodoro-guide": "haeun",
  "world-clock-guide": "haeun",
  "world-time-converter-guide": "haeun",
  "ladder-game-online-guide": "haeun",
  "schedule-finder-meeting-time-guide": "haeun",
  "typing-speed-test-guide": "haeun",
  "electricity-guide": "seokjun",

  // ── 석준 (Seokjun) — 금융 (세금, 대출, 연봉, 퇴직금 등) ──
  "compound-interest-calculator-guide": "seokjun",
  "simple-vs-compound-interest": "seokjun",
  "retirement-savings-calculator-guide": "seokjun",
  "emergency-fund-calculator-guide": "seokjun",
  "emergency-fund-how-much-to-save": "seokjun",
  "freelancer-tax-calculator-guide": "seokjun",
  "freelancer-tax-guide": "seokjun",
  "salary-calculator-guide": "seokjun",
  "salary-guide": "seokjun",
  "loan-calculator-guide": "seokjun",
  "loan-comparison-guide": "seokjun",
  "vat-guide": "seokjun",
  "severance-guide": "seokjun",
  "wage-guide": "seokjun",
  "discount-calculator-guide": "seokjun",
  "weekly-pay-guide": "seokjun",
  "weekly-holiday-pay-guide": "seokjun",
  "annual-leave-guide": "seokjun",
  "unemployment-guide": "seokjun",
  "income-tax-guide": "seokjun",
  "car-tax-guide": "seokjun",
  "policy-fund-guide": "seokjun",
  "small-business-policy-fund-2026": "seokjun",
  "personal-rehabilitation-guide": "seokjun",
  "car-insurance-comparison-2026": "seokjun",
  "credit-score-improvement-guide": "seokjun",
  "inheritance-tax-guide": "seokjun",
  "accident-settlement-guide": "seokjun",
  "national-pension-guide": "seokjun",
  "year-end-tax-guide": "seokjun",
  "currency-converter-exchange-rate-guide": "seokjun",
  "random-number-generator-guide": "seokjun",
};

export function getPostAuthorId(slug: string): AuthorId {
  return slugAuthorMap[slug] ?? "seokjun";
}

export function getPostAuthor(slug: string): Author {
  return authors[getPostAuthorId(slug)];
}

export function getAuthorPosts(
  authorId: AuthorId,
  allPosts: BlogPost[],
  excludeSlug?: string,
  limit = 3
): BlogPost[] {
  return allPosts
    .filter((p) => getPostAuthorId(p.slug) === authorId && p.slug !== excludeSlug)
    .slice(0, limit);
}
