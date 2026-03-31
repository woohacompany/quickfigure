import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import {
  blogPosts,
  getPostBySlug,
  getPostOgImage,
  categoryLabels,
  type ContentBlock,
} from "@/lib/blog";
import BlogHeroImage from "@/components/BlogHeroImage";
import EmbedTool from "@/components/EmbedTools";
import EmailSubscribeBlog from "./EmailSubscribeBlog";

export function generateStaticParams() {
  return blogPosts.flatMap((post) => [
    { lang: "en", slug: post.slug },
    { lang: "ko", slug: post.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) return {};
  const post = getPostBySlug(slug);
  if (!post) return {};
  const tr = post.translations[lang];
  const ogImageUrl = post.heroImages?.[0]
    ? `${post.heroImages[0]}?w=1200&h=630&q=80&auto=format&fit=crop`
    : `https://quickfigure.net${getPostOgImage(slug)}`;
  return {
    title: tr.title + " | QuickFigure",
    description: tr.summary,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages: { en: `/en/blog/${slug}`, ko: `/ko/blog/${slug}`, "x-default": `/en/blog/${slug}` },
    },
    openGraph: {
      title: tr.title,
      description: tr.summary,
      type: "article",
      publishedTime: post.date,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.thumbnailAlt[lang],
        },
      ],
    },
  };
}

