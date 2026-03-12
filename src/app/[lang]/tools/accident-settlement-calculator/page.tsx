"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

/* ── 타입 ── */
type AccidentType = "car-to-car" | "car-to-person" | "solo";
type TreatmentType = "inpatient" | "outpatient" | "both";
type IncomeBase = "default" | "custom";

interface SettlementResult {
  consolation: number;
  lostWagesInpatient: number;
  lostWagesOutpatient: number;
  lostWagesTotal: number;
  miscInpatient: number;
  miscOutpatient: number;
  miscTotal: number;
  futureMedical: number;
  disabilityComp: number;
  subtotal: number;
  faultDeduction: number;
  medicalCostSelf: number;
  finalMin: number;
  finalMax: number;
  finalMid: number;
  dailyIncome: number;
  inpatientDays: number;
  outpatientConverted: number;
  faultPct: number;
  medicalCost: number;
}

/* ── 상해급수 데이터 ── */
const INJURY_GRADES = [
  { grade: 1, consolation: 2000000, labelKo: "1급 (뇌손상 고도, 척추손상 등)", labelEn: "Grade 1 (Severe brain/spinal injury)" },
  { grade: 2, consolation: 1900000, labelKo: "2급", labelEn: "Grade 2" },
  { grade: 3, consolation: 1800000, labelKo: "3급", labelEn: "Grade 3" },
  { grade: 4, consolation: 1700000, labelKo: "4급", labelEn: "Grade 4" },
  { grade: 5, consolation: 1600000, labelKo: "5급", labelEn: "Grade 5" },
  { grade: 6, consolation: 1500000, labelKo: "6급", labelEn: "Grade 6" },
  { grade: 7, consolation: 1400000, labelKo: "7급", labelEn: "Grade 7" },
  { grade: 8, consolation: 1300000, labelKo: "8급", labelEn: "Grade 8" },
  { grade: 9, consolation: 1200000, labelKo: "9급", labelEn: "Grade 9" },
  { grade: 10, consolation: 800000, labelKo: "10급", labelEn: "Grade 10" },
  { grade: 11, consolation: 600000, labelKo: "11급", labelEn: "Grade 11" },
  { grade: 12, consolation: 400000, labelKo: "12급 (경상, 근육파열 등)", labelEn: "Grade 12 (Minor, muscle tear)" },
  { grade: 13, consolation: 250000, labelKo: "13급 (경추 염좌 3주 등)", labelEn: "Grade 13 (Cervical sprain 3wk)" },
  { grade: 14, consolation: 150000, labelKo: "14급 (경추 염좌 2주 등)", labelEn: "Grade 14 (Cervical sprain 2wk)" },
];

/* ── 간이 상해급수 추정 ── */
const SIMPLE_GUIDE: { diagWeeks: number; surgery: boolean; estimatedGrade: number }[] = [
  { diagWeeks: 2, surgery: false, estimatedGrade: 14 },
  { diagWeeks: 3, surgery: false, estimatedGrade: 13 },
  { diagWeeks: 4, surgery: false, estimatedGrade: 12 },
  { diagWeeks: 6, surgery: false, estimatedGrade: 11 },
  { diagWeeks: 8, surgery: false, estimatedGrade: 10 },
  { diagWeeks: 12, surgery: false, estimatedGrade: 9 },
  { diagWeeks: 2, surgery: true, estimatedGrade: 12 },
  { diagWeeks: 3, surgery: true, estimatedGrade: 11 },
  { diagWeeks: 4, surgery: true, estimatedGrade: 10 },
  { diagWeeks: 6, surgery: true, estimatedGrade: 9 },
  { diagWeeks: 8, surgery: true, estimatedGrade: 8 },
  { diagWeeks: 12, surgery: true, estimatedGrade: 6 },
];

/* ── 유틸 함수 ── */
function formatNumber(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
}

function parseFormatted(val: string): number {
  return Number(val.replace(/[^0-9]/g, "")) || 0;
}

