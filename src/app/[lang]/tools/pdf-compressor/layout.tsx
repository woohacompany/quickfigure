import type { Metadata } from "next";

const slug = "pdf-compressor";

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

export default function PdfCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
