"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

export default function DiscountCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("discount-calculator");
  const isKo = locale === "ko";

  const title = isKo
    ? "할인율 계산기 - 세일 할인 가격 자동 계산"
    : "Discount Calculator - Calculate Sale Price & Savings";
  const description = isKo
    ? "원래 가격과 할인율을 입력하면 할인 금액과 최종 가격을 자동 계산합니다. 역산 기능 지원."
    : "Calculate discount prices instantly. Enter original price and discount percentage to find final price and savings.";

  // Mode: forward (price + %) or reverse (original + final → %)
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  // Forward mode states
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [includeTax, setIncludeTax] = useState(false);

  // Reverse mode states
  const [reverseOriginal, setReverseOriginal] = useState("");
  const [reverseFinal, setReverseFinal] = useState("");

  // Results
  const resultRef = useRef<HTMLDivElement>(null);
  const [forwardResult, setForwardResult] = useState<{
    discountAmount: number;
    finalPrice: number;
    totalDiscountPercent: number;
    taxAmount: number;
    priceAfterTax: number;
  } | null>(null);

  const [reverseResult, setReverseResult] = useState<{
    discountPercent: number;
    discountAmount: number;
  } | null>(null);

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtPct = (v: number) =>
    v.toLocaleString(undefined, { maximumFractionDigits: 2 });

  function calcForward() {
    const price = parseFloat(originalPrice);
    const disc1 = parseFloat(discountPercent);
    if (isNaN(price) || price <= 0 || isNaN(disc1)) return;

    let priceAfterFirst = price * (1 - disc1 / 100);

    // Apply additional discount if provided
    const disc2 = parseFloat(additionalDiscount);
    let priceAfterAll = priceAfterFirst;
    if (!isNaN(disc2) && disc2 > 0) {
      priceAfterAll = priceAfterFirst * (1 - disc2 / 100);
    }

    const discountAmount = price - priceAfterAll;
    const totalDiscountPercent = (discountAmount / price) * 100;

    // Tax calculation
    let taxAmount = 0;
    let priceAfterTax = priceAfterAll;
    if (includeTax) {
      const tax = parseFloat(taxRate);
      if (!isNaN(tax) && tax > 0) {
        taxAmount = priceAfterAll * (tax / 100);
        priceAfterTax = priceAfterAll + taxAmount;
      }
    }

    setForwardResult({
      discountAmount,
      finalPrice: priceAfterAll,
      totalDiscountPercent,
      taxAmount,
      priceAfterTax,
    });
  }

  function calcReverse() {
    const orig = parseFloat(reverseOriginal);
    const final_ = parseFloat(reverseFinal);
    if (isNaN(orig) || orig <= 0 || isNaN(final_) || final_ < 0) return;
    if (final_ > orig) return;

    const discountAmount = orig - final_;
    const discountPct = (discountAmount / orig) * 100;

    setReverseResult({
      discountPercent: discountPct,
      discountAmount,
    });
  }

  function handleQuickDiscount(pct: number) {
    setDiscountPercent(String(pct));
  }

  function resetForward() {
    setOriginalPrice("");
    setDiscountPercent("");
    setAdditionalDiscount("");
    setTaxRate("");
    setIncludeTax(false);
    setForwardResult(null);
  }

  function resetReverse() {
    setReverseOriginal("");
    setReverseFinal("");
    setReverseResult(null);
  }

  const quickDiscounts = [10, 20, 30, 40, 50, 60, 70];

  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const faqItems = isKo
    ? [
        {
          q: "할인율 계산 방법은?",
          a: "할인율 계산은 간단합니다. 원래 가격에서 할인율(%)을 곱하면 할인 금액이 나옵니다. 예: 10,000원의 20% 할인 = 10,000 x 0.20 = 2,000원 할인. 최종 가격은 10,000 - 2,000 = 8,000원입니다.",
        },
        {
          q: "이중 할인이란?",
          a: "이중 할인(또는 연속 할인)은 첫 번째 할인이 적용된 가격에 다시 추가 할인을 적용하는 것입니다. 예를 들어 20% 할인 후 추가 10% 할인은 총 28% 할인이 됩니다(30%가 아님). 이 계산기에서 '추가 할인' 기능으로 정확한 이중 할인을 계산할 수 있습니다.",
        },
        {
          q: "할인 전 가격을 역산하려면?",
          a: "이 계산기의 '역산' 탭을 사용하세요. 원래 가격과 할인된 최종 가격을 입력하면 할인율과 할인 금액을 자동으로 계산해 줍니다. 예: 원래 가격 50,000원, 최종 가격 35,000원 → 할인율 30%, 할인 금액 15,000원.",
        },
        {
          q: "몇 % 할인인지 계산하는 법?",
          a: "할인율 = (할인 금액 / 원래 가격) x 100으로 계산합니다. 예를 들어 100,000원짜리 상품을 70,000원에 샀다면, 할인 금액은 30,000원이고 할인율은 (30,000 / 100,000) x 100 = 30%입니다. 역산 모드에서 자동으로 계산할 수 있습니다.",
        },
      ]
    : [
        {
          q: "How to calculate discount?",
          a: "To calculate a discount, multiply the original price by the discount percentage divided by 100. For example, 20% off $50: $50 x 0.20 = $10 discount. Final price = $50 - $10 = $40. This calculator does all the math for you instantly.",
        },
        {
          q: "What is a double (stacked) discount?",
          a: "A double or stacked discount applies a second discount on top of the already discounted price. For example, 20% off then an additional 10% off does NOT equal 30% off. Instead: $100 x 0.80 = $80, then $80 x 0.90 = $72 (total 28% off). Use the 'Additional Discount' field in this calculator to compute stacked discounts accurately.",
        },
        {
          q: "How to find original price from discounted price?",
          a: "Switch to the 'Reverse' tab in this calculator. Enter the original price and the final (sale) price, and it will automatically calculate the discount percentage and amount saved. Formula: Discount % = ((Original - Final) / Original) x 100.",
        },
        {
          q: "How to calculate percentage off?",
          a: "Percentage off = (Discount Amount / Original Price) x 100. For example, if an item was $80 and is now $60, the discount is $20. Percentage off = ($20 / $80) x 100 = 25% off. The reverse calculator mode handles this automatically.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "모드를 선택하세요: '할인 계산'으로 할인 가격을 구하거나, '역산'으로 할인율을 계산합니다.",
        "할인 계산 모드: 원래 가격과 할인율(%)을 입력하세요. 빠른 선택 버튼으로 일반적인 할인율을 바로 적용할 수 있습니다.",
        "이중 할인이 필요하면 '추가 할인' 필드에 두 번째 할인율을 입력하세요.",
        "세금이 적용되는 경우 '세금 포함' 옵션을 켜고 세율을 입력하세요.",
        "'계산' 버튼을 클릭하면 할인 금액, 최종 가격, 총 할인율이 표시됩니다.",
      ]
    : [
        "Choose a mode: 'Calculate Discount' to find the sale price, or 'Reverse' to find the discount percentage.",
        "In Calculate mode, enter the original price and discount percentage. Use quick-select buttons for common discount rates.",
        "For stacked discounts, enter a second discount in the 'Additional Discount' field.",
        "If sales tax applies, enable 'Include Tax' and enter the tax rate.",
        "Click 'Calculate' to see the discount amount, final price, and total discount percentage.",
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
        {/* Mode selector tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("forward");
              setReverseResult(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "forward"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {isKo ? "할인 계산" : "Calculate Discount"}
          </button>
          <button
            onClick={() => {
              setMode("reverse");
              setForwardResult(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "reverse"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {isKo ? "역산 (할인율 찾기)" : "Reverse (Find %)"}
          </button>
        </div>

        {/* Forward mode */}
        {mode === "forward" && (
          <div className="space-y-4">
            {/* Original Price */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "원래 가격" : "Original Price"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {isKo ? "\u20A9" : "$"}
                </span>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder={isKo ? "100,000" : "100.00"}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "할인율" : "Discount"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="20"
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  %
                </span>
              </div>
            </div>

            {/* Quick Discount Buttons */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "빠른 선택" : "Quick Select"}
              </label>
              <div className="flex flex-wrap gap-2">
                {quickDiscounts.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleQuickDiscount(pct)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      discountPercent === String(pct)
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Discount */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "추가 할인 (이중 할인)" : "Additional Discount (Stacked)"}
                <span className="text-neutral-400 text-xs ml-2">
                  {isKo ? "선택사항" : "optional"}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={additionalDiscount}
                  onChange={(e) => setAdditionalDiscount(e.target.value)}
                  placeholder="10"
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  %
                </span>
              </div>
            </div>

            {/* Tax option */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">
                  {isKo ? "세금 포함" : "Include Sales Tax"}
                </span>
              </label>
              {includeTax && (
                <div className="relative">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder={isKo ? "10" : "8.25"}
                    className={inputClass}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                    %
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={calcForward}
                className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {isKo ? "계산하기" : "Calculate"}
              </button>
              <button
                onClick={resetForward}
                className="px-5 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {isKo ? "초기화" : "Reset"}
              </button>
            </div>
          </div>
        )}

        {/* Reverse mode */}
        {mode === "reverse" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "원래 가격" : "Original Price"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {isKo ? "\u20A9" : "$"}
                </span>
                <input
                  type="number"
                  value={reverseOriginal}
                  onChange={(e) => setReverseOriginal(e.target.value)}
                  placeholder={isKo ? "100,000" : "100.00"}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "할인된 가격 (최종 가격)" : "Sale Price (Final Price)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {isKo ? "\u20A9" : "$"}
                </span>
                <input
                  type="number"
                  value={reverseFinal}
                  onChange={(e) => setReverseFinal(e.target.value)}
                  placeholder={isKo ? "70,000" : "70.00"}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={calcReverse}
                className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {isKo ? "계산하기" : "Calculate"}
              </button>
              <button
                onClick={resetReverse}
                className="px-5 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {isKo ? "초기화" : "Reset"}
              </button>
            </div>
          </div>
        )}

        {/* Forward Results */}
        {mode === "forward" && forwardResult && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              {/* You Save - prominent */}
              <div className="rounded-lg border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30 p-5 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  {isKo ? "절약 금액" : "You Save"}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {isKo ? "\u20A9" : "$"}
                  {fmt(forwardResult.discountAmount)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ({fmtPct(forwardResult.totalDiscountPercent)}%{" "}
                  {isKo ? "할인" : "off"})
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "원래 가격" : "Original Price"}
                  </p>
                  <p className="text-xl font-semibold tracking-tight line-through text-neutral-400">
                    {isKo ? "\u20A9" : "$"}
                    {fmt(parseFloat(originalPrice))}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "최종 가격" : "Final Price"}
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {isKo ? "\u20A9" : "$"}
                    {fmt(forwardResult.finalPrice)}
                  </p>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "원래 가격" : "Original Price"}
                      </td>
                      <td className="p-3 text-right">
                        {isKo ? "\u20A9" : "$"}
                        {fmt(parseFloat(originalPrice))}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "1차 할인" : "First Discount"} (
                        {discountPercent}%)
                      </td>
                      <td className="p-3 text-right text-red-500">
                        -{isKo ? "\u20A9" : "$"}
                        {fmt(
                          parseFloat(originalPrice) *
                            (parseFloat(discountPercent) / 100)
                        )}
                      </td>
                    </tr>
                    {additionalDiscount &&
                      parseFloat(additionalDiscount) > 0 && (
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            {isKo ? "추가 할인" : "Additional Discount"} (
                            {additionalDiscount}%)
                          </td>
                          <td className="p-3 text-right text-red-500">
                            -{isKo ? "\u20A9" : "$"}
                            {fmt(
                              parseFloat(originalPrice) *
                                (1 - parseFloat(discountPercent) / 100) *
                                (parseFloat(additionalDiscount) / 100)
                            )}
                          </td>
                        </tr>
                      )}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "총 할인 금액" : "Total Discount"}
                      </td>
                      <td className="p-3 text-right text-red-500 font-medium">
                        -{isKo ? "\u20A9" : "$"}
                        {fmt(forwardResult.discountAmount)} (
                        {fmtPct(forwardResult.totalDiscountPercent)}%)
                      </td>
                    </tr>
                    {includeTax && forwardResult.taxAmount > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "세금" : "Sales Tax"} ({taxRate}%)
                        </td>
                        <td className="p-3 text-right">
                          +{isKo ? "\u20A9" : "$"}
                          {fmt(forwardResult.taxAmount)}
                        </td>
                      </tr>
                    )}
                    <tr className="font-semibold">
                      <td className="p-3">
                        {includeTax && forwardResult.taxAmount > 0
                          ? isKo
                            ? "세금 포함 최종 가격"
                            : "Final Price (incl. Tax)"
                          : isKo
                          ? "최종 가격"
                          : "Final Price"}
                      </td>
                      <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                        {isKo ? "\u20A9" : "$"}
                        {fmt(
                          includeTax && forwardResult.taxAmount > 0
                            ? forwardResult.priceAfterTax
                            : forwardResult.finalPrice
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="discount-calculator"
              labels={dict.saveImage}
            />
          </>
        )}

        {/* Reverse Results */}
        {mode === "reverse" && reverseResult && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="rounded-lg border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30 p-5 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  {isKo ? "할인율" : "Discount Rate"}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {fmtPct(reverseResult.discountPercent)}%{" "}
                  {isKo ? "할인" : "OFF"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "원래 가격" : "Original Price"}
                  </p>
                  <p className="text-xl font-semibold tracking-tight">
                    {isKo ? "\u20A9" : "$"}
                    {fmt(parseFloat(reverseOriginal))}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "할인 금액" : "You Save"}
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-red-500">
                    {isKo ? "\u20A9" : "$"}
                    {fmt(reverseResult.discountAmount)}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "최종 가격" : "Final Price"}
                  </p>
                  <p className="text-xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {isKo ? "\u20A9" : "$"}
                    {fmt(parseFloat(reverseFinal))}
                  </p>
                </div>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="discount-calculator"
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
          {howToUseSteps.map((step, i) => (
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

      {/* JSON-LD FAQPage */}
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
            href={`/${lang}/tools/percentage-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.percentageCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.percentageCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/vat-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.vatCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.vatCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="discount-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="discount-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {/* Related Blog Posts */}
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
