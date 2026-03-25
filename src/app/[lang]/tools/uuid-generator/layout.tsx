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
  const title = isKo
    ? "UUID 생성기 - UUID v4/v7 온라인 생성 & 검증 | QuickFigure"
    : "UUID Generator - Generate UUID v4/v7 Online & Validate | QuickFigure";
  const description = isKo
    ? "UUID를 온라인으로 즉시 생성하세요. v1/v4/v7 지원, 벌크 생성, 유효성 검사. 개발자 필수 도구. 가입 없이 무료."
    : "Generate UUIDs online instantly. Supports v1/v4/v7, bulk generation, validation. Essential developer tool. Free, no signup.";
  return {
    title,
    description,
    keywords: isKo
      ? ["UUID 생성기", "UUID 생성", "UUID v4", "고유 식별자 생성", "GUID 생성기", "UUID 검증", "랜덤 UUID", "UUID 만들기"]
      : ["uuid generator", "uuid v4 generator", "random uuid", "guid generator", "uuid online", "generate uuid", "uuid validator", "bulk uuid generator"],
    alternates: {
      canonical: `/${lang}/tools/uuid-generator`,
      languages: { en: "/en/tools/uuid-generator", ko: "/ko/tools/uuid-generator" },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
