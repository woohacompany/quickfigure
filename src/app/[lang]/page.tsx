import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { blogPosts, categoryLabels } from "@/lib/blog";
import { TOOL_SLUGS } from "@/lib/tools";
import { toolTags } from "@/lib/toolTags";
import HomeClient from "./HomeClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang);

  const title = lang === "ko"
    ? "QuickFigure - 무료 온라인 계산기, 변환기, PDF 도구 모음"
    : "QuickFigure - Free Online Calculators, Converters & PDF Tools";
  const description = t.siteDescription;

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ko: "/ko", "x-default": "/en" },
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "QuickFigure",
      url: `https://www.quickfigure.net/${lang}`,
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

  // Helper to get tags for a tool slug in current locale
  const getToolTags = (slug: string): string[] => {
    const tags = toolTags[slug];
    if (!tags) return [];
    return lang === "ko" ? tags.ko : tags.en;
  };

  const categories = [
    {
      id: "finance",
      title: t.home.financeTools,
      description: t.home.categoryFinanceDesc,
      color: "blue",
      tools: [
        { name: t.home.compoundInterest, description: t.home.compoundInterestDesc, href: `/${lang}/tools/compound-interest-calculator`, tags: getToolTags("compound-interest-calculator") },
        { name: t.home.mortgage, description: t.home.mortgageDesc, href: `/${lang}/tools/mortgage-calculator`, tags: getToolTags("mortgage-calculator") },
        { name: t.home.retirement, description: t.home.retirementDesc, href: `/${lang}/tools/retirement-calculator`, tags: getToolTags("retirement-calculator") },
        { name: t.home.emergencyFund, description: t.home.emergencyFundDesc, href: `/${lang}/tools/emergency-fund-calculator`, tags: getToolTags("emergency-fund-calculator") },
        { name: t.home.freelancerTax, description: t.home.freelancerTaxDesc, href: `/${lang}/tools/freelancer-tax-calculator`, tags: getToolTags("freelancer-tax-calculator") },
        { name: t.home.salaryCalc, description: t.home.salaryCalcDesc, href: `/${lang}/tools/salary-calculator`, tags: getToolTags("salary-calculator") },
        { name: t.home.loanCalc, description: t.home.loanCalcDesc, href: `/${lang}/tools/loan-calculator`, tags: getToolTags("loan-calculator") },
        { name: t.home.vatCalc, description: t.home.vatCalcDesc, href: `/${lang}/tools/vat-calculator`, tags: getToolTags("vat-calculator") },
        { name: t.home.severanceCalc, description: t.home.severanceCalcDesc, href: `/${lang}/tools/severance-calculator`, tags: getToolTags("severance-calculator") },
        { name: t.home.rentConversionCalc, description: t.home.rentConversionCalcDesc, href: `/${lang}/tools/rent-conversion-calculator`, tags: getToolTags("rent-conversion-calculator") },
        { name: t.home.hourlyWageCalc, description: t.home.hourlyWageCalcDesc, href: `/${lang}/tools/hourly-wage-calculator`, tags: getToolTags("hourly-wage-calculator") },
        { name: t.home.discountCalc, description: t.home.discountCalcDesc, href: `/${lang}/tools/discount-calculator`, tags: getToolTags("discount-calculator") },
        { name: t.home.electricityCalc, description: t.home.electricityCalcDesc, href: `/${lang}/tools/electricity-calculator`, tags: getToolTags("electricity-calculator") },
        { name: t.home.weeklyHolidayPayCalc, description: t.home.weeklyHolidayPayCalcDesc, href: `/${lang}/tools/weekly-holiday-pay-calculator`, tags: getToolTags("weekly-holiday-pay-calculator") },
        { name: t.home.weeklyPayCalc, description: t.home.weeklyPayCalcDesc, href: `/${lang}/tools/weekly-pay-calculator`, tags: getToolTags("weekly-pay-calculator") },
        { name: t.home.annualLeaveCalc, description: t.home.annualLeaveCalcDesc, href: `/${lang}/tools/annual-leave-calculator`, tags: getToolTags("annual-leave-calculator") },
        { name: t.home.unemploymentCalc, description: t.home.unemploymentCalcDesc, href: `/${lang}/tools/unemployment-calculator`, tags: getToolTags("unemployment-calculator") },
        { name: t.home.acquisitionTaxCalc, description: t.home.acquisitionTaxCalcDesc, href: `/${lang}/tools/acquisition-tax-calculator`, tags: getToolTags("acquisition-tax-calculator") },
        { name: t.home.incomeTaxCalc, description: t.home.incomeTaxCalcDesc, href: `/${lang}/tools/income-tax-calculator`, tags: getToolTags("income-tax-calculator") },
        { name: t.home.carTaxCalc, description: t.home.carTaxCalcDesc, href: `/${lang}/tools/car-tax-calculator`, tags: getToolTags("car-tax-calculator") },
        { name: t.home.capitalGainsTaxCalc, description: t.home.capitalGainsTaxCalcDesc, href: `/${lang}/tools/capital-gains-tax-calculator`, tags: getToolTags("capital-gains-tax-calculator") },
        { name: t.home.loanComparisonCalc, description: t.home.loanComparisonCalcDesc, href: `/${lang}/tools/loan-comparison-calculator`, tags: getToolTags("loan-comparison-calculator") },
        { name: t.home.inheritanceTaxCalc, description: t.home.inheritanceTaxCalcDesc, href: `/${lang}/tools/inheritance-tax-calculator`, tags: getToolTags("inheritance-tax-calculator") },
        { name: t.home.dsrCalc, description: t.home.dsrCalcDesc, href: `/${lang}/tools/dsr-calculator`, tags: getToolTags("dsr-calculator") },
        { name: t.home.accidentSettlementCalc, description: t.home.accidentSettlementCalcDesc, href: `/${lang}/tools/accident-settlement-calculator`, tags: getToolTags("accident-settlement-calculator") },
        { name: t.home.nationalPensionCalc, description: t.home.nationalPensionCalcDesc, href: `/${lang}/tools/national-pension-calculator`, tags: getToolTags("national-pension-calculator") },
        { name: t.home.roiCalc, description: t.home.roiCalcDesc, href: `/${lang}/tools/roi-calculator`, tags: getToolTags("roi-calculator") },
        { name: t.home.currencyConverter, description: t.home.currencyConverterDesc, href: `/${lang}/tools/currency-converter`, tags: getToolTags("currency-converter") },
        { name: t.home.jeonseVsWolseCalc, description: t.home.jeonseVsWolseCalcDesc, href: `/${lang}/tools/jeonse-vs-wolse-calculator`, tags: getToolTags("jeonse-vs-wolse-calculator") },
        { name: t.home.yearEndTaxCalc, description: t.home.yearEndTaxCalcDesc, href: `/${lang}/tools/year-end-tax-calculator`, tags: getToolTags("year-end-tax-calculator") },
      ],
    },
    {
      id: "health",
      title: t.home.healthTools,
      description: t.home.categoryHealthDesc,
      color: "emerald",
      tools: [
        { name: t.home.bmiCalc, description: t.home.bmiCalcDesc, href: `/${lang}/tools/bmi-calculator`, tags: getToolTags("bmi-calculator") },
        { name: t.home.calorieCalc, description: t.home.calorieCalcDesc, href: `/${lang}/tools/calorie-calculator`, tags: getToolTags("calorie-calculator") },
        { name: t.home.ageCalc, description: t.home.ageCalcDesc, href: `/${lang}/tools/age-calculator`, tags: getToolTags("age-calculator") },
        { name: t.home.sleepCalc, description: t.home.sleepCalcDesc, href: `/${lang}/tools/sleep-calculator`, tags: getToolTags("sleep-calculator") },
        { name: t.home.alcoholCalc, description: t.home.alcoholCalcDesc, href: `/${lang}/tools/alcohol-calculator`, tags: getToolTags("alcohol-calculator") },
        { name: t.home.bodyFatCalc, description: t.home.bodyFatCalcDesc, href: `/${lang}/tools/body-fat-calculator`, tags: getToolTags("body-fat-calculator") },
      ],
    },
    {
      id: "image",
      title: t.home.imageTools,
      description: t.home.categoryImageDesc,
      color: "orange",
      tools: [
        { name: t.home.imageResizer, description: t.home.imageResizerDesc, href: `/${lang}/tools/image-resizer`, tags: getToolTags("image-resizer") },
        { name: t.home.pdfMerger, description: t.home.pdfMergerDesc, href: `/${lang}/tools/pdf-merger`, tags: getToolTags("pdf-merger") },
        { name: t.home.imageCompressor, description: t.home.imageCompressorDesc, href: `/${lang}/tools/image-compressor`, tags: getToolTags("image-compressor") },
        { name: t.home.imageToPdf, description: t.home.imageToPdfDesc, href: `/${lang}/tools/image-to-pdf`, tags: getToolTags("image-to-pdf") },
        { name: t.home.pdfSplitter, description: t.home.pdfSplitterDesc, href: `/${lang}/tools/pdf-splitter`, tags: getToolTags("pdf-splitter") },
        { name: t.home.pdfToWord, description: t.home.pdfToWordDesc, href: `/${lang}/tools/pdf-to-word`, tags: getToolTags("pdf-to-word") },
        { name: t.home.wordToPdf, description: t.home.wordToPdfDesc, href: `/${lang}/tools/word-to-pdf`, tags: getToolTags("word-to-pdf") },
        { name: t.home.pdfCompressor, description: t.home.pdfCompressorDesc, href: `/${lang}/tools/pdf-compressor`, tags: getToolTags("pdf-compressor") },
        { name: t.home.pdfToJpg, description: t.home.pdfToJpgDesc, href: `/${lang}/tools/pdf-to-jpg`, tags: getToolTags("pdf-to-jpg") },
        { name: t.home.imageConverter, description: t.home.imageConverterDesc, href: `/${lang}/tools/image-converter`, tags: getToolTags("image-converter") },
        { name: t.home.excelMerge, description: t.home.excelMergeDesc, href: `/${lang}/tools/excel-merge`, tags: getToolTags("excel-merge") },
        { name: t.home.imageUpscaler, description: t.home.imageUpscalerDesc, href: `/${lang}/tools/image-upscaler`, tags: getToolTags("image-upscaler") },
        { name: t.home.imageCropper, description: t.home.imageCropperDesc, href: `/${lang}/tools/image-cropper`, tags: getToolTags("image-cropper") },
        { name: t.home.imageKbResizer, description: t.home.imageKbResizerDesc, href: `/${lang}/tools/image-kb-resizer`, tags: getToolTags("image-kb-resizer") },
        { name: t.home.imageWatermark, description: t.home.imageWatermarkDesc, href: `/${lang}/tools/image-watermark`, tags: getToolTags("image-watermark") },
        { name: t.home.gifMaker, description: t.home.gifMakerDesc, href: `/${lang}/tools/gif-maker`, tags: getToolTags("gif-maker") },
        { name: t.home.pdfToExcel, description: t.home.pdfToExcelDesc, href: `/${lang}/tools/pdf-to-excel`, tags: getToolTags("pdf-to-excel") },
        { name: t.home.imageRotate, description: t.home.imageRotateDesc, href: `/${lang}/tools/image-rotate`, tags: getToolTags("image-rotate") },
        { name: t.home.excelToPdf, description: t.home.excelToPdfDesc, href: `/${lang}/tools/excel-to-pdf`, tags: getToolTags("excel-to-pdf") },
        { name: t.home.imageToSvg, description: t.home.imageToSvgDesc, href: `/${lang}/tools/image-to-svg`, tags: getToolTags("image-to-svg") },
      ],
    },
    {
      id: "text",
      title: t.home.textTools,
      description: t.home.categoryTextDesc,
      color: "violet",
      tools: [
        { name: t.home.wordCounter, description: t.home.wordCounterDesc, href: `/${lang}/tools/word-counter`, tags: getToolTags("word-counter") },
        { name: t.home.caseConverter, description: t.home.caseConverterDesc, href: `/${lang}/tools/case-converter`, tags: getToolTags("case-converter") },
        { name: t.home.textDiff, description: t.home.textDiffDesc, href: `/${lang}/tools/text-diff`, tags: getToolTags("text-diff") },
      ],
    },
    {
      id: "dev",
      title: t.home.devTools,
      description: t.home.categoryDevDesc,
      color: "cyan",
      tools: [
        { name: t.home.jsonFormatter, description: t.home.jsonFormatterDesc, href: `/${lang}/tools/json-formatter`, tags: getToolTags("json-formatter") },
        { name: t.home.base64, description: t.home.base64Desc, href: `/${lang}/tools/base64-encoder-decoder`, tags: getToolTags("base64-encoder-decoder") },
        { name: t.home.markdownEditor, description: t.home.markdownEditorDesc, href: `/${lang}/tools/markdown-editor`, tags: getToolTags("markdown-editor") },
        { name: t.home.uuidGenerator, description: t.home.uuidGeneratorDesc, href: `/${lang}/tools/uuid-generator`, tags: getToolTags("uuid-generator") },
        { name: t.home.regexTester, description: t.home.regexTesterDesc, href: `/${lang}/tools/regex-tester`, tags: getToolTags("regex-tester") },
        { name: t.home.hashGenerator, description: t.home.hashGeneratorDesc, href: `/${lang}/tools/hash-generator`, tags: getToolTags("hash-generator") },
        { name: t.home.urlEncoderDecoder, description: t.home.urlEncoderDecoderDesc, href: `/${lang}/tools/url-encoder-decoder`, tags: getToolTags("url-encoder-decoder") },
        { name: t.home.cssGradient, description: t.home.cssGradientDesc, href: `/${lang}/tools/css-gradient-generator`, tags: getToolTags("css-gradient-generator") },
      ],
    },
    {
      id: "generator",
      title: t.home.generatorTools,
      description: t.home.categoryGeneratorDesc,
      color: "pink",
      tools: [
        { name: t.home.loremIpsum, description: t.home.loremIpsumDesc, href: `/${lang}/tools/lorem-ipsum-generator`, tags: getToolTags("lorem-ipsum-generator") },
        { name: t.home.passwordGenerator, description: t.home.passwordGeneratorDesc, href: `/${lang}/tools/password-generator`, tags: getToolTags("password-generator") },
        { name: t.home.ladderGame, description: t.home.ladderGameDesc, href: `/${lang}/tools/ladder-game`, tags: getToolTags("ladder-game") },
      ],
    },
    {
      id: "date",
      title: t.home.dateTools,
      description: t.home.categoryDateDesc,
      color: "amber",
      tools: [
        { name: t.home.ddayCalc, description: t.home.ddayCalcDesc, href: `/${lang}/tools/dday-calculator`, tags: getToolTags("dday-calculator") },
        { name: t.home.dateCalc, description: t.home.dateCalcDesc, href: `/${lang}/tools/date-calculator`, tags: getToolTags("date-calculator") },
        { name: t.home.gpaCalc, description: t.home.gpaCalcDesc, href: `/${lang}/tools/gpa-calculator`, tags: getToolTags("gpa-calculator") },
        { name: t.home.timer, description: t.home.timerDesc, href: `/${lang}/tools/timer`, tags: getToolTags("timer") },
        { name: t.home.worldClock, description: t.home.worldClockDesc, href: `/${lang}/tools/world-clock`, tags: getToolTags("world-clock") },
        { name: t.home.scheduleFinder, description: t.home.scheduleFinderDesc, href: `/${lang}/tools/schedule-finder`, tags: getToolTags("schedule-finder") },
      ],
    },
    {
      id: "utility",
      title: t.home.utilityTools,
      description: t.home.categoryUtilityDesc,
      color: "slate",
      tools: [
        { name: t.home.symbolCopyPaste, description: t.home.symbolCopyPasteDesc, href: `/${lang}/tools/symbol-copy-paste`, tags: getToolTags("symbol-copy-paste") },
        { name: t.home.qrCodeGenerator, description: t.home.qrCodeGeneratorDesc, href: `/${lang}/tools/qr-code-generator`, tags: getToolTags("qr-code-generator") },
        { name: t.home.colorPicker, description: t.home.colorPickerDesc, href: `/${lang}/tools/color-picker`, tags: getToolTags("color-picker") },
        { name: t.home.unitConverter, description: t.home.unitConverterDesc, href: `/${lang}/tools/unit-converter`, tags: getToolTags("unit-converter") },
        { name: t.home.percentageCalc, description: t.home.percentageCalcDesc, href: `/${lang}/tools/percentage-calculator`, tags: getToolTags("percentage-calculator") },
        { name: t.home.areaConverter, description: t.home.areaConverterDesc, href: `/${lang}/tools/area-converter`, tags: getToolTags("area-converter") },
        { name: t.home.randomNumberGenerator, description: t.home.randomNumberGeneratorDesc, href: `/${lang}/tools/random-number-generator`, tags: getToolTags("random-number-generator") },
        { name: t.home.typingSpeedTest, description: t.home.typingSpeedTestDesc, href: `/${lang}/tools/typing-speed-test`, tags: getToolTags("typing-speed-test") },
      ],
    },
  ];

  const popularToolSlugs = lang === "ko"
    ? [
        { slug: "salary-calculator", icon: "💰" },
        { slug: "severance-calculator", icon: "🏢" },
        { slug: "word-counter", icon: "📝" },
        { slug: "pdf-merger", icon: "📄" },
        { slug: "loan-calculator", icon: "🏦" },
        { slug: "bmi-calculator", icon: "⚖️" },
        { slug: "dsr-calculator", icon: "📊" },
        { slug: "image-compressor", icon: "🖼️" },
      ]
    : [
        { slug: "salary-calculator", icon: "💰" },
        { slug: "compound-interest-calculator", icon: "📈" },
        { slug: "word-counter", icon: "📝" },
        { slug: "pdf-merger", icon: "📄" },
        { slug: "loan-calculator", icon: "🏦" },
        { slug: "bmi-calculator", icon: "⚖️" },
        { slug: "mortgage-calculator", icon: "🏠" },
        { slug: "image-compressor", icon: "🖼️" },
      ];

  const popularTools = popularToolSlugs.map((item) => {
    for (const cat of categories) {
      const found = cat.tools.find((t) => t.href.endsWith(`/${item.slug}`));
      if (found) return { ...found, icon: item.icon };
    }
    return null;
  }).filter(Boolean) as { name: string; description: string; href: string; icon: string }[];

  const latestPosts = blogPosts.slice(0, 6).map((post) => {
    const tr = post.translations[lang as Locale];
    return {
      slug: post.slug,
      href: `/${lang}/blog/${post.slug}`,
      title: tr.title,
      summary: tr.summary,
      category: categoryLabels[post.category][lang as Locale],
      date: post.date,
    };
  });

  const toolCount = TOOL_SLUGS.length;
  const blogCount = blogPosts.length;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "QuickFigure",
        url: "https://www.quickfigure.net",
        description: t.siteDescription,
        inLanguage: lang === "ko" ? "ko-KR" : "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: `https://www.quickfigure.net/${lang}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "QuickFigure",
        url: "https://www.quickfigure.net",
        logo: "https://www.quickfigure.net/icon.png",
      },
      {
        "@type": "ItemList",
        name: lang === "ko" ? "무료 온라인 도구" : "Free Online Tools",
        numberOfItems: toolCount,
        itemListElement: popularTools.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: tool.name,
          url: `https://www.quickfigure.net${tool.href}`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
        lang={lang}
        t={t}
        categories={categories}
        popularTools={popularTools}
        latestPosts={latestPosts}
        toolCount={toolCount}
        blogCount={blogCount}
      />
    </>
  );
}
