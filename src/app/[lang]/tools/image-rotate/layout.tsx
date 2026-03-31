import type { Metadata } from "next";

const slug = "image-rotate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: {
      canonical: `/${lang}/tools/${slug}`,
      languages: {
        en: `/en/tools/${slug}`,
        ko: `/ko/tools/${slug}`,
        "x-default": `/en/tools/${slug}`,
      },
    },
  };
}

export default function ImageRotateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