function ContentRenderer({
  blocks,
  lang,
}: {
  blocks: ContentBlock[];
  lang: Locale;
}) {
  const t = getDictionary(lang).blog;

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="mb-5 leading-relaxed text-neutral-700 dark:text-neutral-300">
                {block.text}
              </p>
            );
          case "heading":
            return (
              <h2 key={i} className="text-xl font-semibold mt-8 mb-4">
                {block.text}
              </h2>
            );
          case "list":
            return (
              <ul key={i} className="mb-5 space-y-2 pl-5">
                {block.items!.map((item, j) => (
                  <li
                    key={j}
                    className="list-disc text-neutral-700 dark:text-neutral-300 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={i}
                className="mb-5 p-4 rounded-lg bg-neutral-900 dark:bg-neutral-950 text-neutral-100 text-sm overflow-x-auto font-mono leading-relaxed"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "callout":
            return (
              <div
                key={i}
                className="mb-5 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-neutral-700 dark:text-neutral-300 leading-relaxed"
              >
                {block.text}
              </div>
            );
          case "cta":
            return (
              <div
                key={i}
                className="mb-5 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-center"
              >
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  {t.tryTool}
                </p>
                <Link
                  href={`/${lang}/tools/${block.tool}`}
                  className="inline-block px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {block.toolName} &rarr;
                </Link>
              </div>
            );
          case "embed":
            return (
              <div key={i} className="mb-5">
                <EmbedTool tool={block.tool || ""} lang={lang} />
              </div>
            );
          case "faq":
            return (
              <section
                key={i}
                className="mb-5"
                itemScope
                itemType="https://schema.org/FAQPage"
              >
                <h2 className="text-xl font-semibold mt-8 mb-4">{t.faq}</h2>
                <div className="space-y-4">
                  {block.faqItems!.map((item, j) => (
                    <div
                      key={j}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
                      itemScope
                      itemProp="mainEntity"
                      itemType="https://schema.org/Question"
                    >
                      <h3 className="font-medium mb-2" itemProp="name">
                        {item.question}
                      </h3>
                      <div
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <p
                          className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
                          itemProp="text"
                        >
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isValidLocale(lang)) notFound();

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const locale = lang as Locale;
  const tr = post.translations[locale];
  const t = getDictionary(locale).blog;

  const relatedPosts = post.relatedPosts
    .map((s) => getPostBySlug(s))
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        {/* Main Content */}
        <article className="min-w-0">
          {/* Breadcrumb */}
          <nav className="text-sm text-neutral-400 mb-6">
            <Link href={`/${lang}`} className="hover:text-foreground transition-colors">
              {getDictionary(locale).nav.home}
            </Link>
            {" / "}
            <Link href={`/${lang}/blog`} className="hover:text-foreground transition-colors">
              {t.title}
            </Link>
            {" / "}
            <span className="text-foreground">{tr.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                {categoryLabels[post.category][locale]}
              </span>
              <time className="text-sm text-neutral-400">{post.date}</time>
              <span className="text-sm text-neutral-400">
                {post.readingTime} {t.minRead}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              {tr.title}
            </h1>
            <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400">
              {tr.summary}
            </p>
          </header>

          <div className="mb-8">
            <BlogHeroImage category={post.category} alt={post.thumbnailAlt[locale]} size="large" heroImages={post.heroImages} />
          </div>

          {/* Ad placeholder */}
          {/* <div className="mb-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

          {/* Content */}
          <div className="prose-custom">
            <ContentRenderer blocks={tr.content} lang={locale} />
          </div>

          {/* Ad placeholder - mid content */}
          {/* <div className="my-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

          {/* Related Tools CTA */}
          {post.relatedTools.length > 0 && (
            <section className="mt-10 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">&#9654;</span>
                {t.toolCta}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {post.relatedTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/${lang}/tools/${tool.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name[locale]}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
                      {t.toolCtaButton} &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Email Subscribe */}
          <EmailSubscribeBlog lang={lang} />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold mb-5">{t.youMightAlsoLike}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((rp) => {
                  if (!rp) return null;
                  const rtr = rp.translations[locale];
                  return (
                    <Link
                      key={rp.slug}
                      href={`/${lang}/blog/${rp.slug}`}
                      className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
                    >
                      <span className="text-xs text-neutral-400">{rp.date}</span>
                      <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rtr.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>

        {/* Sticky Sidebar - Desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            {/* Quick Tools */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="font-semibold text-sm mb-3">{t.quickTools}</h3>
              <ul className="space-y-2">
                {post.relatedTools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/${lang}/tools/${tool.slug}`}
                      className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span className="text-xs">&#9654;</span>
                      {tool.name[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* All Tools */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="font-semibold text-sm mb-3">{t.allTools}</h3>
              <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                {[
                  { slug: "word-counter", name: { en: "Word Counter", ko: "글자수 세기" } },
                  { slug: "case-converter", name: { en: "Case Converter", ko: "대소문자 변환" } },
                  { slug: "json-formatter", name: { en: "JSON Formatter", ko: "JSON 포맷터" } },
                  { slug: "password-generator", name: { en: "Password Generator", ko: "비밀번호 생성기" } },
                  { slug: "base64-encoder-decoder", name: { en: "Base64 Encoder/Decoder", ko: "Base64 인코더/디코더" } },
                  { slug: "lorem-ipsum-generator", name: { en: "Lorem Ipsum Generator", ko: "Lorem Ipsum 생성기" } },
                  { slug: "compound-interest-calculator", name: { en: "Compound Interest Calculator", ko: "복리 계산기" } },
                  { slug: "mortgage-calculator", name: { en: "Mortgage Calculator", ko: "모기지 계산기" } },
                  { slug: "retirement-calculator", name: { en: "Retirement Savings Calculator", ko: "은퇴 저축 계산기" } },
                  { slug: "emergency-fund-calculator", name: { en: "Emergency Fund Calculator", ko: "비상자금 계산기" } },
                  { slug: "bmi-calculator", name: { en: "BMI Calculator", ko: "BMI 계산기" } },
                  { slug: "calorie-calculator", name: { en: "Calorie Calculator", ko: "칼로리 계산기" } },
                  { slug: "age-calculator", name: { en: "Age Calculator", ko: "나이 계산기" } },
                  { slug: "symbol-copy-paste", name: { en: "Symbol & Emoji Copy Paste", ko: "특수기호 & 이모지 복사" } },
                  { slug: "qr-code-generator", name: { en: "QR Code Generator", ko: "QR 코드 생성기" } },
                  { slug: "color-picker", name: { en: "Color Picker & Converter", ko: "색상 선택기 & 변환기" } },
                ].map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/${lang}/tools/${tool.slug}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {tool.name[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ad placeholder - sidebar */}
            {/* <div><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto"></ins></div> */}
          </div>
        </aside>
      </div>
    </div>
  );
}
