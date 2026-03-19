import { blogPosts } from "@/lib/blog";

const BASE_URL = "https://www.quickfigure.net";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const sorted = [...blogPosts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const items = sorted
    .map((post) => {
      const koTitle = post.translations.ko.title;
      const koSummary = post.translations.ko.summary;
      const link = `${BASE_URL}/ko/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `    <item>
      <title>${escapeXml(koTitle)}</title>
      <link>${link}</link>
      <description>${escapeXml(koSummary)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>${link}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>QuickFigure - 가이드 &amp; 팁</title>
    <link>${BASE_URL}</link>
    <description>QuickFigure 블로그 - 금융, 세금, 이미지/파일 도구 가이드와 실용 팁</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
