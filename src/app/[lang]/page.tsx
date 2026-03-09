import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { blogPosts, categoryLabels } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: `QuickFigure - ${t.home.hero}`,
    description: t.siteDescription,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ko: "/ko" },
    },
    openGraph: {
      title: `QuickFigure - ${t.home.hero}`,
      description: t.siteDescription,
      type: "website",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) return null;
  const t = getDictionary(lang);

  const textTools = [
    { name: t.home.wordCounter, description: t.home.wordCounterDesc, href: `/${lang}/tools/word-counter` },
    { name: t.home.caseConverter, description: t.home.caseConverterDesc, href: `/${lang}/tools/case-converter` },
    { name: t.home.textDiff, description: t.home.textDiffDesc, href: `/${lang}/tools/text-diff` },
  ];

  const generatorTools = [
    { name: t.home.loremIpsum, description: t.home.loremIpsumDesc, href: `/${lang}/tools/lorem-ipsum-generator` },
    { name: t.home.passwordGenerator, description: t.home.passwordGeneratorDesc, href: `/${lang}/tools/password-generator` },
  ];

  const devTools = [
    { name: t.home.jsonFormatter, description: t.home.jsonFormatterDesc, href: `/${lang}/tools/json-formatter` },
    { name: t.home.base64, description: t.home.base64Desc, href: `/${lang}/tools/base64-encoder-decoder` },
    { name: t.home.markdownEditor, description: t.home.markdownEditorDesc, href: `/${lang}/tools/markdown-editor` },
  ];

  const financeTools = [
    { name: t.home.compoundInterest, description: t.home.compoundInterestDesc, href: `/${lang}/tools/compound-interest-calculator` },
    { name: t.home.mortgage, description: t.home.mortgageDesc, href: `/${lang}/tools/mortgage-calculator` },
    { name: t.home.retirement, description: t.home.retirementDesc, href: `/${lang}/tools/retirement-calculator` },
    { name: t.home.emergencyFund, description: t.home.emergencyFundDesc, href: `/${lang}/tools/emergency-fund-calculator` },
    { name: t.home.freelancerTax, description: t.home.freelancerTaxDesc, href: `/${lang}/tools/freelancer-tax-calculator` },
    { name: t.home.salaryCalc, description: t.home.salaryCalcDesc, href: `/${lang}/tools/salary-calculator` },
    { name: t.home.loanCalc, description: t.home.loanCalcDesc, href: `/${lang}/tools/loan-calculator` },
    { name: t.home.vatCalc, description: t.home.vatCalcDesc, href: `/${lang}/tools/vat-calculator` },
    { name: t.home.severanceCalc, description: t.home.severanceCalcDesc, href: `/${lang}/tools/severance-calculator` },
    { name: t.home.rentConversionCalc, description: t.home.rentConversionCalcDesc, href: `/${lang}/tools/rent-conversion-calculator` },
    { name: t.home.hourlyWageCalc, description: t.home.hourlyWageCalcDesc, href: `/${lang}/tools/hourly-wage-calculator` },
    { name: t.home.discountCalc, description: t.home.discountCalcDesc, href: `/${lang}/tools/discount-calculator` },
    { name: t.home.electricityCalc, description: t.home.electricityCalcDesc, href: `/${lang}/tools/electricity-calculator` },
    { name: t.home.weeklyHolidayPayCalc, description: t.home.weeklyHolidayPayCalcDesc, href: `/${lang}/tools/weekly-holiday-pay-calculator` },
    { name: t.home.annualLeaveCalc, description: t.home.annualLeaveCalcDesc, href: `/${lang}/tools/annual-leave-calculator` },
    { name: t.home.unemploymentCalc, description: t.home.unemploymentCalcDesc, href: `/${lang}/tools/unemployment-calculator` },
    { name: t.home.acquisitionTaxCalc, description: t.home.acquisitionTaxCalcDesc, href: `/${lang}/tools/acquisition-tax-calculator` },
    { name: t.home.incomeTaxCalc, description: t.home.incomeTaxCalcDesc, href: `/${lang}/tools/income-tax-calculator` },
  ];

  const healthTools = [
    { name: t.home.bmiCalc, description: t.home.bmiCalcDesc, href: `/${lang}/tools/bmi-calculator` },
    { name: t.home.calorieCalc, description: t.home.calorieCalcDesc, href: `/${lang}/tools/calorie-calculator` },
    { name: t.home.ageCalc, description: t.home.ageCalcDesc, href: `/${lang}/tools/age-calculator` },
    { name: t.home.sleepCalc, description: t.home.sleepCalcDesc, href: `/${lang}/tools/sleep-calculator` },
    { name: t.home.alcoholCalc, description: t.home.alcoholCalcDesc, href: `/${lang}/tools/alcohol-calculator` },
    { name: t.home.bodyFatCalc, description: t.home.bodyFatCalcDesc, href: `/${lang}/tools/body-fat-calculator` },
  ];

  const dateTools = [
    { name: t.home.ddayCalc, description: t.home.ddayCalcDesc, href: `/${lang}/tools/dday-calculator` },
    { name: t.home.dateCalc, description: t.home.dateCalcDesc, href: `/${lang}/tools/date-calculator` },
    { name: t.home.gpaCalc, description: t.home.gpaCalcDesc, href: `/${lang}/tools/gpa-calculator` },
    { name: t.home.timer, description: t.home.timerDesc, href: `/${lang}/tools/timer` },
  ];

  const utilityTools = [
    { name: t.home.symbolCopyPaste, description: t.home.symbolCopyPasteDesc, href: `/${lang}/tools/symbol-copy-paste` },
    { name: t.home.qrCodeGenerator, description: t.home.qrCodeGeneratorDesc, href: `/${lang}/tools/qr-code-generator` },
    { name: t.home.colorPicker, description: t.home.colorPickerDesc, href: `/${lang}/tools/color-picker` },
    { name: t.home.unitConverter, description: t.home.unitConverterDesc, href: `/${lang}/tools/unit-converter` },
    { name: t.home.percentageCalc, description: t.home.percentageCalcDesc, href: `/${lang}/tools/percentage-calculator` },
    { name: t.home.areaConverter, description: t.home.areaConverterDesc, href: `/${lang}/tools/area-converter` },
    { name: t.home.randomNumberGenerator, description: t.home.randomNumberGeneratorDesc, href: `/${lang}/tools/random-number-generator` },
  ];

  const imageTools = [
    { name: t.home.imageResizer, description: t.home.imageResizerDesc, href: `/${lang}/tools/image-resizer` },
    { name: t.home.pdfMerger, description: t.home.pdfMergerDesc, href: `/${lang}/tools/pdf-merger` },
    { name: t.home.imageCompressor, description: t.home.imageCompressorDesc, href: `/${lang}/tools/image-compressor` },
    { name: t.home.imageToPdf, description: t.home.imageToPdfDesc, href: `/${lang}/tools/image-to-pdf` },
    { name: t.home.pdfSplitter, description: t.home.pdfSplitterDesc, href: `/${lang}/tools/pdf-splitter` },
  ];

  function ToolGrid({ tools }: { tools: { name: string; description: string; href: string }[] }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.name}
            </h3>
            <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight">{t.home.hero}</h1>
        <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400">
          {t.home.heroSub}
        </p>
      </section>

      {/* Ad placeholder */}
      {/* <div className="mb-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

      <div className="space-y-12">
        {/* Text Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.textTools}</h2>
          <ToolGrid tools={textTools} />
        </section>

        {/* Generator Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.generatorTools}</h2>
          <ToolGrid tools={generatorTools} />
        </section>

        {/* Developer Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.devTools}</h2>
          <ToolGrid tools={devTools} />
        </section>

        {/* Finance Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.financeTools}</h2>
          <ToolGrid tools={financeTools} />
        </section>

        {/* Health & Lifestyle */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.healthTools}</h2>
          <ToolGrid tools={healthTools} />
        </section>

        {/* Date & Lifestyle Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.dateTools}</h2>
          <ToolGrid tools={dateTools} />
        </section>

        {/* Utility Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.utilityTools}</h2>
          <ToolGrid tools={utilityTools} />
        </section>

        {/* Image & File Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.imageTools}</h2>
          <ToolGrid tools={imageTools} />
        </section>
      </div>

      {/* Latest Blog Posts */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{t.blog.latestPosts}</h2>
          <Link
            href={`/${lang}/blog`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.blog.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(0, 3).map((post) => {
            const tr = post.translations[lang as Locale];
            return (
              <Link
                key={post.slug}
                href={`/${lang}/blog/${post.slug}`}
                className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                    {categoryLabels[post.category][lang as Locale]}
                  </span>
                  <span className="text-xs text-neutral-400">{post.date}</span>
                </div>
                <h3 className="font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tr.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {tr.summary}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
