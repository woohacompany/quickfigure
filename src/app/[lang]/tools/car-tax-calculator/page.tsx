"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

export default function CarTaxCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("car-tax-calculator");

  const [price, setPrice] = useState("");
  const [vehicleType, setVehicleType] = useState("passenger");
  const [condition, setCondition] = useState("new");
  const [ecoType, setEcoType] = useState("none");
  const [region, setRegion] = useState("seoul");
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    acquisitionTax: number;
    taxRate: number;
    ecoDiscount: number;
    compactDiscount: number;
    totalDiscount: number;
    bondCost: number;
    plateFee: number;
    registrationFee: number;
    stampDuty: number;
    otherCosts: number;
    total: number;
  } | null>(null);

  function calculate() {
    const p = parseFloat(price) || 0;
    if (p <= 0) return;

    // 취득세율
    let taxRate = 0;
    switch (vehicleType) {
      case "passenger":
        taxRate = 0.07;
        break;
      case "van_truck":
        taxRate = 0.05;
        break;
      case "motorcycle":
        taxRate = 0.02;
        break;
      case "compact":
        taxRate = 0.04;
        break;
    }

    const acquisitionTax = Math.round(p * taxRate);

    // 경차 감면: 최대 75만원
    let compactDiscount = 0;
    if (vehicleType === "compact") {
      compactDiscount = Math.min(acquisitionTax, 750000);
    }

    // 친환경차 감면
    let ecoDiscount = 0;
    if (ecoType === "ev_hydrogen") {
      ecoDiscount = Math.min(acquisitionTax - compactDiscount, 1400000);
    } else if (ecoType === "hybrid") {
      ecoDiscount = Math.min(acquisitionTax - compactDiscount, 400000);
    }
    if (ecoDiscount < 0) ecoDiscount = 0;

    const totalDiscount = compactDiscount + ecoDiscount;

    // 공채 실부담금
    let bondRate = 0;
    switch (region) {
      case "seoul":
        bondRate = 0.005;
        break;
      case "gyeonggi":
        bondRate = 0.004;
        break;
      case "other":
        bondRate = 0.002;
        break;
    }
    const bondCost = Math.round(p * bondRate);

    // 번호판 비용
    const plateFee = condition === "new" ? 35000 : 12000;

    // 등록수수료
    const registrationFee = vehicleType === "motorcycle" ? 3000 : 15000;

    // 인지대
    const stampDuty = 3000;

    const otherCosts = plateFee + registrationFee + stampDuty;

    const total = acquisitionTax - totalDiscount + bondCost + otherCosts;

    setResult({
      acquisitionTax,
      taxRate,
      ecoDiscount,
      compactDiscount,
      totalDiscount,
      bondCost,
      plateFee,
      registrationFee,
      stampDuty,
      otherCosts,
      total,
    });
  }

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", {
      maximumFractionDigits: 0,
    });

  const title = isKo ? "자동차 취득세 계산기" : "Car Tax Calculator";
  const description = isKo
    ? "2026년 기준 자동차 취득세와 등록비용을 자동 계산합니다. 친환경차 감면, 공채 매입비, 번호판 비용까지 한번에 확인하세요."
    : "Calculate Korean vehicle acquisition tax and registration costs. Includes eco-friendly vehicle discounts, bond purchase costs, and plate fees.";

  const faqItems = isKo
    ? [
        {
          q: "자동차 취득세율은 얼마인가요?",
          a: "승용차는 7%, 승합/화물차는 5%, 이륜차는 2%, 경차는 4%입니다. 경차의 경우 취득세에서 최대 75만 원까지 감면받을 수 있습니다.",
        },
        {
          q: "전기차 세금 혜택은 무엇인가요?",
          a: "전기차와 수소차는 취득세에서 최대 140만 원을 감면받을 수 있습니다(2026년 기준). 하이브리드 차량은 최대 40만 원 감면됩니다.",
        },
        {
          q: "중고차 취득세 기준은 무엇인가요?",
          a: "중고차 취득세의 과세표준은 시가표준액을 기준으로 합니다. 실제 거래가격과 시가표준액 중 높은 금액이 적용될 수 있으므로, 정확한 금액은 관할 관청에서 확인하시기 바랍니다.",
        },
        {
          q: "공채 매입이란 무엇인가요?",
          a: "자동차를 등록할 때 해당 지자체의 공채(지역개발채권 등)를 의무적으로 매입해야 합니다. 대부분 즉시 할인 매각하며, 이때 발생하는 차액이 실부담금입니다. 지역에 따라 공채 매입 비율이 다릅니다.",
        },
        {
          q: "자동차 등록 시 필요한 서류는 무엇인가요?",
          a: "신분증, 자동차 매매계약서(또는 세금계산서), 자동차보험 가입증명서, 자동차등록신청서가 필요합니다. 중고차의 경우 이전등록신청서와 양도증명서가 추가로 필요합니다.",
        },
      ]
    : [
        {
          q: "What are the vehicle acquisition tax rates in Korea?",
          a: "Passenger cars are taxed at 7%, vans/trucks at 5%, motorcycles at 2%, and compact cars at 4%. Compact cars can receive a discount of up to 750,000 KRW on acquisition tax.",
        },
        {
          q: "What are the tax benefits for electric vehicles?",
          a: "Electric and hydrogen vehicles can receive an acquisition tax discount of up to 1.4 million KRW (as of 2026). Hybrid vehicles receive up to 400,000 KRW discount.",
        },
        {
          q: "How is used car acquisition tax calculated?",
          a: "Used car acquisition tax is based on the standard assessed value. The higher of the actual transaction price and the standard assessed value may apply. Check with local authorities for the exact amount.",
        },
        {
          q: "What is the mandatory bond purchase?",
          a: "When registering a vehicle, you must purchase regional development bonds from the local government. Most people sell them immediately at a discount, and the difference is the actual cost burden. Bond rates vary by region.",
        },
        {
          q: "What documents are needed for vehicle registration?",
          a: "You need an ID, vehicle purchase contract (or tax invoice), car insurance certificate, and vehicle registration application. For used cars, a transfer registration application and certificate of transfer are additionally required.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="car-tax-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* 차량 가격 */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "차량 가격 (원)" : "Vehicle Price (KRW)"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              ₩
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={isKo ? "30,000,000" : "30,000,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 차종 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "차량 종류" : "Vehicle Type"}
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="passenger">{isKo ? "승용차 (7%)" : "Passenger Car (7%)"}</option>
              <option value="van_truck">{isKo ? "승합/화물차 (5%)" : "Van/Truck (5%)"}</option>
              <option value="motorcycle">{isKo ? "이륜차 (2%)" : "Motorcycle (2%)"}</option>
              <option value="compact">{isKo ? "경차 (4%, 75만원 감면)" : "Compact Car (4%, 750K discount)"}</option>
            </select>
          </div>

          {/* 신차/중고차 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "신차 / 중고차" : "New / Used"}
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">{isKo ? "신차" : "New Car"}</option>
              <option value="used">{isKo ? "중고차" : "Used Car"}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 친환경차 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "친환경 차량" : "Eco-friendly Vehicle"}
            </label>
            <select
              value={ecoType}
              onChange={(e) => setEcoType(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">{isKo ? "해당 없음" : "None"}</option>
              <option value="ev_hydrogen">{isKo ? "전기차 / 수소차 (최대 140만원 감면)" : "EV / Hydrogen (up to 1.4M discount)"}</option>
              <option value="hybrid">{isKo ? "하이브리드 (최대 40만원 감면)" : "Hybrid (up to 400K discount)"}</option>
            </select>
          </div>

          {/* 지역 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "등록 지역 (공채)" : "Registration Region (Bond)"}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="seoul">{isKo ? "서울" : "Seoul"}</option>
              <option value="gyeonggi">{isKo ? "경기" : "Gyeonggi"}</option>
              <option value="other">{isKo ? "기타 지방" : "Other Regions"}</option>
            </select>
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
                    {isKo ? "취득세" : "Acquisition Tax"} ({(result.taxRate * 100).toFixed(0)}%)
                  </p>
                </div>
                {result.totalDiscount > 0 && (
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                      -₩{fmt(result.totalDiscount)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "감면액" : "Tax Discount"}
                      {result.compactDiscount > 0 && result.ecoDiscount > 0
                        ? isKo
                          ? ` (경차 ${fmt(result.compactDiscount)} + 친환경 ${fmt(result.ecoDiscount)})`
                          : ` (Compact ${fmt(result.compactDiscount)} + Eco ${fmt(result.ecoDiscount)})`
                        : ""}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    ₩{fmt(result.bondCost)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "공채 실부담금" : "Bond Cost"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    ₩{fmt(result.otherCosts)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "기타 비용" : "Other Fees"} ({isKo ? "번호판+등록+인지" : "Plate+Reg+Stamp"})
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "차량 가격" : "Vehicle Price"}
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(parseFloat(price) || 0)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "취득세" : "Acquisition Tax"} ({(result.taxRate * 100).toFixed(0)}%)
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.acquisitionTax)}
                      </td>
                    </tr>
                    {result.compactDiscount > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-blue-600 dark:text-blue-400">
                          {isKo ? "경차 감면" : "Compact Car Discount"}
                        </td>
                        <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                          -₩{fmt(result.compactDiscount)}
                        </td>
                      </tr>
                    )}
                    {result.ecoDiscount > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-blue-600 dark:text-blue-400">
                          {isKo ? "친환경차 감면" : "Eco Vehicle Discount"}
                        </td>
                        <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                          -₩{fmt(result.ecoDiscount)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "공채 실부담금" : "Bond Cost"} ({region === "seoul" ? isKo ? "서울" : "Seoul" : region === "gyeonggi" ? isKo ? "경기" : "Gyeonggi" : isKo ? "기타" : "Other"})
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.bondCost)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "번호판 비용" : "License Plate Fee"}
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.plateFee)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "등록수수료" : "Registration Fee"}
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.registrationFee)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "인지대" : "Stamp Duty"}
                      </td>
                      <td className="p-3 text-right">
                        ₩{fmt(result.stampDuty)}
                      </td>
                    </tr>
                    <tr className="font-semibold bg-green-50 dark:bg-green-950/30">
                      <td className="p-3">
                        {isKo ? "취등록 총비용" : "Total Registration Cost"}
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
              slug="car-tax-calculator"
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
                "차량 가격(원)을 입력하세요.",
                "차량 종류를 선택하세요 (승용차, 승합/화물, 이륜차, 경차).",
                "신차 또는 중고차를 선택하세요.",
                "친환경 차량 해당 시 전기차/수소차 또는 하이브리드를 선택하세요.",
                "등록 지역을 선택한 후 계산하기 버튼을 클릭하세요.",
              ]
            : [
                "Enter the vehicle price in Korean Won (KRW).",
                "Select the vehicle type (passenger, van/truck, motorcycle, compact).",
                "Choose whether the vehicle is new or used.",
                "Select eco-friendly vehicle type if applicable (EV/hydrogen or hybrid).",
                "Choose the registration region and click Calculate.",
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
            href={`/${lang}/tools/acquisition-tax-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.acquisitionTaxCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.acquisitionTaxCalcDesc}
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

      <ToolHowItWorks slug="car-tax-calculator" locale={locale} />
      <ToolDisclaimer slug="car-tax-calculator" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="car-tax-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="car-tax-calculator"
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
