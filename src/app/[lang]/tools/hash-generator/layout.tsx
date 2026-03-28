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
    ? "해시 생성기 - MD5 SHA-256 해시값 생성 & 비교 | QuickFigure"
    : "Hash Generator - MD5 SHA-256 Hash Calculator & Compare | QuickFigure";
  const description = isKo
    ? "MD5, SHA-1, SHA-256, SHA-512 해시값을 생성하고 비교하세요. 텍스트와 파일 모두 지원. 가입 없이 무료."
    : "Generate and compare MD5, SHA-1, SHA-256, SHA-512 hashes. Supports text and file input. Free, no signup needed.";
  return {
    title,
    description,
    keywords: isKo
      ? ["해시 생성기", "MD5 생성", "SHA-256 해시", "해시값 계산", "파일 해시 확인", "해시 비교", "SHA-1 생성", "해시 검증"]
      : ["hash generator", "md5 generator", "sha256 hash", "hash calculator", "file hash checker", "sha1 generator", "hash compare", "checksum generator"],
    alternates: {
      canonical: `/${lang}/tools/hash-generator`,
      languages: { en: "/en/tools/hash-generator", ko: "/ko/tools/hash-generator" },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
