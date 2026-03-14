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
    ? "엑셀 파일 합치기 & 중복 검사 - 여러 엑셀 병합, 중복 데이터 감지 | QuickFigure"
    : "Excel Merge & Duplicate Checker - Combine Spreadsheets Online Free | QuickFigure";
  const metaDescription = isKo
    ? "여러 엑셀 파일을 하나로 합치고, 중복 데이터를 자동으로 찾아 색상 표시합니다. 발주서 통합, 주문 취합에 최적. 서버 업로드 없이 100% 안전."
    : "Merge multiple Excel files into one and automatically detect duplicate rows with color coding. Perfect for consolidating orders, surveys, and reports. 100% browser-based.";

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/${lang}/tools/excel-merge`,
      languages: { en: "/en/tools/excel-merge", ko: "/ko/tools/excel-merge" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
  };
}

export default function ExcelMergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
