import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";
import { TOOL_SLUGS } from "@/lib/tools";

const categorySlugs: Record<string, readonly string[]> = {
  "💰": [
    "compound-interest-calculator", "mortgage-calculator", "retirement-calculator",
    "emergency-fund-calculator", "freelancer-tax-calculator", "salary-calculator",
    "loan-calculator", "vat-calculator", "severance-calculator", "rent-conversion-calculator",
    "hourly-wage-calculator", "discount-calculator", "electricity-calculator",
    "weekly-holiday-pay-calculator", "weekly-pay-calculator", "annual-leave-calculator",
    "unemployment-calculator", "acquisition-tax-calculator", "income-tax-calculator",
    "car-tax-calculator", "capital-gains-tax-calculator", "loan-comparison-calculator",
    "inheritance-tax-calculator", "dsr-calculator", "accident-settlement-calculator",
    "national-pension-calculator", "roi-calculator", "currency-converter",
    "jeonse-vs-wolse-calculator", "year-end-tax-calculator",
  ],
  "📄": [
    "pdf-merger", "pdf-splitter", "pdf-to-word", "word-to-pdf", "pdf-compressor",
    "pdf-to-jpg", "pdf-to-excel", "excel-to-pdf", "excel-merge", "image-to-pdf",
  ],
  "🖼️": [
    "image-resizer", "image-compressor", "image-converter", "image-upscaler",
    "image-cropper", "image-kb-resizer", "image-watermark", "image-rotate",
    "image-to-svg", "gif-maker",
  ],
  "💻": [
    "json-formatter", "base64-encoder-decoder", "markdown-editor", "uuid-generator",
    "regex-tester", "hash-generator", "url-encoder-decoder", "css-gradient-generator",
  ],
  "❤️": [
    "bmi-calculator", "calorie-calculator", "age-calculator", "sleep-calculator",
    "alcohol-calculator", "body-fat-calculator",
  ],
  "📅": [
    "dday-calculator", "date-calculator", "gpa-calculator", "timer", "world-clock",
    "schedule-finder", "symbol-copy-paste", "qr-code-generator", "color-picker",
    "unit-converter", "percentage-calculator", "area-converter", "random-number-generator",
    "typing-speed-test", "word-counter", "case-converter", "text-diff",
    "lorem-ipsum-generator", "password-generator", "ladder-game",
  ],
};

function categoryCount(icon: string): number {
  const slugs = categorySlugs[icon];
  if (!slugs) return 0;
  const valid = new Set<string>(TOOL_SLUGS);
  return slugs.filter((s) => valid.has(s)).length;
}

function withCount(template: string, count: number): string {
  return template.replace(/\{count\}/g, String(count));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).about;
  const toolCount = TOOL_SLUGS.length;
  return {
    title: t.metaTitle,
    description: withCount(t.metaDescription, toolCount),
    alternates: {
      canonical: `/${lang}/about`,
      languages: { en: "/en/about", ko: "/ko/about", "x-default": "/en/about" },
    },
    openGraph: {
      title: t.metaTitle,
      description: withCount(t.metaDescription, toolCount),
      type: "website",
    },
  };
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

const valueIcons: Record<string, () => React.ReactElement> = {
  shield: ShieldIcon,
  zap: ZapIcon,
  heart: HeartIcon,
  globe: GlobeIcon,
};

const avatarColors: Record<string, string> = {
  SJ: "bg-blue-600",
  HE: "bg-purple-600",
  MJ: "bg-emerald-600",
  YR: "bg-orange-500",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) return null;
  const t = getDictionary(lang).about;
  const toolCount = TOOL_SLUGS.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* ── Hero ── */}
      <section className="text-center space-y-5">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-900">
          {withCount(t.hero.badge, toolCount)}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight whitespace-pre-line leading-tight">
          {t.hero.headline}
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
          {t.hero.sub}
        </p>
      </section>

      {/* ── Our Story ── */}
      <section className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{t.story.heading}</h2>
        <div className="space-y-3 text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>{t.story.p1}</p>
          <p>{t.story.p2}</p>
          <p>{withCount(t.story.p3, toolCount)}</p>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-center">{t.team.heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {t.team.members.map((m: { name: string; role: string; bio: string; avatar: string }) => (
            <div
              key={m.avatar}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full ${avatarColors[m.avatar] ?? "bg-neutral-500"} flex items-center justify-center text-white text-lg font-bold shrink-0`}
                >
                  {m.avatar}
                </div>
                <div>
                  <p className="font-semibold text-lg">{m.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{m.role}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-center">{t.values.heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {t.values.items.map((v: { icon: string; title: string; desc: string }) => {
            const Icon = valueIcons[v.icon] ?? ShieldIcon;
            return (
              <div key={v.icon} className="flex gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                <div className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                  <Icon />
                </div>
                <div>
                  <p className="font-semibold mb-1">{v.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Tool Categories ── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{t.toolCategories.heading}</h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            {withCount(t.toolCategories.sub, toolCount)}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.toolCategories.items.map((cat: { icon: string; name: string; desc: string }) => {
            const count = categoryCount(cat.icon);
            const countLabel = lang === "ko" ? `${count}개` : `${count} tools`;
            return (
              <div
                key={cat.name}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{countLabel}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">{t.cta.heading}</h2>
        <p className="text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto text-sm leading-relaxed">
          {t.cta.desc}
        </p>
        <Link
          href={`/${lang}/contact`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors duration-200"
        >
          {t.cta.button}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

      {/* ── Tech Stack ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-center text-neutral-500 dark:text-neutral-400">
          {t.techStack.heading}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {t.techStack.items.map((s: { name: string; desc: string }) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm"
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-neutral-400 dark:text-neutral-500">·</span>
              <span className="text-neutral-500 dark:text-neutral-400">{s.desc}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