function formatKrw(v: number): string {
  if (v <= 0) return "0";
  const eok = Math.floor(v / 100000000);
  const man = Math.floor((v % 100000000) / 10000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (parts.length === 0) return `${v.toLocaleString("ko-KR")}원`;
  return parts.join(" ") + "원";
}

function formatWon(v: number, isKo: boolean): string {
  if (isKo) return formatKrw(v);
  return v.toLocaleString("en-US") + " KRW";
}

/* ── 컴포넌트 ── */
export default function AccidentSettlementCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("accident-settlement-calculator");
  const resultRef = useRef<HTMLDivElement>(null);

  const title = isKo ? "교통사고 합의금 계산기" : "Korea Traffic Accident Settlement Calculator";
  const description = isKo
    ? "상해급수, 치료기간, 과실비율을 입력하면 교통사고 합의금을 예상 계산합니다. 위자료, 휴업손해, 향후치료비 항목별 상세 내역까지."
    : "Estimate Korean traffic accident settlement compensation. Calculate consolation money, lost wages, medical costs by injury grade and fault ratio.";

  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "text-sm font-medium block mb-2";

  /* ── 입력 상태 ── */
  // 사고 정보
  const [accidentType, setAccidentType] = useState<AccidentType>("car-to-car");
  const [faultPct, setFaultPct] = useState(0);

  // 부상 정보
  const [injuryGrade, setInjuryGrade] = useState(14);
  const [showGradeGuide, setShowGradeGuide] = useState(false);
  const [guideDiagWeeks, setGuideDiagWeeks] = useState(2);
  const [guideSurgery, setGuideSurgery] = useState(false);

  // 치료 정보
  const [treatmentType, setTreatmentType] = useState<TreatmentType>("outpatient");
  const [inpatientDays, setInpatientDays] = useState("0");
  const [outpatientVisits, setOutpatientVisits] = useState("10");
  const [medicalCostStr, setMedicalCostStr] = useState("0");

  // 소득 정보
  const [incomeBase, setIncomeBase] = useState<IncomeBase>("default");
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState("336");

  // 추가 옵션
  const [hasDisability, setHasDisability] = useState(false);
  const [disabilityRate, setDisabilityRate] = useState("10");
  const [futureMedicalStr, setFutureMedicalStr] = useState("0");

  const [result, setResult] = useState<SettlementResult | null>(null);

  const DEFAULT_DAILY_INCOME = 112000; // 도시일용근로자 2026년 기준

  const calculate = useCallback(() => {
    const gradeData = INJURY_GRADES.find((g) => g.grade === injuryGrade);
    if (!gradeData) return;

    // 위자료
    const consolation = gradeData.consolation;

    // 1일 소득
    let dailyIncome = DEFAULT_DAILY_INCOME;
    if (incomeBase === "custom") {
      const monthly = parseFormatted(monthlyIncomeStr) * 10000;
      dailyIncome = Math.max(monthly / 30, DEFAULT_DAILY_INCOME);
    }

    // 입원/통원 일수
    const inDays = treatmentType === "outpatient" ? 0 : (parseInt(inpatientDays) || 0);
    const outVisits = treatmentType === "inpatient" ? 0 : (parseInt(outpatientVisits) || 0);
    const outConvertedDays = Math.floor(outVisits / 3); // 통원 3회 = 입원 1일

    // 휴업손해
    const lostWagesInpatient = inDays * dailyIncome * 0.85;
    const lostWagesOutpatient = outConvertedDays * dailyIncome * 0.85;
    const lostWagesTotal = lostWagesInpatient + lostWagesOutpatient;

    // 제잡비 (기타 손해배상금)
    const miscInpatient = inDays * 14000;
    const miscOutpatient = outVisits * 8000;
    const miscTotal = miscInpatient + miscOutpatient;

    // 향후치료비
    const futureMedical = parseFormatted(futureMedicalStr) * 10000;

    // 후유장해 보상
    let disabilityComp = 0;
    if (hasDisability) {
      const dRate = (parseFloat(disabilityRate) || 0) / 100;
      const monthlyIncome = incomeBase === "custom"
        ? Math.max(parseFormatted(monthlyIncomeStr) * 10000, DEFAULT_DAILY_INCOME * 30)
        : DEFAULT_DAILY_INCOME * 30;
      // 간이 호프만계수 약 200 (30세 기준 참고값)
      disabilityComp = dRate * monthlyIncome * 12 * 200 * 0.5; // 보정계수 0.5
    }

    // 치료비
    const medicalCost = parseFormatted(medicalCostStr) * 10000;

    // 소계 (치료비 제외 — 보험사 기지급분이므로)
    const subtotal = consolation + lostWagesTotal + miscTotal + futureMedical + disabilityComp;

    // 과실 상계
    const fault = faultPct / 100;
    const faultDeduction = subtotal * fault;
    const medicalCostSelf = medicalCost * fault;

    const finalMid = subtotal - faultDeduction;
    const finalMin = Math.round(finalMid * 0.8);
    const finalMax = Math.round(finalMid * 1.2);

    setResult({
      consolation,
      lostWagesInpatient,
      lostWagesOutpatient,
      lostWagesTotal,
      miscInpatient,
      miscOutpatient,
      miscTotal,
      futureMedical,
      disabilityComp,
      subtotal,
      faultDeduction,
      medicalCostSelf,
      finalMin: Math.max(0, finalMin),
      finalMax: Math.max(0, finalMax),
      finalMid: Math.max(0, Math.round(finalMid)),
      dailyIncome,
      inpatientDays: inDays,
      outpatientConverted: outConvertedDays,
      faultPct,
      medicalCost,
    });
  }, [injuryGrade, incomeBase, monthlyIncomeStr, treatmentType, inpatientDays, outpatientVisits, medicalCostStr, futureMedicalStr, hasDisability, disabilityRate, faultPct]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // 간이 가이드에서 급수 추정
  const estimateGrade = useCallback(() => {
    const match = SIMPLE_GUIDE.find(
      (g) => g.diagWeeks === guideDiagWeeks && g.surgery === guideSurgery
    );
    if (match) {
      setInjuryGrade(match.estimatedGrade);
      setShowGradeGuide(false);
    }
  }, [guideDiagWeeks, guideSurgery]);

  // 파이 차트 데이터 생성
  const getPieData = () => {
    if (!result || result.subtotal <= 0) return [];
    const items: { label: string; value: number; color: string }[] = [];
    if (result.consolation > 0) items.push({ label: isKo ? "위자료" : "Consolation", value: result.consolation, color: "bg-blue-500" });
    if (result.lostWagesTotal > 0) items.push({ label: isKo ? "휴업손해" : "Lost Wages", value: result.lostWagesTotal, color: "bg-green-500" });
    if (result.miscTotal > 0) items.push({ label: isKo ? "제잡비" : "Misc. Costs", value: result.miscTotal, color: "bg-yellow-500" });
    if (result.futureMedical > 0) items.push({ label: isKo ? "향후치료비" : "Future Medical", value: result.futureMedical, color: "bg-purple-500" });
    if (result.disabilityComp > 0) items.push({ label: isKo ? "후유장해" : "Disability", value: result.disabilityComp, color: "bg-red-500" });
    return items;
  };

  const accidentTypeOptions: { value: AccidentType; label: string }[] = [
    { value: "car-to-car", label: isKo ? "차대차" : "Car-to-Car" },
    { value: "car-to-person", label: isKo ? "차대사람" : "Car-to-Pedestrian" },
    { value: "solo", label: isKo ? "단독사고" : "Solo Accident" },
  ];

  const treatmentTypeOptions: { value: TreatmentType; label: string }[] = [
    { value: "inpatient", label: isKo ? "입원" : "Inpatient" },
    { value: "outpatient", label: isKo ? "통원" : "Outpatient" },
    { value: "both", label: isKo ? "입원+통원" : "Both" },
  ];

  const diagWeekOptions = [
    { value: 2, label: isKo ? "2주" : "2 weeks" },
    { value: 3, label: isKo ? "3주" : "3 weeks" },
    { value: 4, label: isKo ? "4주" : "4 weeks" },
    { value: 6, label: isKo ? "6주" : "6 weeks" },
    { value: 8, label: isKo ? "8주" : "8 weeks" },
    { value: 12, label: isKo ? "12주 이상" : "12+ weeks" },
  ];

  const faqItems = isKo
    ? [
        {
          q: "교통사고 합의금이란 무엇인가요?",
          a: "교통사고 합의금은 사고로 인한 피해자의 손해를 배상하기 위해 가해자(보험사)가 지급하는 금액입니다. 위자료, 휴업손해, 향후치료비, 후유장해 보상 등이 포함됩니다.",
        },
        {
          q: "상해급수는 어떻게 결정되나요?",
          a: "상해급수는 자동차손해배상 보장법 시행령에 따라 1급(가장 중한 부상)~14급(경상)으로 나뉩니다. 진단서의 상병명과 치료 기간을 기준으로 보험사 또는 손해사정사가 결정합니다.",
        },
        {
          q: "보험사 첫 제시 금액이 적정한가요?",
          a: "보험사의 첫 제시 금액은 통상 적정 합의금보다 낮은 경우가 많습니다. 이 계산기로 예상 범위를 확인하고, 항목별 내역을 비교해보세요. 금액이 크게 차이나면 손해사정사나 변호사 상담을 권장합니다.",
        },
        {
          q: "합의를 언제 하는 것이 좋을까요?",
          a: "충분한 치료를 마친 후 합의하는 것이 유리합니다. 후유장해가 예상되는 경우 사고 후 최소 6개월이 지난 뒤 합의를 권장합니다. 조기 합의 시 추가 치료비를 받기 어렵습니다.",
        },
        {
          q: "과실비율은 합의금에 어떤 영향을 미치나요?",
          a: "과실비율만큼 전체 손해배상금이 차감됩니다. 예를 들어 과실 30%면 총 합의금의 30%가 줄어듭니다. 또한 치료비 중 본인 과실 비율만큼 환급해야 할 수 있습니다.",
        },
      ]
    : [
        {
          q: "What is a traffic accident settlement?",
          a: "A traffic accident settlement is the compensation paid by the at-fault party (insurer) to the victim for damages caused by the accident. It includes consolation money, lost wages, future medical costs, and disability compensation.",
        },
        {
          q: "How is the injury grade determined?",
          a: "Injury grades are classified from Grade 1 (most severe) to Grade 14 (minor) under Korea's Automobile Damage Compensation Guarantee Act. The grade is determined by the insurer or loss adjuster based on the diagnosis and treatment period.",
        },
        {
          q: "Is the insurer's first offer fair?",
          a: "The insurer's first offer is often lower than the fair settlement amount. Use this calculator to check the estimated range and compare item-by-item details. If the difference is significant, consult a loss adjuster or lawyer.",
        },
        {
          q: "When is the best time to settle?",
          a: "It is best to settle after completing sufficient treatment. If disability is expected, wait at least 6 months after the accident. Early settlement may make it difficult to claim additional medical costs.",
        },
        {
          q: "How does fault ratio affect the settlement?",
          a: "The total compensation is reduced by your fault percentage. For example, 30% fault means 30% less settlement. Additionally, you may need to reimburse your share of medical costs based on your fault ratio.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "사고 유형(차대차/차대사람/단독)과 본인 과실비율을 설정합니다.",
        "상해급수를 선택합니다. 모르면 '간이 가이드'로 진단 기간과 수술 여부로 추정합니다.",
        "치료 유형, 입원 일수, 통원 횟수, 총 치료비를 입력합니다.",
        "소득 기준을 선택합니다 (도시일용근로자 기준 또는 직접 입력).",
        "후유장해·향후치료비가 있으면 추가 입력 후 결과를 확인합니다.",
      ]
    : [
        "Set accident type and your fault percentage.",
        "Select injury grade, or use the 'Simple Guide' to estimate by diagnosis period and surgery.",
        "Enter treatment type, inpatient days, outpatient visits, and total medical costs.",
        "Choose income base (default daily worker rate or custom monthly income).",
        "Add disability rate and future medical costs if applicable, then review results.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      {/* 상단 면책 문구 */}
      <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {isKo
            ? "⚠ 본 계산기는 참고용이며, 정확한 합의금 산정은 변호사·손해사정사와 상담하세요. 실제 합의금은 사고 상황, 보험사 판단, 법원 판례에 따라 크게 달라질 수 있습니다."
            : "⚠ This calculator is for reference only. Actual settlement amounts vary significantly based on accident circumstances, insurer judgment, and court precedents. Consult a lawyer or loss adjuster for accurate assessment."}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">

        {/* ── 사고 정보 ── */}
        <div>
          <h2 className="text-base font-semibold mb-4">{isKo ? "사고 정보" : "Accident Info"}</h2>

          <div className="mb-4">
            <label className={labelClass}>{isKo ? "사고 유형" : "Accident Type"}</label>
            <div className="flex flex-wrap gap-3">
              {accidentTypeOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accidentType"
                    checked={accidentType === opt.value}
                    onChange={() => setAccidentType(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {isKo ? `과실비율 (내 과실): ${faultPct}%` : `Fault Ratio (My Fault): ${faultPct}%`}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={faultPct}
              onChange={(e) => setFaultPct(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* ── 부상 정보 ── */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h2 className="text-base font-semibold mb-4">{isKo ? "부상 정보" : "Injury Info"}</h2>

          <div className="mb-4">
            <label className={labelClass}>{isKo ? "상해급수" : "Injury Grade"}</label>
            <select
              value={injuryGrade}
              onChange={(e) => setInjuryGrade(Number(e.target.value))}
              className={inputClass}
            >
              {INJURY_GRADES.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {isKo ? g.labelKo : g.labelEn} — {isKo ? "위자료" : "Consolation"} {(g.consolation / 10000).toLocaleString()}{isKo ? "만원" : "0K KRW"}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowGradeGuide(!showGradeGuide)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {isKo ? "상해급수 잘 모르겠어요 (간이 가이드)" : "Not sure about injury grade? (Simple Guide)"}
          </button>

          {showGradeGuide && (
            <div className="mt-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {isKo ? "간이 상해급수 추정 가이드" : "Simple Injury Grade Estimation"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">
                    {isKo ? "진단 기간" : "Diagnosis Period"}
                  </label>
                  <select
                    value={guideDiagWeeks}
                    onChange={(e) => setGuideDiagWeeks(Number(e.target.value))}
                    className="w-full p-2 rounded-md border border-blue-300 dark:border-blue-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {diagWeekOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">
                    {isKo ? "수술 여부" : "Surgery"}
                  </label>
                  <div className="flex gap-3 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="guideSurgery"
                        checked={!guideSurgery}
                        onChange={() => setGuideSurgery(false)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm">{isKo ? "수술 안 함" : "No"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="guideSurgery"
                        checked={guideSurgery}
                        onChange={() => setGuideSurgery(true)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm">{isKo ? "수술 함" : "Yes"}</span>
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={estimateGrade}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {isKo ? "급수 추정 적용" : "Apply Estimation"}
              </button>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {isKo
                  ? "* 대략적인 참고치입니다. 실제 상해급수는 진단서 기준으로 보험사가 결정합니다."
                  : "* This is a rough estimate. The actual grade is determined by the insurer based on medical records."}
              </p>
            </div>
          )}
        </div>

        {/* ── 치료 정보 ── */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h2 className="text-base font-semibold mb-4">{isKo ? "치료 정보" : "Treatment Info"}</h2>

          <div className="mb-4">
            <label className={labelClass}>{isKo ? "치료 유형" : "Treatment Type"}</label>
            <div className="flex flex-wrap gap-3">
              {treatmentTypeOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="treatmentType"
                    checked={treatmentType === opt.value}
                    onChange={() => setTreatmentType(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {(treatmentType === "inpatient" || treatmentType === "both") && (
              <div>
                <label className={labelClass}>{isKo ? "입원 일수" : "Inpatient Days"}</label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={inpatientDays}
                  onChange={(e) => setInpatientDays(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            )}
            {(treatmentType === "outpatient" || treatmentType === "both") && (
              <div>
                <label className={labelClass}>{isKo ? "통원 횟수" : "Outpatient Visits"}</label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={outpatientVisits}
                  onChange={(e) => setOutpatientVisits(e.target.value)}
                  placeholder="10"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>{isKo ? "총 치료비 (만원)" : "Total Medical Cost (10K KRW)"}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={medicalCostStr}
                onChange={(e) => setMedicalCostStr(formatNumber(e.target.value))}
                placeholder="0"
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                {isKo ? "만원" : "x10K"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isKo ? "보험사가 병원에 직접 지급한 금액 포함" : "Including amounts paid directly by insurer to hospital"}
            </p>
          </div>
        </div>

        {/* ── 소득 정보 ── */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h2 className="text-base font-semibold mb-4">{isKo ? "소득 정보 (휴업손해 계산용)" : "Income Info (for Lost Wages)"}</h2>

          <div className="mb-4">
            <label className={labelClass}>{isKo ? "소득 기준" : "Income Base"}</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="incomeBase"
                  checked={incomeBase === "default"}
                  onChange={() => setIncomeBase("default")}
                  className="accent-blue-600"
                />
                <span className="text-sm">
                  {isKo ? "도시일용근로자 기준 (일당 112,000원)" : "Default Daily Worker (112,000 KRW/day)"}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="incomeBase"
                  checked={incomeBase === "custom"}
                  onChange={() => setIncomeBase("custom")}
                  className="accent-blue-600"
                />
                <span className="text-sm">{isKo ? "직접 입력" : "Custom"}</span>
              </label>
            </div>
          </div>

          {incomeBase === "custom" && (
            <div>
              <label className={labelClass}>{isKo ? "월소득 (만원)" : "Monthly Income (10K KRW)"}</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={monthlyIncomeStr}
                  onChange={(e) => setMonthlyIncomeStr(formatNumber(e.target.value))}
                  placeholder="336"
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {isKo ? "만원" : "x10K"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {isKo
                  ? "도시일용근로자 기준(일당 112,000원)보다 낮으면 기본값이 적용됩니다."
                  : "If lower than the default daily worker rate, the default will be applied."}
              </p>
            </div>
          )}
        </div>

        {/* ── 추가 옵션 ── */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h2 className="text-base font-semibold mb-4">{isKo ? "추가 옵션" : "Additional Options"}</h2>

          <div className="mb-4">
            <label className={labelClass}>{isKo ? "후유장해 여부" : "Permanent Disability"}</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="disability"
                  checked={!hasDisability}
                  onChange={() => setHasDisability(false)}
                  className="accent-blue-600"
                />
                <span className="text-sm">{isKo ? "없음" : "None"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="disability"
                  checked={hasDisability}
                  onChange={() => setHasDisability(true)}
                  className="accent-blue-600"
                />
                <span className="text-sm">{isKo ? "있음" : "Yes"}</span>
              </label>
            </div>
          </div>

          {hasDisability && (
            <div className="mb-4">
              <label className={labelClass}>{isKo ? "장해율 (%)" : "Disability Rate (%)"}</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={disabilityRate}
                  onChange={(e) => setDisabilityRate(e.target.value)}
                  placeholder="10"
                  className={`${inputClass} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                {isKo
                  ? "* 후유장해 보상은 매우 대략적인 참고치입니다. 정확한 산정은 전문가 상담이 필요합니다."
                  : "* Disability compensation is a very rough estimate. Consult a specialist for accurate assessment."}
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>{isKo ? "향후치료비 예상 (만원)" : "Future Medical Cost (10K KRW)"}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={futureMedicalStr}
                onChange={(e) => setFutureMedicalStr(formatNumber(e.target.value))}
                placeholder="0"
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                {isKo ? "만원" : "x10K"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              {/* 메인 결과 카드 */}
              <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-6 text-center">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {isKo ? "예상 합의금 범위" : "Estimated Settlement Range"}
                </p>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-700 dark:text-blue-300">
                  {formatWon(result.finalMin, isKo)} ~ {formatWon(result.finalMax, isKo)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  {isKo ? `중간값: ${formatWon(result.finalMid, isKo)}` : `Midpoint: ${formatWon(result.finalMid, isKo)}`}
                </p>
                {faultPct > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {isKo ? `과실 ${faultPct}% 적용 후 금액` : `After ${faultPct}% fault deduction`}
                  </p>
                )}
              </div>

              {/* 파이 차트 - 항목별 비중 */}
              {result.subtotal > 0 && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm font-medium mb-3">{isKo ? "합의금 구성 항목별 비중" : "Settlement Breakdown"}</p>
                  <div className="flex h-8 rounded-md overflow-hidden">
                    {getPieData().map((item, i) => (
                      <div
                        key={i}
                        className={`${item.color} flex items-center justify-center text-xs text-white font-medium`}
                        style={{ width: `${(item.value / result.subtotal) * 100}%` }}
                        title={`${item.label}: ${formatWon(item.value, isKo)}`}
                      >
                        {(item.value / result.subtotal) * 100 >= 10
                          ? `${((item.value / result.subtotal) * 100).toFixed(0)}%`
                          : ""}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs mt-2">
                    {getPieData().map((item, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-sm ${item.color} inline-block`} />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {item.label}: {formatWon(item.value, isKo)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 워터폴 차트 - 총 손해액 → 과실상계 → 최종 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-sm font-medium mb-3">{isKo ? "합의금 산정 흐름" : "Settlement Calculation Flow"}</p>
                <div className="space-y-2">
                  {/* 소계 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{isKo ? "소계 (과실 적용 전)" : "Subtotal (before fault)"}</span>
                      <span className="text-neutral-500">{formatWon(result.subtotal, isKo)}</span>
                    </div>
                    <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: "100%" }} />
                    </div>
                  </div>
                  {/* 과실 상계 */}
                  {result.faultDeduction > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {isKo ? `과실 상계 (-${faultPct}%)` : `Fault Deduction (-${faultPct}%)`}
                        </span>
                        <span className="text-neutral-500">-{formatWon(result.faultDeduction, isKo)}</span>
                      </div>
                      <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{ width: `${result.subtotal > 0 ? (result.faultDeduction / result.subtotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {/* 최종 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-green-600 dark:text-green-400">{isKo ? "최종 예상 합의금" : "Final Estimated Settlement"}</span>
                      <span className="text-neutral-500">{formatWon(result.finalMid, isKo)}</span>
                    </div>
                    <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${result.subtotal > 0 ? (result.finalMid / result.subtotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 상세 결과 테이블 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={2} className="p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {isKo ? "─ 항목별 상세 내역" : "─ Itemized Details"}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "위자료" : "Consolation Money"}</td>
                      <td className="p-3 text-right">{formatWon(result.consolation, isKo)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo
                          ? `휴업손해 (입원 ${result.inpatientDays}일 + 통원환산 ${result.outpatientConverted}일)`
                          : `Lost Wages (${result.inpatientDays}d inpatient + ${result.outpatientConverted}d outpatient equiv.)`}
                      </td>
                      <td className="p-3 text-right">{formatWon(result.lostWagesTotal, isKo)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "기타손해배상금 (제잡비)" : "Misc. Costs (Expenses)"}</td>
                      <td className="p-3 text-right">{formatWon(result.miscTotal, isKo)}</td>
                    </tr>
                    {result.futureMedical > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "향후치료비" : "Future Medical Cost"}</td>
                        <td className="p-3 text-right">{formatWon(result.futureMedical, isKo)}</td>
                      </tr>
                    )}
                    {result.disabilityComp > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "후유장해 보상 (참고치)" : "Disability Comp. (ref.)"}
                        </td>
                        <td className="p-3 text-right">{formatWon(result.disabilityComp, isKo)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "소계" : "Subtotal"}</td>
                      <td className="p-3 text-right">{formatWon(result.subtotal, isKo)}</td>
                    </tr>

                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={2} className="p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {isKo ? "─ 과실 상계" : "─ Fault Deduction"}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? `과실 상계 (${result.faultPct}%)` : `Fault Deduction (${result.faultPct}%)`}
                      </td>
                      <td className="p-3 text-right text-red-600 dark:text-red-400">
                        -{formatWon(result.faultDeduction, isKo)}
                      </td>
                    </tr>
                    {result.medicalCostSelf > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "치료비 본인부담분" : "Medical Cost (self-pay)"}
                        </td>
                        <td className="p-3 text-right text-red-600 dark:text-red-400">
                          -{formatWon(result.medicalCostSelf, isKo)}
                        </td>
                      </tr>
                    )}

                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={2} className="p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {isKo ? "─ 최종 결과" : "─ Final Result"}
                      </td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="p-3">{isKo ? "최종 예상 합의금" : "Final Est. Settlement"}</td>
                      <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                        {formatWon(result.finalMin, isKo)} ~ {formatWon(result.finalMax, isKo)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 계산 기준 정보 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-sm font-medium mb-2">{isKo ? "계산 기준" : "Calculation Basis"}</p>
                <ul className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                  <li>{isKo ? `• 1일 소득: ${result.dailyIncome.toLocaleString("ko-KR")}원` : `• Daily income: ${result.dailyIncome.toLocaleString("en-US")} KRW`}</li>
                  <li>{isKo ? "• 휴업손해 인정률: 85% (약관 기준)" : "• Lost wage rate: 85% (policy standard)"}</li>
                  <li>{isKo ? "• 통원 환산: 통원 3회 = 입원 1일" : "• Outpatient conversion: 3 visits = 1 inpatient day"}</li>
                  <li>{isKo ? "• 입원 제잡비: 일 14,000원 / 통원 제잡비: 회 8,000원" : "• Inpatient misc.: 14,000 KRW/day / Outpatient: 8,000 KRW/visit"}</li>
                  <li>{isKo ? "• 예상 범위: 중간값 기준 ±20%" : "• Range: ±20% from midpoint"}</li>
                  {result.disabilityComp > 0 && (
                    <li className="text-amber-600 dark:text-amber-400">
                      {isKo ? "• 후유장해: 간이 호프만계수(200) × 보정(0.5) 적용 참고치" : "• Disability: rough estimate using simplified Hoffman coefficient"}
                    </li>
                  )}
                </ul>
              </div>

              {/* 실용 안내 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-green-50 dark:bg-green-950/20 p-4 space-y-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {isKo ? "합의 전 체크리스트" : "Pre-Settlement Checklist"}
                </p>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>{isKo ? "• 보험사 첫 제시 금액이 적정한지 비교해보세요" : "• Compare the insurer's first offer with this estimate"}</li>
                  <li>{isKo ? "• 합의 전 충분한 치료를 마치고 진행하세요" : "• Complete sufficient treatment before settling"}</li>
                  <li>{isKo ? "• 후유장해가 예상되면 6개월 이후 합의를 권장합니다" : "• If disability is expected, settle after at least 6 months"}</li>
                  <li>{isKo ? "• 진단서, 치료비 영수증, 소득 증빙 서류를 준비하세요" : "• Prepare diagnosis, medical receipts, and income proof"}</li>
                </ul>
              </div>
            </div>

            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="accident-settlement-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      {/* 하단 면책 문구 */}
      <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {isKo
            ? "⚠ 본 계산기는 참고용 시뮬레이터이며, 법률·의료 자문을 대체하지 않습니다. 실제 합의금은 사고 상황, 보험사 판단, 법원 판례에 따라 크게 달라질 수 있습니다. 정확한 산정은 변호사·손해사정사와 상담하세요."
            : "⚠ This calculator is a reference simulator and does not replace legal or medical advice. Actual settlements vary significantly. Consult a lawyer or loss adjuster for accurate assessment."}
        </p>
      </div>

      {/* 하단 설명 섹션 */}
      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "교통사고 합의금이란?" : "What is Traffic Accident Settlement?"}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            {isKo
              ? "교통사고 합의금은 사고로 인한 피해자의 신체적·정신적·재산적 손해를 배상하기 위해 가해자(또는 보험사)가 지급하는 총 금액입니다. 합의금은 위자료, 휴업손해, 치료비, 향후치료비, 후유장해 보상 등 여러 항목으로 구성되며, 피해자의 과실비율만큼 차감됩니다. 합의는 민사상 손해배상 청구의 일환으로, 소송 없이 당사자 간 합의로 해결하는 것이 일반적입니다."
              : "A traffic accident settlement is the total amount paid by the at-fault party (or insurer) to compensate the victim for physical, mental, and property damages. It consists of consolation money, lost wages, medical costs, future medical costs, and disability compensation. The victim's fault ratio is deducted from the total. Settlement is typically resolved through mutual agreement without litigation."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "합의금 구성 항목 5가지" : "5 Components of Settlement"}</h2>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div>
              <p className="font-medium text-foreground">{isKo ? "1. 위자료" : "1. Consolation Money"}</p>
              <p>{isKo ? "정신적 고통에 대한 배상금으로, 상해급수(1~14급)에 따라 15만원~200만원이 정해져 있습니다." : "Compensation for mental suffering, fixed at 150K~2M KRW based on injury grade (1-14)."}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{isKo ? "2. 휴업손해" : "2. Lost Wages"}</p>
              <p>{isKo ? "치료 기간 동안 일하지 못해 발생한 소득 손실입니다. 입원일 × 1일 소득 × 85%, 통원은 3회=1일로 환산합니다." : "Income loss during treatment. Calculated as inpatient days × daily income × 85%. Outpatient: 3 visits = 1 day."}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{isKo ? "3. 기타손해배상금 (제잡비)" : "3. Miscellaneous Costs"}</p>
              <p>{isKo ? "교통비, 간병비 등 치료에 수반되는 비용으로, 입원 1일 14,000원, 통원 1회 8,000원이 인정됩니다." : "Transportation, nursing costs etc. Recognized at 14,000 KRW/inpatient day and 8,000 KRW/outpatient visit."}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{isKo ? "4. 향후치료비" : "4. Future Medical Cost"}</p>
              <p>{isKo ? "합의 이후에도 필요한 추가 치료비(재활, 보조기 등)가 예상되면 포함됩니다." : "Additional treatment costs expected after settlement (rehabilitation, braces, etc.)."}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{isKo ? "5. 후유장해 보상" : "5. Disability Compensation"}</p>
              <p>{isKo ? "사고 후 영구적 장해가 남은 경우, 장해율에 따라 미래 소득 손실을 보상합니다. 금액이 커서 전문가 산정이 필수입니다." : "If permanent disability remains, compensates future income loss based on disability rate. Expert assessment is essential due to large amounts."}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "상해급수 1~14급 간략 표" : "Injury Grade 1-14 Summary"}</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm border border-neutral-200 dark:border-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="p-3 text-left font-medium">{isKo ? "급수" : "Grade"}</th>
                  <th className="p-3 text-right font-medium">{isKo ? "위자료" : "Consolation"}</th>
                  <th className="p-3 text-left font-medium">{isKo ? "대표 상해" : "Example"}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { grade: "1", amount: "200", exKo: "뇌손상 고도, 사지마비", exEn: "Severe brain injury, quadriplegia" },
                  { grade: "2~3", amount: "180~190", exKo: "주요 장기 손상, 중증 골절", exEn: "Major organ damage, severe fracture" },
                  { grade: "4~6", amount: "150~170", exKo: "골절(수술 필요), 인대 파열", exEn: "Fracture (surgery), ligament tear" },
                  { grade: "7~9", amount: "120~140", exKo: "골절(비수술), 관절 손상", exEn: "Fracture (non-surgical), joint damage" },
                  { grade: "10~11", amount: "60~80", exKo: "염좌(6주 이상), 타박상", exEn: "Sprain (6+ weeks), contusion" },
                  { grade: "12", amount: "40", exKo: "경상, 근육파열", exEn: "Minor, muscle tear" },
                  { grade: "13", amount: "25", exKo: "경추 염좌 3주", exEn: "Cervical sprain 3 weeks" },
                  { grade: "14", amount: "15", exKo: "경추 염좌 2주", exEn: "Cervical sprain 2 weeks" },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 font-medium">{row.grade}{isKo ? "급" : ""}</td>
                    <td className="p-3 text-right">{row.amount}{isKo ? "만원" : "0K KRW"}</td>
                    <td className="p-3 text-neutral-500 text-xs">{isKo ? row.exKo : row.exEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "합의 시 주의사항" : "Settlement Precautions"}</h2>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {(isKo
              ? [
                  "급하게 합의하지 마세요 — 치료가 완전히 끝난 후 합의하는 것이 유리합니다",
                  "후유장해가 예상되면 최소 6개월 후 합의를 권장합니다",
                  "진단서, 치료비 영수증, 소득 증빙 서류를 빠짐없이 준비하세요",
                  "보험사 제시 금액이 부당하다면 손해사정사 또는 변호사에게 상담하세요",
                  "합의서 내용을 꼼꼼히 확인하고, 추가 청구 포기 조항에 주의하세요",
                  "형사합의와 민사합의는 별개입니다 — 혼동하지 마세요",
                ]
              : [
                  "Don't rush the settlement — it's better to settle after treatment is complete",
                  "If disability is expected, wait at least 6 months before settling",
                  "Prepare all documents: diagnosis, medical receipts, income proof",
                  "If the insurer's offer seems unfair, consult a loss adjuster or lawyer",
                  "Carefully review the settlement agreement, especially waiver clauses",
                  "Criminal and civil settlements are separate — don't confuse them",
                ]
            ).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
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
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
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
          <Link href={`/${lang}/tools/car-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.carTaxCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.carTaxCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/discount-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.discountCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.discountCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/inheritance-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.inheritanceTaxCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.inheritanceTaxCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/loan-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.loanCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.loanCalcDesc}</p>
          </Link>
        </div>
      </section>

      {/* Share & Embed */}
      <ShareButtons title={title} description={description} lang={lang} slug="accident-settlement-calculator" labels={dict.share} />
      <EmbedCodeButton slug="accident-settlement-calculator" lang={lang} labels={dict.embed} />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tr.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{tr.summary}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
