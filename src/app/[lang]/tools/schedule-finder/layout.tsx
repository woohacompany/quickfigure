import type { Metadata } from "next";
import { isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const isKo = lang === "ko";
  const metaTitle = isKo
    ? "일정 맞추기 - 모임 시간 투표로 최적 시간 찾기 | QuickFigure"
    : "Schedule Finder - Find the Best Meeting Time for Everyone | QuickFigure";
  const metaDescription = isKo
    ? "링크 하나로 모임 시간을 정하세요. 각자 가능한 시간을 드래그하면 모두에게 맞는 최적 시간을 자동으로 찾아줍니다. 가입 없이 무료."
    : "Share a link, everyone marks their availability, and find the perfect meeting time. No signup needed. 100% free.";
  const keywords = isKo
    ? ["일정 맞추기", "언제 만날까", "일정 조율", "미팅 시간 정하기", "모임 시간", "약속 잡기", "시간 투표", "when2meet 한국어", "일정 투표", "그룹 일정", "스케줄 조율"]
    : ["schedule finder", "when can we meet", "meeting scheduler", "group availability", "time poll", "schedule poll", "find meeting time", "when2meet alternative", "availability checker"];
  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `/${lang}/tools/schedule-finder`,
      languages: { en: "/en/tools/schedule-finder", ko: "/ko/tools/schedule-finder", "x-default": "/en/tools/schedule-finder" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: `https://www.quickfigure.net/${lang}/tools/schedule-finder`,
    },
  };
}

export default function ScheduleFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
