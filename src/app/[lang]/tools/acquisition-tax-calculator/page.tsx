"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

export default function AcquisitionTaxCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("acquisition-tax-calculator");

  const [price, setPrice] = useState("");
  const [houseCount, setHouseCount] = useState("1");
  const [area, setArea] = useState("small");
  const [region, setRegion] = useState("non-regulated");
  const [firstTime, setFirstTime] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    acquisitionTax: number;
    localEducationTax: number;
    ruralSpecialTax: number;
    discount: number;
    total: number;
    taxRate: number;
  } | null>(null);

  function calculate() {
    const p = parseFloat(price) || 0;
    if (p <= 0) return;

    let taxRate = 0;
    const houses = parseInt(houseCount);
    const isRegulated = region === "regulated";

    if (houses === 1 || (houses === 2 && !isRegulated)) {
      // 1주택 (조정/비조정 동일) or 2주택 비조정: 1~3% 구간
      if (p <= 600000000) {
        taxRate = 0.01;
      } else if (p <= 900000000) {
        // 6억~9억 구간: 선형 보간 1%~3%
        taxRate = ((p / 100000000) * 2 / 3 - 3) / 100;
        // 보정: 최소 1%, 최대 3%
        if (taxRate < 0.01) taxRate = 0.01;
        if (taxRate > 0.03) taxRate = 0.03;
      } else {
        taxRate = 0.03;
      }
    } else if (houses === 2 && isRegulated) {
      taxRate = 0.08;
    } else if (houses >= 3 && !isRegulated) {
      taxRate = 0.08;
    } else if (houses >= 3 && isRegulated) {
      taxRate = 0.12;
    }

    const acquisitionTax = Math.round(p * taxRate);

    // 지방교육세: 취득세액의 10%
    const localEducationTax = Math.round(acquisitionTax * 0.1);

    // 농어촌특별세: 85㎡ 초과일 때만 매매가의 0.2%
    const ruralSpecialTax = area === "large" ? Math.round(p * 0.002) : 0;

    // 생애최초 감면: 12억 이하 주택, 취득세 최대 200만원 감면
    let discount = 0;
    if (firstTime && houses === 1 && p <= 1200000000) {
      discount = Math.min(acquisitionTax, 2000000);
    }

    const total = acquisitionTax + localEducationTax + ruralSpecialTax - discount;

    setResult({
      acquisitionTax,
      localEducationTax,
      ruralSpecialTax,
      discount,
      total,
      taxRate,
    });
  }

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", {
      maximumFractionDigits: 0,
    });

  const title = isKo
    ? "취득세 계산기"
    : "Acquisition Tax Calculator";
  const description = isKo
    ? "2026년 기준 부동산 주택 취득세를 자동으로 계산합니다. 주택 수, 면적, 지역에 따른 취득세, 지방교육세, 농어촌특별세를 확인하세요."
    : "Calculate Korean property acquisition tax automatically. Check acquisition tax, local education tax, and rural special tax based on number of houses, area, and region.";

  const faqItems = isKo
    ? [
        {
          q: "취득세란 무엇인가요?",
          a: "취득세는 부동산, 차량, 기계장비 등의 자산을 취득할 때 부과되는 지방세입니다. 부동산 거래 시 매수자가 취득일로부터 60일 이내에 신고·납부해야 합니다.",
        },
        {
          q: "취득세율은 어떻게 결정되나요?",
          a: "주택 취득세율은 매매가격과 보유 주택 수, 조정대상지역 여부에 따라 달라집니다. 1주택자는 6억 이하 1%, 6~9억 1~3%, 9억 초과 3%이며, 다주택자는 조정지역 여부에 따라 8% 또는 12%가 적용됩니다.",
        },
        {
          q: "생애최초 주택 취득세 감면 조건은?",
          a: "생애 최초로 주택을 구입하는 경우, 매매가격 12억 원 이하 주택에 대해 취득세를 최대 200만 원까지 감면받을 수 있습니다. 본인과 배우자 모두 주택을 소유한 적이 없어야 합니다.",
        },
        {
          q: "지방교육세와 농어촌특별세는 무엇인가요?",
          a: "지방교육세는 취득세액의 10%로 부과되는 부가세입니다. 농어촌특별세는 전용면적 85㎡ 초과 주택을 취득할 때 매매가의 0.2%가 부과됩니다. 두 세금 모두 취득세와 함께 납부합니다.",
        },
        {
          q: "취득세 신고 기한은 언제인가요?",
          a: "부동산 취득일(잔금 지급일 또는 등기일 중 빠른 날)로부터 60일 이내에 관할 시·군·구청에 신고·납부해야 합니다. 기한 내 미신고 시 가산세가 부과될 수 있습니다.",
        },
      ]
    : [
        {
          q: "What is acquisition tax?",
          a: "Acquisition tax is a local tax imposed when acquiring assets such as real estate, vehicles, or machinery in South Korea. The buyer must report and pay the tax within 60 days of the acquisition date.",
        },
        {
          q: "How is the acquisition tax rate determined?",
          a: "The tax rate depends on the purchase price, the number of houses already owned, and whether the property is in a regulated area. For a single home, rates range from 1% to 3%. Multi-home owners face rates of 8% or 12% depending on the regulation zone.",
        },
        {
          q: "What is the first-time homebuyer discount?",
          a: "First-time homebuyers in Korea can receive a tax reduction of up to 2 million KRW on acquisition tax for properties priced at 1.2 billion KRW or less. Neither the buyer nor their spouse should have previously owned a home.",
        },
        {
          q: "What are local education tax and rural special tax?",
          a: "Local education tax is a surcharge equal to 10% of the acquisition tax amount. Rural special tax is 0.2% of the purchase price, applicable only to properties larger than 85 square meters. Both are paid together with the acquisition tax.",
        },
        {
          q: "What is the deadline for reporting acquisition tax?",
          a: "You must report and pay within 60 days from the acquisition date (the earlier of the final payment date or registration date). Late reporting may result in penalty surcharges.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* 매매가격 */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "매매가격 (원)" : "Purchase Price (KRW)"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              ₩
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={isKo ? "500,000,000" : "500,000,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 주택 수 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "보유 주택 수" : "Number of Houses Owned"}
            </label>
            <select
              value={houseCount}
              onChange={(e) => setHouseCount(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">{isKo ? "1주택 (무주택 포함)" : "1 House (incl. no home)"}</option>
              <option value="2">{isKo ? "2주택" : "2 Houses"}</option>
              <option value="3">{isKo ? "3주택 이상" : "3+ Houses"}</option>
            </select>
          </div>

          {/* 면적 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "전용면적" : "Exclusive Area"}
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">{isKo ? "85㎡ 이하" : "85㎡ or less"}</option>
              <option value="large">{isKo ? "85㎡ 초과" : "Over 85㎡"}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 지역 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "지역" : "Region"}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="non-regulated">{isKo ? "비조정지역" : "Non-regulated Area"}</option>
              <option value="regulated">{isKo ? "조정대상지역" : "Regulated Area"}</option>
            </select>
          </div>

          {/* 생애최초 */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={firstTime}
                onChange={(e) => setFirstTime(e.target.checked)}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">
                {isKo ? "생애최초 주택 구입" : "First-time Home Purchase"}
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isKo ? "계산하기" : "Calculate"}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    ₩{fmt(result.acquisitionTax)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "취득세" : "Acquisition Tax"} ({(result.taxRate * 100).toFixed(1)}%)
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    ₩{fmt(result.localEducationTax)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "지방교육세" : "Local Education Tax"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    ₩{fmt(result.ruralSpecialTax)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "농어촌특별세" : "Rural Special Tax"}
                  </p>
                </div>
                {result.discount > 0 && (
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                      -₩{fmt(result.discount)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "생애최초 감면" : "First-time Discount"}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "매매가격" : "Purchase Price"}
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(parseFloat(price) || 0)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "취득세" : "Acquisition Tax"} ({(result.taxRate * 100).toFixed(1)}%)
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.acquisitionTax)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "지방교육세" : "Local Education Tax"} (10%)
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.localEducationTax)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "농어촌특별세" : "Rural Special Tax"} (0.2%)
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.ruralSpecialTax)}
                      </td>
                    </tr>
                    {result.discount > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-blue-600 dark:text-blue-400">
                          {isKo ? "생애최초 감면" : "First-time Discount"}
                        </td>
                        <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                          -₩{fmt(result.discount)}
                        </td>
                      </tr>
                    )}
                    <tr className="font-semibold bg-green-50 dark:bg-green-950/30">
                      <td className="p-3">
                        {isKo ? "총 납부세액" : "Total Tax Payable"}
                      </td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400">
                        ₩{fmt(result.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="acquisition-tax-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "매매가격(원)을 입력하세요.",
                "현재 보유 주택 수를 선택하세요.",
                "취득할 주택의 전용면적을 선택하세요.",
                "해당 지역이 조정대상지역인지 선택하세요.",
                "생애최초 주택 구입 해당 시 체크하세요.",
                "계산하기 버튼을 클릭하여 취득세를 확인하세요.",
              ]
            : [
                "Enter the purchase price in Korean Won (KRW).",
                "Select the number of houses you currently own.",
                "Select the exclusive area of the property.",
                "Choose whether the property is in a regulated area.",
                "Check the box if this is your first home purchase.",
                "Click Calculate to see the total acquisition tax.",
              ]
          ).map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <summary className="cursor-pointer p-4 font-medium">
                {item.q}
              </summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/mortgage-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.mortgage}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.mortgageDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/loan-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.loanCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.loanCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="acquisition-tax-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="acquisition-tax-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">
            {dict.relatedArticles}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link
                  key={post.slug}
                  href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
                >
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
      )}
    </div>
  );
}
