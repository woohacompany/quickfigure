import type { Metadata } from "next";
import { getDictionary, isValidLocale, locales, type Locale } from "@/lib/dictionaries";

const EMBED_SLUGS = [
  "bmi-calculator",
  "age-calculator",
  "compound-interest-calculator",
  "freelancer-tax-calculator",
  "salary-calculator",
  "loan-calculator",
  "unit-converter",
  "percentage-calculator",
];

const DICT_KEY_MAP: Record<string, string> = {
  "bmi-calculator": "bmi",
  "age-calculator": "ageCalc",
  "compound-interest-calculator": "compoundInterest",
  "freelancer-tax-calculator": "freelancerTax",
  "salary-calculator": "salaryCalc",
  "loan-calculator": "loanCalc",
  "unit-converter": "unitConverter",
  "percentage-calculator": "percentageCalc",
};

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    EMBED_SLUGS.map((slug) => ({ lang, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const key = DICT_KEY_MAP[slug];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = key ? (dict as any)[key] : null;
  const title = t?.title ?? slug;
  const description = t?.description ?? "";

  return {
    title: `${title} - Embed`,
    description,
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${lang}/tools/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
