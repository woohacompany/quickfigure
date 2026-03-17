"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── City data ── */
interface CityData {
  id: string;
  nameKo: string;
  nameEn: string;
  timezone: string;
  flag: string;
}

const ALL_CITIES: CityData[] = [
  // Asia
  { id: "seoul", nameKo: "서울", nameEn: "Seoul", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { id: "tokyo", nameKo: "도쿄", nameEn: "Tokyo", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "beijing", nameKo: "베이징", nameEn: "Beijing", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "shanghai", nameKo: "상하이", nameEn: "Shanghai", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "hongkong", nameKo: "홍콩", nameEn: "Hong Kong", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  { id: "taipei", nameKo: "타이베이", nameEn: "Taipei", timezone: "Asia/Taipei", flag: "🇹🇼" },
  { id: "singapore", nameKo: "싱가포르", nameEn: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { id: "bangkok", nameKo: "방콕", nameEn: "Bangkok", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  { id: "jakarta", nameKo: "자카르타", nameEn: "Jakarta", timezone: "Asia/Jakarta", flag: "🇮🇩" },
  { id: "newdelhi", nameKo: "뉴델리", nameEn: "New Delhi", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "mumbai", nameKo: "뭄바이", nameEn: "Mumbai", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "dubai", nameKo: "두바이", nameEn: "Dubai", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { id: "istanbul", nameKo: "이스탄불", nameEn: "Istanbul", timezone: "Europe/Istanbul", flag: "🇹🇷" },
  // Americas
  { id: "newyork", nameKo: "뉴욕", nameEn: "New York", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "losangeles", nameKo: "LA", nameEn: "Los Angeles", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "chicago", nameKo: "시카고", nameEn: "Chicago", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "denver", nameKo: "덴버", nameEn: "Denver", timezone: "America/Denver", flag: "🇺🇸" },
  { id: "sanfrancisco", nameKo: "샌프란시스코", nameEn: "San Francisco", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "toronto", nameKo: "토론토", nameEn: "Toronto", timezone: "America/Toronto", flag: "🇨🇦" },
  { id: "vancouver", nameKo: "밴쿠버", nameEn: "Vancouver", timezone: "America/Vancouver", flag: "🇨🇦" },
  { id: "mexicocity", nameKo: "멕시코시티", nameEn: "Mexico City", timezone: "America/Mexico_City", flag: "🇲🇽" },
  { id: "saopaulo", nameKo: "상파울루", nameEn: "São Paulo", timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  { id: "buenosaires", nameKo: "부에노스아이레스", nameEn: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  { id: "honolulu", nameKo: "호놀룰루", nameEn: "Honolulu", timezone: "Pacific/Honolulu", flag: "🇺🇸" },
  { id: "anchorage", nameKo: "앵커리지", nameEn: "Anchorage", timezone: "America/Anchorage", flag: "🇺🇸" },
  // Europe
  { id: "london", nameKo: "런던", nameEn: "London", timezone: "Europe/London", flag: "🇬🇧" },
  { id: "paris", nameKo: "파리", nameEn: "Paris", timezone: "Europe/Paris", flag: "🇫🇷" },
  { id: "berlin", nameKo: "베를린", nameEn: "Berlin", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { id: "madrid", nameKo: "마드리드", nameEn: "Madrid", timezone: "Europe/Madrid", flag: "🇪🇸" },
  { id: "rome", nameKo: "로마", nameEn: "Rome", timezone: "Europe/Rome", flag: "🇮🇹" },
  { id: "amsterdam", nameKo: "암스테르담", nameEn: "Amsterdam", timezone: "Europe/Amsterdam", flag: "🇳🇱" },
  { id: "moscow", nameKo: "모스크바", nameEn: "Moscow", timezone: "Europe/Moscow", flag: "🇷🇺" },
  { id: "warsaw", nameKo: "바르샤바", nameEn: "Warsaw", timezone: "Europe/Warsaw", flag: "🇵🇱" },
  { id: "athens", nameKo: "아테네", nameEn: "Athens", timezone: "Europe/Athens", flag: "🇬🇷" },
  { id: "helsinki", nameKo: "헬싱키", nameEn: "Helsinki", timezone: "Europe/Helsinki", flag: "🇫🇮" },
  // Oceania
  { id: "sydney", nameKo: "시드니", nameEn: "Sydney", timezone: "Australia/Sydney", flag: "🇦🇺" },
  { id: "melbourne", nameKo: "멜버른", nameEn: "Melbourne", timezone: "Australia/Melbourne", flag: "🇦🇺" },
  { id: "auckland", nameKo: "오클랜드", nameEn: "Auckland", timezone: "Pacific/Auckland", flag: "🇳🇿" },
  { id: "brisbane", nameKo: "브리즈번", nameEn: "Brisbane", timezone: "Australia/Brisbane", flag: "🇦🇺" },
  // Africa
  { id: "cairo", nameKo: "카이로", nameEn: "Cairo", timezone: "Africa/Cairo", flag: "🇪🇬" },
  { id: "johannesburg", nameKo: "요하네스버그", nameEn: "Johannesburg", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { id: "nairobi", nameKo: "나이로비", nameEn: "Nairobi", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  { id: "lagos", nameKo: "라고스", nameEn: "Lagos", timezone: "Africa/Lagos", flag: "🇳🇬" },
];

const DEFAULT_CITY_IDS = ["seoul", "newyork", "losangeles", "london", "tokyo"];
const MAX_CITIES = 10;

/* ── Helpers ── */
function getTimeInTz(tz: string, baseDate: Date): Date {
  const str = baseDate.toLocaleString("en-US", { timeZone: tz });
  return new Date(str);
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatDate(date: Date, isKo: boolean): string {
  return date.toLocaleDateString(isKo ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function getUtcOffset(tz: string, baseDate: Date): string {
  const localStr = baseDate.toLocaleString("en-US", { timeZone: tz });
  const localDate = new Date(localStr);
  const utcStr = baseDate.toLocaleString("en-US", { timeZone: "UTC" });
  const utcDate = new Date(utcStr);
  const diffMin = Math.round((localDate.getTime() - utcDate.getTime()) / 60000);
  const sign = diffMin >= 0 ? "+" : "-";
  const absMin = Math.abs(diffMin);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return `UTC${sign}${h}${m > 0 ? `:${m.toString().padStart(2, "0")}` : ""}`;
}

function isDaytime(date: Date): boolean {
  const h = date.getHours();
  return h >= 6 && h < 18;
}

function isDst(tz: string): boolean {
  const jan = new Date(new Date().getFullYear(), 0, 1);
  const jul = new Date(new Date().getFullYear(), 6, 1);
  const janOff = getTimeInTz(tz, jan).getTime() - getTimeInTz("UTC", jan).getTime();
  const julOff = getTimeInTz(tz, jul).getTime() - getTimeInTz("UTC", jul).getTime();
  if (janOff === julOff) return false;
  const nowOff = getTimeInTz(tz, new Date()).getTime() - getTimeInTz("UTC", new Date()).getTime();
  return nowOff === Math.max(janOff, julOff);
}

function getKstDiffHours(tz: string, baseDate: Date): string {
  const kst = getTimeInTz("Asia/Seoul", baseDate);
  const target = getTimeInTz(tz, baseDate);
  const diffMin = Math.round((target.getTime() - kst.getTime()) / 60000);
  if (diffMin === 0) return "";
  const sign = diffMin > 0 ? "+" : "-";
  const absMin = Math.abs(diffMin);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const label = m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `KST ${sign}${label}`;
}

function getAmPm(date: Date, isKo: boolean): string {
  const h = date.getHours();
  if (isKo) return h < 12 ? "오전" : "오후";
  return h < 12 ? "AM" : "PM";
}

function formatSliderLabel(val: number, isKo: boolean): string {
  const h = Math.floor(val / 2);
  const m = (val % 2) * 30;
  const hStr = h.toString().padStart(2, "0");
  const mStr = m.toString().padStart(2, "0");
  if (isKo) {
    return `${h < 12 ? "오전" : "오후"} ${h === 0 ? 12 : h > 12 ? h - 12 : h}:${mStr}`;
  }
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${h < 12 ? "AM" : "PM"}`;
}

/* ── Component ── */
export default function WorldClockPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("world-clock");
  const isKo = locale === "ko";

  const [now, setNow] = useState<Date>(new Date());
  const [sliderMode, setSliderMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // 0-47 (half-hours)
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>(DEFAULT_CITY_IDS);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [meetingMode, setMeetingMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load saved cities from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("worldclock-cities");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCityIds(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save cities to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("worldclock-cities", JSON.stringify(selectedCityIds));
    } catch { /* ignore */ }
  }, [selectedCityIds]);

  // Tick every second (only in live mode)
  useEffect(() => {
    if (sliderMode) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [sliderMode]);

  // Compute base date for slider mode
  const getBaseDate = useCallback((): Date => {
    if (!sliderMode) return now;
    const today = new Date();
    const kstNow = getTimeInTz("Asia/Seoul", today);
    const h = Math.floor(sliderValue / 2);
    const m = (sliderValue % 2) * 30;
    const diff = (h * 60 + m) - (kstNow.getHours() * 60 + kstNow.getMinutes());
    return new Date(today.getTime() + diff * 60000);
  }, [sliderMode, sliderValue, now]);

  const baseDate = getBaseDate();
  const kstTime = getTimeInTz("Asia/Seoul", baseDate);

  // Set slider value from current KST when entering slider mode
  const enterSliderMode = () => {
    const kst = getTimeInTz("Asia/Seoul", new Date());
    setSliderValue(kst.getHours() * 2 + (kst.getMinutes() >= 30 ? 1 : 0));
    setSliderMode(true);
  };

  const exitSliderMode = () => {
    setSliderMode(false);
    setNow(new Date());
  };

  // City management
  const selectedCities = selectedCityIds
    .map((id) => ALL_CITIES.find((c) => c.id === id))
    .filter(Boolean) as CityData[];

  const addCity = (city: CityData) => {
    if (selectedCityIds.length >= MAX_CITIES) return;
    if (selectedCityIds.includes(city.id)) return;
    setSelectedCityIds((prev) => [...prev, city.id]);
    setShowSearch(false);
    setSearchQuery("");
  };

  const removeCity = (id: string) => {
    setSelectedCityIds((prev) => prev.filter((c) => c !== id));
  };

  const filteredCities = ALL_CITIES.filter((c) => {
    if (selectedCityIds.includes(c.id)) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      c.nameKo.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.timezone.toLowerCase().includes(q)
    );
  });

  // Drag & drop reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newIds = [...selectedCityIds];
    const [moved] = newIds.splice(dragIdx, 1);
    newIds.splice(idx, 0, moved);
    setSelectedCityIds(newIds);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  // Meeting overlap calculation
  const getMeetingOverlap = (): { start: number; end: number } | null => {
    if (selectedCities.length < 2) return null;
    let overlapStart = 0;
    let overlapEnd = 48; // half-hour slots
    for (const city of selectedCities) {
      const kst = getTimeInTz("Asia/Seoul", baseDate);
      const cityTime = getTimeInTz(city.timezone, baseDate);
      const diffMin = Math.round((cityTime.getTime() - kst.getTime()) / 60000);
      const diffSlots = Math.round(diffMin / 30);
      // Business hours: 9:00-18:00 = slots 18-36
      const cityStart = 18 - diffSlots;
      const cityEnd = 36 - diffSlots;
      overlapStart = Math.max(overlapStart, cityStart);
      overlapEnd = Math.min(overlapEnd, cityEnd);
    }
    if (overlapStart >= overlapEnd) return null;
    return { start: Math.max(0, overlapStart), end: Math.min(48, overlapEnd) };
  };

  // Focus search input
  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  const title = isKo
    ? "세계 시간 변환기 - 실시간 세계 시계"
    : "World Clock & Time Zone Converter";
  const description = isKo
    ? "한국 시간 기준으로 전 세계 도시 시간을 실시간 비교하세요. 슬라이더로 시간을 조절하면 모든 도시 시간이 동시에 변환됩니다."
    : "Compare time across world cities in real-time. Slide to convert time zones instantly. Auto DST detection.";

  const overlap = meetingMode ? getMeetingOverlap() : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* SEO Head */}
      <title>
        {isKo
          ? "세계 시간 변환기 - 한국 기준 실시간 세계 시계 & 시차 계산 | QuickFigure"
          : "World Clock & Time Zone Converter - Real-time World Time Comparison | QuickFigure"}
      </title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content={
          isKo
            ? "세계 시간, 세계 시계, 시차 계산, 시간 변환, 한국 미국 시간, 뉴욕 시간, LA 시간, 런던 시간, 도쿄 시간, 서머타임, 시차, 세계시간 변환기"
            : "world clock, time zone converter, time difference, world time, EST to KST, PST to KST, timezone converter, meeting time planner"
        }
      />
      <link rel="canonical" href={`https://quickfigure.net/${lang}/tools/world-clock`} />
      <link rel="alternate" hrefLang="en" href="https://quickfigure.net/en/tools/world-clock" />
      <link rel="alternate" hrefLang="ko" href="https://quickfigure.net/ko/tools/world-clock" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://quickfigure.net/${lang}/tools/world-clock`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="QuickFigure" />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{description}</p>
      </header>

      {/* ── KST Main Clock ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🇰🇷</span>
          <span className="font-semibold text-lg">{isKo ? "한국 시간 (KST)" : "Korea Standard Time (KST)"}</span>
          {sliderMode && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
              {isKo ? "시뮬레이션 모드" : "Simulation Mode"}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-mono font-bold tracking-tight tabular-nums">
            {formatTime(kstTime)}
          </span>
          <span className="text-lg text-neutral-500">{getAmPm(kstTime, isKo)}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {formatDate(kstTime, isKo)} · UTC+9
        </p>
      </div>

      {/* ── Time Slider ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">
            {isKo ? "⏱️ 시간 슬라이더" : "⏱️ Time Slider"}
          </h2>
          {sliderMode ? (
            <button
              onClick={exitSliderMode}
              className="text-sm px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {isKo ? "현재 시간으로 돌아가기" : "Back to Current Time"}
            </button>
          ) : (
            <button
              onClick={enterSliderMode}
              className="text-sm px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              {isKo ? "시간 조절하기" : "Adjust Time"}
            </button>
          )}
        </div>
        {sliderMode && (
          <>
            <div className="text-center mb-2">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {isKo ? "한국 시간: " : "Korea Time: "}
                {formatSliderLabel(sliderValue, isKo)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={47}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-neutral-200 dark:bg-neutral-700"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0:00</span>
              <span>6:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:30</span>
            </div>
          </>
        )}
        {!sliderMode && (
          <p className="text-sm text-neutral-500">
            {isKo
              ? "시간 조절 버튼을 눌러 한국 시간을 변경하면, 모든 도시 시간이 동시에 변환됩니다."
              : "Click \"Adjust Time\" to drag the slider and all city times update simultaneously."}
          </p>
        )}
      </div>

      {/* ── Meeting Time Finder ── */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setMeetingMode(!meetingMode)}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition ${
            meetingMode
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          {isKo ? "🤝 회의 시간 찾기" : "🤝 Find Meeting Time"}
        </button>
        {meetingMode && (
          <span className="text-sm text-neutral-500">
            {overlap
              ? isKo
                ? `겹치는 업무시간: ${formatSliderLabel(overlap.start, isKo)} ~ ${formatSliderLabel(overlap.end, isKo)} (KST)`
                : `Overlapping hours: ${formatSliderLabel(overlap.start, false)} ~ ${formatSliderLabel(overlap.end, false)} (KST)`
              : isKo
                ? "겹치는 업무시간이 없습니다."
                : "No overlapping business hours."}
          </span>
        )}
      </div>

      {/* Meeting timeline bar */}
      {meetingMode && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6 bg-white dark:bg-neutral-900">
          <p className="text-xs text-neutral-500 mb-2">
            {isKo ? "KST 기준 24시간 타임라인 (녹색 = 모든 도시 업무시간 겹침)" : "24h KST Timeline (green = all cities\u0027 business hours overlap)"}
          </p>
          <div className="flex h-6 rounded overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => {
              const isOverlap = overlap && i >= overlap.start && i < overlap.end;
              return (
                <div
                  key={i}
                  className={`flex-1 ${
                    isOverlap
                      ? "bg-emerald-400 dark:bg-emerald-600"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  } ${i > 0 ? "border-l border-neutral-200 dark:border-neutral-700" : ""}`}
                  title={formatSliderLabel(i, isKo)}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>0:00</span>
            <span>6:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:30</span>
          </div>
        </div>
      )}

      {/* ── City Cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {selectedCities.map((city, idx) => {
          const cityTime = getTimeInTz(city.timezone, baseDate);
          const day = isDaytime(cityTime);
          const dst = isDst(city.timezone);
          const diff = getKstDiffHours(city.timezone, baseDate);
          const offset = getUtcOffset(city.timezone, baseDate);
          return (
            <div
              key={city.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all ${
                day
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
                  : "bg-slate-800 border-slate-700 dark:bg-slate-900 dark:border-slate-700"
              } ${dragIdx === idx ? "opacity-50 scale-95" : ""}`}
            >
              {/* Remove button */}
              <button
                onClick={() => removeCity(city.id)}
                className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-red-100 dark:hover:bg-red-900/50 transition ${
                  day ? "text-neutral-400" : "text-neutral-500"
                }`}
                title={isKo ? "삭제" : "Remove"}
              >
                ✕
              </button>
              {/* City header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{city.flag}</span>
                <span className={`font-semibold ${day ? "" : "text-white"}`}>
                  {isKo ? city.nameKo : city.nameEn}
                </span>
                {dst && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 font-medium">
                    ☀️ DST
                  </span>
                )}
              </div>
              {/* Time */}
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-mono font-bold tabular-nums ${day ? "" : "text-white"}`}>
                  {formatTime(cityTime)}
                </span>
                <span className={`text-sm ${day ? "text-neutral-500" : "text-neutral-400"}`}>
                  {getAmPm(cityTime, isKo)}
                </span>
              </div>
              {/* Date & offset */}
              <p className={`mt-1 text-xs ${day ? "text-neutral-500" : "text-neutral-400"}`}>
                {formatDate(cityTime, isKo)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${day ? "text-neutral-400" : "text-neutral-500"}`}>{offset}</span>
                {diff && (
                  <span className={`text-xs font-medium ${day ? "text-blue-600 dark:text-blue-400" : "text-blue-300"}`}>
                    {diff}
                  </span>
                )}
              </div>
              {/* Day/Night indicator */}
              <span className={`absolute bottom-2 right-2 text-lg ${day ? "" : ""}`}>
                {day ? "☀️" : "🌙"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Add City ── */}
      <div className="mb-8">
        {!showSearch ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSearch(true)}
              disabled={selectedCityIds.length >= MAX_CITIES}
              className="px-4 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + {isKo ? "도시 추가" : "Add City"}{" "}
              <span className="text-neutral-400">({selectedCityIds.length}/{MAX_CITIES})</span>
            </button>
            {/* Quick add popular cities */}
            {["seoul", "newyork", "losangeles", "london", "tokyo", "paris", "sydney", "dubai", "singapore", "beijing"].map(
              (id) => {
                const city = ALL_CITIES.find((c) => c.id === id);
                if (!city || selectedCityIds.includes(id)) return null;
                if (selectedCityIds.length >= MAX_CITIES) return null;
                return (
                  <button
                    key={id}
                    onClick={() => addCity(city)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                  >
                    {city.flag} {isKo ? city.nameKo : city.nameEn}
                  </button>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isKo ? "도시 검색..." : "Search city..."}
                className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700"
              >
                {isKo ? "닫기" : "Close"}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => addCity(city)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center gap-2 text-sm"
                >
                  <span>{city.flag}</span>
                  <span className="font-medium">{isKo ? city.nameKo : city.nameEn}</span>
                  <span className="text-neutral-400 ml-auto text-xs">
                    {getUtcOffset(city.timezone, baseDate)}
                  </span>
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-center text-sm text-neutral-400 py-4">
                  {isKo ? "검색 결과가 없습니다." : "No results found."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── How to Use ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "상단의 한국 시간을 확인하고, 아래 도시 카드에서 실시간 시간을 비교하세요.",
                "\"시간 조절하기\" 버튼을 눌러 슬라이더를 움직이면 모든 도시 시간이 동시에 변환됩니다.",
                "\"도시 추가\" 버튼으로 원하는 도시를 추가하세요 (최대 10개).",
                "\"회의 시간 찾기\"를 누르면 모든 도시의 업무시간(9시~18시)이 겹치는 구간을 확인할 수 있습니다.",
                "카드를 드래그하여 순서를 변경할 수 있습니다. 선택한 도시는 자동 저장됩니다.",
              ]
            : [
                "Check the Korea time at the top and compare real-time clocks for all added cities below.",
                "Click \"Adjust Time\" and drag the slider to convert all city times simultaneously.",
                "Click \"Add City\" to add up to 10 cities from 40+ worldwide locations.",
                "Use \"Find Meeting Time\" to see overlapping business hours (9 AM–6 PM) across all cities.",
                "Drag cards to reorder. Your city selection is automatically saved for next visit.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* ── FAQ ── */}
      {(() => {
        const faqItems = isKo
          ? [
              {
                q: "세계 시간 변환기는 서머타임(DST)을 반영하나요?",
                a: "네, 자동으로 반영됩니다. 미국, 유럽 등 서머타임을 적용하는 도시는 현재 날짜 기준으로 자동 반영되며, DST 적용 중인 도시에는 '☀️ DST' 배지가 표시됩니다.",
              },
              {
                q: "한국과 미국의 시차는 얼마나 되나요?",
                a: "한국(KST, UTC+9)과 미국 동부(EST, UTC-5)는 14시간 차이이며, 서머타임 적용 시 13시간입니다. 서부(PST, UTC-8)와는 17시간, 서머타임 시 16시간 차이입니다.",
              },
              {
                q: "도시를 추가하면 재방문 시에도 유지되나요?",
                a: "네, 선택한 도시 목록은 브라우저의 로컬스토리지에 자동 저장되어 다음 방문 시에도 동일한 도시가 표시됩니다.",
              },
              {
                q: "회의 시간 찾기 기능은 어떻게 사용하나요?",
                a: "\"회의 시간 찾기\" 버튼을 누르면 추가된 모든 도시의 업무시간(9시~18시)이 겹치는 시간대를 KST 기준으로 녹색 타임라인에 표시합니다.",
              },
              {
                q: "최대 몇 개 도시까지 추가할 수 있나요?",
                a: "최대 10개 도시까지 추가할 수 있습니다. 전 세계 40개 이상의 주요 도시를 지원하며, 검색으로 쉽게 찾을 수 있습니다.",
              },
            ]
          : [
              {
                q: "Does this world clock support Daylight Saving Time (DST)?",
                a: "Yes, DST is automatically detected and applied. Cities currently observing DST display a '☀️ DST' badge.",
              },
              {
                q: "What is the time difference between Korea and the US?",
                a: "Korea (KST, UTC+9) is 14 hours ahead of US Eastern Time (EST, UTC-5), or 13 hours during DST. The difference with Pacific Time (PST) is 17 hours, or 16 during DST.",
              },
              {
                q: "Are my selected cities saved between visits?",
                a: "Yes, your city selection is automatically saved in your browser's local storage and will persist across visits.",
              },
              {
                q: "How does the meeting time finder work?",
                a: "Click \"Find Meeting Time\" to see a visual timeline showing where business hours (9 AM–6 PM) overlap across all your selected cities, displayed in KST.",
              },
              {
                q: "How many cities can I add?",
                a: "You can add up to 10 cities. Over 40 major world cities are available, searchable by name.",
              },
            ];

        return (
          <>
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
          </>
        );
      })()}

      {/* JSON-LD WebApplication */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: isKo ? "세계 시간 변환기" : "World Clock & Time Zone Converter",
            url: `https://quickfigure.net/${lang}/tools/world-clock`,
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: description,
            inLanguage: isKo ? "ko-KR" : "en-US",
          }),
        }}
      />

      {/* ── Related Tools ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/dday-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {dict.home.ddayCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.ddayCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/date-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {dict.home.dateCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.dateCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/timer`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {dict.home.timer}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.timerDesc}
            </p>
          </Link>
        </div>
      </section>

      {/* Share & Embed */}
      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="world-clock"
        labels={dict.share}
      />
      <EmbedCodeButton slug="world-clock" lang={lang} labels={dict.embed} />

      {/* Related Blog Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link
                  key={post.slug}
                  href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition"
                >
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <h3 className="mt-1 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
