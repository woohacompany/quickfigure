import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).colorPicker;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    keywords: lang === "ko"
      ? ["색상 선택기", "컬러 피커", "HEX 색상 코드", "RGB 변환", "HSL 변환", "색상 팔레트", "색상 대비 체크", "웹 색상"]
      : ["color picker", "hex color code", "rgb to hex", "color converter", "color palette generator", "contrast checker", "hsl converter", "css color"],
    alternates: {
      canonical: `/${lang}/tools/color-picker`,
      languages: { en: "/en/tools/color-picker", ko: "/ko/tools/color-picker" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
