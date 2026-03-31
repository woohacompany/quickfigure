"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
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
  // ── Asia ──
  { id: "seoul", nameKo: "서울", nameEn: "Seoul", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { id: "busan", nameKo: "부산", nameEn: "Busan", timezone: "Asia/Seoul", flag: "🇰🇷" },
  { id: "tokyo", nameKo: "도쿄", nameEn: "Tokyo", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "osaka", nameKo: "오사카", nameEn: "Osaka", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "sapporo", nameKo: "삿포로", nameEn: "Sapporo", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "nagoya", nameKo: "나고야", nameEn: "Nagoya", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "fukuoka", nameKo: "후쿠오카", nameEn: "Fukuoka", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { id: "beijing", nameKo: "베이징", nameEn: "Beijing", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "shanghai", nameKo: "상하이", nameEn: "Shanghai", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "guangzhou", nameKo: "광저우", nameEn: "Guangzhou", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "shenzhen", nameKo: "선전", nameEn: "Shenzhen", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "chongqing", nameKo: "충칭", nameEn: "Chongqing", timezone: "Asia/Shanghai", flag: "🇨🇳" },
  { id: "hongkong", nameKo: "홍콩", nameEn: "Hong Kong", timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  { id: "taipei", nameKo: "타이베이", nameEn: "Taipei", timezone: "Asia/Taipei", flag: "🇹🇼" },
  { id: "taichung", nameKo: "타이중", nameEn: "Taichung", timezone: "Asia/Taipei", flag: "🇹🇼" },
  { id: "singapore", nameKo: "싱가포르", nameEn: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { id: "kualalumpur", nameKo: "쿠알라룸푸르", nameEn: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  { id: "bangkok", nameKo: "방콕", nameEn: "Bangkok", timezone: "Asia/Bangkok", flag: "🇹🇭" },
  { id: "jakarta", nameKo: "자카르타", nameEn: "Jakarta", timezone: "Asia/Jakarta", flag: "🇮🇩" },
  { id: "hanoi", nameKo: "하노이", nameEn: "Hanoi", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { id: "hochiminh", nameKo: "호치민", nameEn: "Ho Chi Minh City", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { id: "manila", nameKo: "마닐라", nameEn: "Manila", timezone: "Asia/Manila", flag: "🇵🇭" },
  { id: "yangon", nameKo: "양곤", nameEn: "Yangon", timezone: "Asia/Yangon", flag: "🇲🇲" },
  { id: "phnompenh", nameKo: "프놈펜", nameEn: "Phnom Penh", timezone: "Asia/Phnom_Penh", flag: "🇰🇭" },
  { id: "vientiane", nameKo: "비엔티안", nameEn: "Vientiane", timezone: "Asia/Vientiane", flag: "🇱🇦" },
  { id: "newdelhi", nameKo: "뉴델리", nameEn: "New Delhi", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "mumbai", nameKo: "뭄바이", nameEn: "Mumbai", timezone: "Asia/Kolkata", flag: "🇮🇳" },
  { id: "colombo", nameKo: "콜롬보", nameEn: "Colombo", timezone: "Asia/Colombo", flag: "🇱🇰" },
  { id: "kathmandu", nameKo: "카트만두", nameEn: "Kathmandu", timezone: "Asia/Kathmandu", flag: "🇳🇵" },
  { id: "dhaka", nameKo: "다카", nameEn: "Dhaka", timezone: "Asia/Dhaka", flag: "🇧🇩" },
  { id: "karachi", nameKo: "카라치", nameEn: "Karachi", timezone: "Asia/Karachi", flag: "🇵🇰" },
  { id: "tehran", nameKo: "테헤란", nameEn: "Tehran", timezone: "Asia/Tehran", flag: "🇮🇷" },
  { id: "dubai", nameKo: "두바이", nameEn: "Dubai", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { id: "riyadh", nameKo: "리야드", nameEn: "Riyadh", timezone: "Asia/Riyadh", flag: "🇸🇦" },
  { id: "jeddah", nameKo: "제다", nameEn: "Jeddah", timezone: "Asia/Riyadh", flag: "🇸🇦" },
  { id: "doha", nameKo: "도하", nameEn: "Doha", timezone: "Asia/Qatar", flag: "🇶🇦" },
  { id: "kuwait", nameKo: "쿠웨이트시티", nameEn: "Kuwait City", timezone: "Asia/Kuwait", flag: "🇰🇼" },
  { id: "baku", nameKo: "바쿠", nameEn: "Baku", timezone: "Asia/Baku", flag: "🇦🇿" },
  { id: "tbilisi", nameKo: "트빌리시", nameEn: "Tbilisi", timezone: "Asia/Tbilisi", flag: "🇬🇪" },
  { id: "istanbul", nameKo: "이스탄불", nameEn: "Istanbul", timezone: "Europe/Istanbul", flag: "🇹🇷" },

  // ── Americas ──
  { id: "newyork", nameKo: "뉴욕", nameEn: "New York", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "losangeles", nameKo: "LA", nameEn: "Los Angeles", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "chicago", nameKo: "시카고", nameEn: "Chicago", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "denver", nameKo: "덴버", nameEn: "Denver", timezone: "America/Denver", flag: "🇺🇸" },
  { id: "sanfrancisco", nameKo: "샌프란시스코", nameEn: "San Francisco", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "lasvegas", nameKo: "라스베가스", nameEn: "Las Vegas", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "miami", nameKo: "마이애미", nameEn: "Miami", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "boston", nameKo: "보스턴", nameEn: "Boston", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "seattle", nameKo: "시애틀", nameEn: "Seattle", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "phoenix", nameKo: "피닉스", nameEn: "Phoenix", timezone: "America/Phoenix", flag: "🇺🇸" },
  { id: "dallas", nameKo: "달라스", nameEn: "Dallas", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "houston", nameKo: "휴스턴", nameEn: "Houston", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "atlanta", nameKo: "애틀랜타", nameEn: "Atlanta", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "philadelphia", nameKo: "필라델피아", nameEn: "Philadelphia", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "washingtondc", nameKo: "워싱턴DC", nameEn: "Washington DC", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "detroit", nameKo: "디트로이트", nameEn: "Detroit", timezone: "America/Detroit", flag: "🇺🇸" },
  { id: "minneapolis", nameKo: "미니애폴리스", nameEn: "Minneapolis", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "portland", nameKo: "포틀랜드", nameEn: "Portland", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "saltlakecity", nameKo: "솔트레이크시티", nameEn: "Salt Lake City", timezone: "America/Denver", flag: "🇺🇸" },
  { id: "austin", nameKo: "오스틴", nameEn: "Austin", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "nashville", nameKo: "나슈빌", nameEn: "Nashville", timezone: "America/Chicago", flag: "🇺🇸" },
  { id: "orlando", nameKo: "올랜도", nameEn: "Orlando", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "tampa", nameKo: "탬파", nameEn: "Tampa", timezone: "America/New_York", flag: "🇺🇸" },
  { id: "sandiego", nameKo: "샌디에이고", nameEn: "San Diego", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "sacramento", nameKo: "사크라멘토", nameEn: "Sacramento", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { id: "honolulu", nameKo: "호놀룰루", nameEn: "Honolulu", timezone: "Pacific/Honolulu", flag: "🇺🇸" },
  { id: "anchorage", nameKo: "앵커리지", nameEn: "Anchorage", timezone: "America/Anchorage", flag: "🇺🇸" },
  { id: "toronto", nameKo: "토론토", nameEn: "Toronto", timezone: "America/Toronto", flag: "🇨🇦" },
  { id: "vancouver", nameKo: "밴쿠버", nameEn: "Vancouver", timezone: "America/Vancouver", flag: "🇨🇦" },
  { id: "calgary", nameKo: "캘거리", nameEn: "Calgary", timezone: "America/Edmonton", flag: "🇨🇦" },
  { id: "edmonton", nameKo: "에드먼턴", nameEn: "Edmonton", timezone: "America/Edmonton", flag: "🇨🇦" },
  { id: "montreal", nameKo: "몬트리올", nameEn: "Montreal", timezone: "America/Toronto", flag: "🇨🇦" },
  { id: "ottawa", nameKo: "오타와", nameEn: "Ottawa", timezone: "America/Toronto", flag: "🇨🇦" },
  { id: "winnipeg", nameKo: "위니펙", nameEn: "Winnipeg", timezone: "America/Winnipeg", flag: "🇨🇦" },
  { id: "mexicocity", nameKo: "멕시코시티", nameEn: "Mexico City", timezone: "America/Mexico_City", flag: "🇲🇽" },
  { id: "saopaulo", nameKo: "상파울루", nameEn: "São Paulo", timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  { id: "buenosaires", nameKo: "부에노스아이레스", nameEn: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  { id: "lima", nameKo: "리마", nameEn: "Lima", timezone: "America/Lima", flag: "🇵🇪" },
  { id: "bogota", nameKo: "보고타", nameEn: "Bogotá", timezone: "America/Bogota", flag: "🇨🇴" },
  { id: "santiago", nameKo: "산티아고", nameEn: "Santiago", timezone: "America/Santiago", flag: "🇨🇱" },
  { id: "havana", nameKo: "하바나", nameEn: "Havana", timezone: "America/Havana", flag: "🇨🇺" },
  { id: "panamacity", nameKo: "파나마시티", nameEn: "Panama City", timezone: "America/Panama", flag: "🇵🇦" },
  { id: "kingston", nameKo: "킹스턴", nameEn: "Kingston", timezone: "America/Jamaica", flag: "🇯🇲" },

  // ── Europe ──
  { id: "london", nameKo: "런던", nameEn: "London", timezone: "Europe/London", flag: "🇬🇧" },
  { id: "manchester", nameKo: "맨체스터", nameEn: "Manchester", timezone: "Europe/London", flag: "🇬🇧" },
  { id: "edinburgh", nameKo: "에든버러", nameEn: "Edinburgh", timezone: "Europe/London", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { id: "dublin", nameKo: "더블린", nameEn: "Dublin", timezone: "Europe/Dublin", flag: "🇮🇪" },
  { id: "paris", nameKo: "파리", nameEn: "Paris", timezone: "Europe/Paris", flag: "🇫🇷" },
  { id: "berlin", nameKo: "베를린", nameEn: "Berlin", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { id: "munich", nameKo: "뮌헨", nameEn: "Munich", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { id: "frankfurt", nameKo: "프랑크푸르트", nameEn: "Frankfurt", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { id: "hamburg", nameKo: "함부르크", nameEn: "Hamburg", timezone: "Europe/Berlin", flag: "🇩🇪" },
  { id: "madrid", nameKo: "마드리드", nameEn: "Madrid", timezone: "Europe/Madrid", flag: "🇪🇸" },
  { id: "barcelona", nameKo: "바르셀로나", nameEn: "Barcelona", timezone: "Europe/Madrid", flag: "🇪🇸" },
  { id: "rome", nameKo: "로마", nameEn: "Rome", timezone: "Europe/Rome", flag: "🇮🇹" },
  { id: "milan", nameKo: "밀라노", nameEn: "Milan", timezone: "Europe/Rome", flag: "🇮🇹" },
  { id: "amsterdam", nameKo: "암스테르담", nameEn: "Amsterdam", timezone: "Europe/Amsterdam", flag: "🇳🇱" },
  { id: "lisbon", nameKo: "리스본", nameEn: "Lisbon", timezone: "Europe/Lisbon", flag: "🇵🇹" },
  { id: "zurich", nameKo: "취리히", nameEn: "Zurich", timezone: "Europe/Zurich", flag: "🇨🇭" },
  { id: "geneva", nameKo: "제네바", nameEn: "Geneva", timezone: "Europe/Zurich", flag: "🇨🇭" },
  { id: "vienna", nameKo: "빈", nameEn: "Vienna", timezone: "Europe/Vienna", flag: "🇦🇹" },
  { id: "prague", nameKo: "프라하", nameEn: "Prague", timezone: "Europe/Prague", flag: "🇨🇿" },
  { id: "budapest", nameKo: "부다페스트", nameEn: "Budapest", timezone: "Europe/Budapest", flag: "🇭🇺" },
  { id: "bucharest", nameKo: "부쿠레슈티", nameEn: "Bucharest", timezone: "Europe/Bucharest", flag: "🇷🇴" },
  { id: "sofia", nameKo: "소피아", nameEn: "Sofia", timezone: "Europe/Sofia", flag: "🇧🇬" },
  { id: "zagreb", nameKo: "자그레브", nameEn: "Zagreb", timezone: "Europe/Zagreb", flag: "🇭🇷" },
  { id: "warsaw", nameKo: "바르샤바", nameEn: "Warsaw", timezone: "Europe/Warsaw", flag: "🇵🇱" },
  { id: "athens", nameKo: "아테네", nameEn: "Athens", timezone: "Europe/Athens", flag: "🇬🇷" },
  { id: "helsinki", nameKo: "헬싱키", nameEn: "Helsinki", timezone: "Europe/Helsinki", flag: "🇫🇮" },
  { id: "oslo", nameKo: "오슬로", nameEn: "Oslo", timezone: "Europe/Oslo", flag: "🇳🇴" },
  { id: "stockholm", nameKo: "스톡홀름", nameEn: "Stockholm", timezone: "Europe/Stockholm", flag: "🇸🇪" },
  { id: "copenhagen", nameKo: "코펜하겐", nameEn: "Copenhagen", timezone: "Europe/Copenhagen", flag: "🇩🇰" },
  { id: "reykjavik", nameKo: "레이캬비크", nameEn: "Reykjavik", timezone: "Atlantic/Reykjavik", flag: "🇮🇸" },
  { id: "moscow", nameKo: "모스크바", nameEn: "Moscow", timezone: "Europe/Moscow", flag: "🇷🇺" },
  { id: "stpetersburg", nameKo: "상트페테르부르크", nameEn: "St. Petersburg", timezone: "Europe/Moscow", flag: "🇷🇺" },
  { id: "kyiv", nameKo: "키이우", nameEn: "Kyiv", timezone: "Europe/Kyiv", flag: "🇺🇦" },

  // ── Oceania ──
  { id: "sydney", nameKo: "시드니", nameEn: "Sydney", timezone: "Australia/Sydney", flag: "🇦🇺" },
  { id: "melbourne", nameKo: "멜버른", nameEn: "Melbourne", timezone: "Australia/Melbourne", flag: "🇦🇺" },
  { id: "brisbane", nameKo: "브리즈번", nameEn: "Brisbane", timezone: "Australia/Brisbane", flag: "🇦🇺" },
  { id: "perth", nameKo: "퍼스", nameEn: "Perth", timezone: "Australia/Perth", flag: "🇦🇺" },
  { id: "hobart", nameKo: "호바트", nameEn: "Hobart", timezone: "Australia/Hobart", flag: "🇦🇺" },
  { id: "goldcoast", nameKo: "골드코스트", nameEn: "Gold Coast", timezone: "Australia/Brisbane", flag: "🇦🇺" },
  { id: "auckland", nameKo: "오클랜드", nameEn: "Auckland", timezone: "Pacific/Auckland", flag: "🇳🇿" },
  { id: "wellington", nameKo: "웰링턴", nameEn: "Wellington", timezone: "Pacific/Auckland", flag: "🇳🇿" },
  { id: "fiji", nameKo: "피지", nameEn: "Fiji", timezone: "Pacific/Fiji", flag: "🇫🇯" },

  // ── Africa ──
  { id: "cairo", nameKo: "카이로", nameEn: "Cairo", timezone: "Africa/Cairo", flag: "🇪🇬" },
  { id: "johannesburg", nameKo: "요하네스버그", nameEn: "Johannesburg", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { id: "capetown", nameKo: "케이프타운", nameEn: "Cape Town", timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  { id: "nairobi", nameKo: "나이로비", nameEn: "Nairobi", timezone: "Africa/Nairobi", flag: "🇰🇪" },
  { id: "lagos", nameKo: "라고스", nameEn: "Lagos", timezone: "Africa/Lagos", flag: "🇳🇬" },
  { id: "casablanca", nameKo: "카사블랑카", nameEn: "Casablanca", timezone: "Africa/Casablanca", flag: "🇲🇦" },
  { id: "accra", nameKo: "아크라", nameEn: "Accra", timezone: "Africa/Accra", flag: "🇬🇭" },
  { id: "addisababa", nameKo: "아디스아바바", nameEn: "Addis Ababa", timezone: "Africa/Addis_Ababa", flag: "🇪🇹" },
  { id: "daressalaam", nameKo: "다르에스살람", nameEn: "Dar es Salaam", timezone: "Africa/Dar_es_Salaam", flag: "🇹🇿" },
  { id: "tunis", nameKo: "튀니스", nameEn: "Tunis", timezone: "Africa/Tunis", flag: "🇹🇳" },
  { id: "algiers", nameKo: "알제", nameEn: "Algiers", timezone: "Africa/Algiers", flag: "🇩🇿" },
];

const DEFAULT_CITY_IDS_KO = ["seoul", "newyork", "losangeles", "london", "tokyo"];
const DEFAULT_CITY_IDS_EN = ["losangeles", "newyork", "london", "seoul", "tokyo"];
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

function formatDateDisplay(date: Date, isKo: boolean): string {
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

function isDstForDate(tz: string, refDate: Date): boolean {
  const year = getTimeInTz(tz, refDate).getFullYear();
  const jan = new Date(year, 0, 1, 12, 0, 0);
  const jul = new Date(year, 6, 1, 12, 0, 0);
  const janOff = getTimeInTz(tz, jan).getTime() - getTimeInTz("UTC", jan).getTime();
  const julOff = getTimeInTz(tz, jul).getTime() - getTimeInTz("UTC", jul).getTime();
  if (janOff === julOff) return false;
  const nowOff = getTimeInTz(tz, refDate).getTime() - getTimeInTz("UTC", refDate).getTime();
  return nowOff === Math.max(janOff, julOff);
}

function getRefDiffLabel(refTz: string, targetTz: string, baseDate: Date, isKo: boolean): string {
  const ref = getTimeInTz(refTz, baseDate);
  const target = getTimeInTz(targetTz, baseDate);
  const diffMin = Math.round((target.getTime() - ref.getTime()) / 60000);
  if (diffMin === 0) return "";
  const sign = diffMin > 0 ? "+" : "-";
  const absMin = Math.abs(diffMin);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const label = m > 0 ? `${h}h ${m}m` : `${h}h`;
  return isKo ? `${sign}${label}` : `${sign}${label}`;
}

function getAmPm(date: Date, isKo: boolean): string {
  const h = date.getHours();
  if (isKo) return h < 12 ? "오전" : "오후";
  return h < 12 ? "AM" : "PM";
}

function formatSliderLabel(val: number, isKo: boolean): string {
  const h = Math.floor(val / 2);
  const m = (val % 2) * 30;
  const mStr = m.toString().padStart(2, "0");
  if (isKo) {
    return `${h < 12 ? "오전" : "오후"} ${h === 0 ? 12 : h > 12 ? h - 12 : h}:${mStr}`;
  }
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${h < 12 ? "AM" : "PM"}`;
}

function toDateInputStr(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ── Meeting overlap helpers ── */
interface MeetingResult {
  overlap: { start: number; end: number } | null;
  nearest: { start: number; end: number } | null;
  perCity: { cityId: string; start: number; end: number }[];
}

function calcMeetingOverlap(
  cities: CityData[],
  baseTz: string,
  baseDate: Date,
  workStart: number, // e.g. 9
  workEnd: number,   // e.g. 18
): MeetingResult {
  if (cities.length < 2) return { overlap: null, nearest: null, perCity: [] };

  const perCity: { cityId: string; start: number; end: number }[] = [];
  let overlapStart = 0;
  let overlapEnd = 48;

  for (const city of cities) {
    const baseTime = getTimeInTz(baseTz, baseDate);
    const cityTime = getTimeInTz(city.timezone, baseDate);
    const diffMin = Math.round((cityTime.getTime() - baseTime.getTime()) / 60000);
    const diffSlots = Math.round(diffMin / 30);
    // City's business hours mapped to base tz slots
    const cityStart = workStart * 2 - diffSlots;
    const cityEnd = workEnd * 2 - diffSlots;
    // Normalize to 0-47 range by finding best alignment
    let s = ((cityStart % 48) + 48) % 48;
    let e = s + (cityEnd - cityStart);
    if (e > 48) { s = 0; e = Math.min(48, cityEnd - cityStart); }
    perCity.push({ cityId: city.id, start: s, end: Math.min(48, e) });
    overlapStart = Math.max(overlapStart, s);
    overlapEnd = Math.min(overlapEnd, Math.min(48, e));
  }

  if (overlapStart < overlapEnd) {
    return { overlap: { start: overlapStart, end: overlapEnd }, nearest: null, perCity };
  }

  // No overlap: find the slot with smallest total distance to each city's business range
  let bestSlot = 0;
  let bestDist = Infinity;
  for (let slot = 0; slot < 48; slot++) {
    let totalDist = 0;
    for (const pc of perCity) {
      if (slot >= pc.start && slot < pc.end) {
        totalDist += 0;
      } else {
        const dStart = Math.min(Math.abs(slot - pc.start), Math.abs(slot - pc.start + 48), Math.abs(slot - pc.start - 48));
        const dEnd = Math.min(Math.abs(slot - (pc.end - 1)), Math.abs(slot - (pc.end - 1) + 48), Math.abs(slot - (pc.end - 1) - 48));
        totalDist += Math.min(dStart, dEnd);
      }
    }
    if (totalDist < bestDist) {
      bestDist = totalDist;
      bestSlot = slot;
    }
  }

  // Expand best slot to a range
  let nearStart = bestSlot;
  let nearEnd = bestSlot + 1;
  // Expand while distance stays minimal
  for (let s = bestSlot - 1; s >= 0; s--) {
    let ok = true;
    for (const pc of perCity) {
      if (s < pc.start && s < pc.end - 48) ok = false;
    }
    if (!ok) break;
    let dist = 0;
    for (const pc of perCity) {
      if (s < pc.start) dist += pc.start - s;
      else if (s >= pc.end) dist += s - pc.end + 1;
    }
    if (dist <= bestDist) nearStart = s;
    else break;
  }

  return { overlap: null, nearest: { start: nearStart, end: Math.min(48, nearEnd + 2) }, perCity };
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
  const [sliderValue, setSliderValue] = useState(0);
  const [simDate, setSimDate] = useState(toDateInputStr(new Date()));
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>(isKo ? DEFAULT_CITY_IDS_KO : DEFAULT_CITY_IDS_EN);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [meetingMode, setMeetingMode] = useState(false);
  const [workHourStart, setWorkHourStart] = useState(9);
  const [workHourEnd, setWorkHourEnd] = useState(18);
  const [flexMode, setFlexMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [baseCityId, setBaseCityId] = useState(isKo ? "seoul" : "losangeles");
  const [showBaseSelect, setShowBaseSelect] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const baseSelectRef = useRef<HTMLDivElement>(null);

  const baseCity = ALL_CITIES.find((c) => c.id === baseCityId) || ALL_CITIES[0];
  const baseTz = baseCity.timezone;

  // Load saved cities + base from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("worldclock-cities");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setSelectedCityIds(parsed);
      }
      const savedBase = localStorage.getItem("worldclock-base");
      if (savedBase && ALL_CITIES.find((c) => c.id === savedBase)) setBaseCityId(savedBase);
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      localStorage.setItem("worldclock-cities", JSON.stringify(selectedCityIds));
    } catch { /* ignore */ }
  }, [selectedCityIds]);

  useEffect(() => {
    try {
      localStorage.setItem("worldclock-base", baseCityId);
    } catch { /* ignore */ }
  }, [baseCityId]);

  // Close base select on outside click
  useEffect(() => {
    if (!showBaseSelect) return;
    const handler = (e: MouseEvent) => {
      if (baseSelectRef.current && !baseSelectRef.current.contains(e.target as Node)) {
        setShowBaseSelect(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBaseSelect]);

  // Tick every second (only in live mode)
  useEffect(() => {
    if (sliderMode) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [sliderMode]);

  // Compute base date for slider mode (with date picker)
  const getBaseDate = useCallback((): Date => {
    if (!sliderMode) return now;
    // Build a date from simDate + slider time in the base timezone
    const [y, mo, d] = simDate.split("-").map(Number);
    const h = Math.floor(sliderValue / 2);
    const m = (sliderValue % 2) * 30;
    // We need to find the UTC instant when base tz shows the chosen date+time
    // Approach: start from a guess, then adjust
    const guess = new Date(y, mo - 1, d, h, m, 0);
    const guessInTz = getTimeInTz(baseTz, guess);
    const diff = guess.getTime() - guessInTz.getTime();
    return new Date(guess.getTime() + diff);
  }, [sliderMode, sliderValue, simDate, now, baseTz]);

  const baseDate = getBaseDate();
  const baseTime = getTimeInTz(baseTz, baseDate);

  const enterSliderMode = () => {
    const t = getTimeInTz(baseTz, new Date());
    setSliderValue(t.getHours() * 2 + (t.getMinutes() >= 30 ? 1 : 0));
    setSimDate(toDateInputStr(t));
    setSliderMode(true);
  };

  const exitSliderMode = () => {
    setSliderMode(false);
    setNow(new Date());
  };

  // Ensure base city is always in the selected list
  useEffect(() => {
    if (!selectedCityIds.includes(baseCityId)) {
      setSelectedCityIds((prev) => [baseCityId, ...prev.slice(0, MAX_CITIES - 1)]);
    }
  }, [baseCityId, selectedCityIds]);

  // City management — base city always first
  const selectedCities = (() => {
    const ids = [baseCityId, ...selectedCityIds.filter((id) => id !== baseCityId)];
    return ids.map((id) => ALL_CITIES.find((c) => c.id === id)).filter(Boolean) as CityData[];
  })();

  const addCity = (city: CityData) => {
    if (selectedCityIds.length >= MAX_CITIES) return;
    if (selectedCityIds.includes(city.id)) return;
    setSelectedCityIds((prev) => [...prev, city.id]);
    setShowSearch(false);
    setSearchQuery("");
  };

  const removeCity = (id: string) => {
    if (id === baseCityId) return; // can't remove base city
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

  // Drag & drop reorder (skip base city at index 0)
  const handleDragStart = (idx: number) => { if (idx > 0) setDragIdx(idx); };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (idx === 0 || dragIdx === null || dragIdx === idx || dragIdx === 0) return;
    const cities = [baseCityId, ...selectedCityIds.filter((id) => id !== baseCityId)];
    const newIds = [...cities];
    const [moved] = newIds.splice(dragIdx, 1);
    newIds.splice(idx, 0, moved);
    setSelectedCityIds(newIds);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  // Meeting calculations
  const effectiveWorkStart = flexMode ? 7 : workHourStart;
  const effectiveWorkEnd = flexMode ? 22 : workHourEnd;
  const meetingResult = meetingMode
    ? calcMeetingOverlap(selectedCities, baseTz, baseDate, effectiveWorkStart, effectiveWorkEnd)
    : null;

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

  const baseCityName = isKo ? baseCity.nameKo : baseCity.nameEn;

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

        <ToolAbout slug="world-clock" locale={locale} />
      </header>

      {/* ── Base City Main Clock ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 mb-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-2xl">{baseCity.flag}</span>
          <span className="font-semibold text-lg">
            {baseCityName} ({getUtcOffset(baseTz, baseDate)})
          </span>
          {/* Base city selector */}
          <div className="relative" ref={baseSelectRef}>
            <button
              onClick={() => setShowBaseSelect(!showBaseSelect)}
              className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              {isKo ? "기준 변경" : "Change Base"}
            </button>
            {showBaseSelect && (
              <div className="absolute top-8 left-0 z-50 w-64 max-h-60 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg">
                {ALL_CITIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setBaseCityId(c.id);
                      setShowBaseSelect(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 ${
                      c.id === baseCityId ? "bg-blue-50 dark:bg-blue-900/30 font-medium" : ""
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{isKo ? c.nameKo : c.nameEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {sliderMode && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
              {isKo ? "시뮬레이션 모드" : "Simulation Mode"}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-mono font-bold tracking-tight tabular-nums">
            {formatTime(baseTime)}
          </span>
          <span className="text-lg text-neutral-500">{getAmPm(baseTime, isKo)}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {formatDateDisplay(baseTime, isKo)} · {getUtcOffset(baseTz, baseDate)}
          {isDstForDate(baseTz, baseDate) && " · ☀️ DST"}
        </p>
      </div>

      {/* ── Time Slider + Date Picker ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-semibold">
            {isKo ? "⏱️ 시간 & 날짜 조절" : "⏱️ Time & Date Control"}
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
            {/* Date picker */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                {isKo ? "날짜:" : "Date:"}
              </label>
              <input
                type="date"
                value={simDate}
                onChange={(e) => setSimDate(e.target.value)}
                className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const t = getTimeInTz(baseTz, new Date());
                  setSimDate(toDateInputStr(t));
                  setSliderValue(t.getHours() * 2 + (t.getMinutes() >= 30 ? 1 : 0));
                }}
                className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                {isKo ? "오늘로 돌아가기" : "Today"}
              </button>
            </div>
            <div className="text-center mb-2">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {baseCityName}: {formatSliderLabel(sliderValue, isKo)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={47}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-4 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-neutral-200 dark:bg-neutral-700 touch-pan-x"
              style={{ WebkitAppearance: "none" }}
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
              ? `시간 조절 버튼을 눌러 ${baseCityName} 시간을 변경하면, 모든 도시 시간이 동시에 변환됩니다. 날짜도 변경하여 서머타임 적용 여부를 확인할 수 있습니다.`
              : `Click "Adjust Time" to drag the slider and all city times update simultaneously. Change the date to check DST status for any day.`}
          </p>
        )}
      </div>

      {/* ── Meeting Time Finder ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
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
          <span className="text-xs text-neutral-400" title={isKo ? "추가된 모든 도시의 업무시간이 겹치는 시간대를 찾아줍니다" : "Finds time slots where business hours overlap across all added cities"}>
            ⓘ {isKo ? "모든 도시의 업무시간 겹침 구간 표시" : "Shows overlapping business hours across all cities"}
          </span>
        </div>

        {meetingMode && (
          <>
            {/* Work hours config */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                {isKo ? "업무시간:" : "Work hours:"}
              </label>
              <select
                value={workHourStart}
                onChange={(e) => setWorkHourStart(Number(e.target.value))}
                disabled={flexMode}
                className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-sm bg-transparent disabled:opacity-50"
              >
                {Array.from({ length: 13 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <span className="text-neutral-400">~</span>
              <select
                value={workHourEnd}
                onChange={(e) => setWorkHourEnd(Number(e.target.value))}
                disabled={flexMode}
                className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-sm bg-transparent disabled:opacity-50"
              >
                {Array.from({ length: 13 }, (_, i) => i + 12).map((h) => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={flexMode}
                  onChange={(e) => setFlexMode(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                {isKo ? "유연 근무 (07~22시)" : "Flex hours (7AM~10PM)"}
              </label>
            </div>

            {/* Result message */}
            <div className="mb-3">
              {meetingResult?.overlap ? (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {isKo
                    ? `✅ 겹치는 업무시간: ${formatSliderLabel(meetingResult.overlap.start, isKo)} ~ ${formatSliderLabel(meetingResult.overlap.end, isKo)} (${baseCityName} 기준)`
                    : `✅ Overlapping hours: ${formatSliderLabel(meetingResult.overlap.start, false)} ~ ${formatSliderLabel(meetingResult.overlap.end, false)} (${baseCityName} time)`}
                </p>
              ) : meetingResult?.nearest ? (
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {isKo
                    ? `⚠️ 겹치는 업무시간이 없습니다. 가장 가까운 시간대를 주황색으로 표시합니다. (${baseCityName} 기준 ${formatSliderLabel(meetingResult.nearest.start, isKo)} 부근)`
                    : `⚠️ No overlapping business hours. Nearest time shown in orange. (Around ${formatSliderLabel(meetingResult.nearest.start, false)} ${baseCityName} time)`}
                </p>
              ) : meetingResult ? (
                <p className="text-sm text-neutral-500">
                  {isKo ? "도시를 2개 이상 추가해주세요." : "Add at least 2 cities."}
                </p>
              ) : null}
            </div>

            {/* Timeline bar */}
            <div>
              <p className="text-xs text-neutral-500 mb-2">
                {isKo
                  ? `${baseCityName} 기준 24시간 타임라인`
                  : `24h Timeline (${baseCityName} time)`}
                {meetingResult?.overlap
                  ? isKo ? " (녹색 = 겹침)" : " (green = overlap)"
                  : meetingResult?.nearest
                    ? isKo ? " (주황색 = 가장 가까운 시간)" : " (orange = nearest time)"
                    : ""}
              </p>
              <div className="flex h-7 rounded overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => {
                  const isOverlap = meetingResult?.overlap && i >= meetingResult.overlap.start && i < meetingResult.overlap.end;
                  const isNearest = !meetingResult?.overlap && meetingResult?.nearest && i >= meetingResult.nearest.start && i < meetingResult.nearest.end;
                  return (
                    <div
                      key={i}
                      className={`flex-1 ${
                        isOverlap
                          ? "bg-emerald-400 dark:bg-emerald-600"
                          : isNearest
                            ? "bg-amber-400 dark:bg-amber-600"
                            : "bg-neutral-100 dark:bg-neutral-800"
                      } ${i > 0 ? "border-l border-neutral-200/50 dark:border-neutral-700/50" : ""}`}
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
          </>
        )}
      </div>

      {/* ── City Cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {selectedCities.map((city, idx) => {
          const cityTime = getTimeInTz(city.timezone, baseDate);
          const day = isDaytime(cityTime);
          const dst = isDstForDate(city.timezone, baseDate);
          const diff = getRefDiffLabel(baseTz, city.timezone, baseDate, isKo);
          const offset = getUtcOffset(city.timezone, baseDate);
          const isBase = city.id === baseCityId;
          return (
            <div
              key={city.id}
              draggable={!isBase}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative rounded-xl border p-4 transition-all ${
                isBase ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
              } ${!isBase ? "cursor-grab active:cursor-grabbing" : ""} ${
                day
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50"
                  : "bg-slate-800 border-slate-700 dark:bg-slate-900 dark:border-slate-700"
              } ${dragIdx === idx ? "opacity-50 scale-95" : ""}`}
            >
              {/* Remove button (not for base) */}
              {!isBase && (
                <button
                  onClick={() => removeCity(city.id)}
                  className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs hover:bg-red-100 dark:hover:bg-red-900/50 transition ${
                    day ? "text-neutral-400" : "text-neutral-500"
                  }`}
                  title={isKo ? "삭제" : "Remove"}
                >
                  ✕
                </button>
              )}
              {/* City header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{city.flag}</span>
                <span className={`font-semibold ${day ? "" : "text-white"}`}>
                  {isKo ? city.nameKo : city.nameEn}
                </span>
                {isBase && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                    {isKo ? "기준" : "Base"}
                  </span>
                )}
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
                {formatDateDisplay(cityTime, isKo)}
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
              <span className="absolute bottom-2 right-2 text-lg">
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
                placeholder={isKo ? "도시 검색 (한국어/영문)..." : "Search city (any language)..."}
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
                  <span className="text-neutral-400 text-xs">
                    {isKo ? city.nameEn : city.nameKo}
                  </span>
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
                "상단의 기준 도시 시간을 확인하고, 아래 도시 카드에서 실시간 시간을 비교하세요.",
                "\"시간 조절하기\" 버튼을 눌러 슬라이더를 움직이면 모든 도시 시간이 동시에 변환됩니다. 날짜도 변경 가능합니다.",
                "\"기준 변경\" 버튼으로 기준 도시를 원하는 도시로 바꿀 수 있습니다.",
                "\"도시 추가\" 버튼으로 150개+ 도시 중 원하는 도시를 추가하세요 (최대 10개). 한국어·영문 검색 모두 지원.",
                "\"회의 시간 찾기\"를 누르면 모든 도시의 업무시간 겹침 구간을 확인할 수 있습니다. 유연 근무 모드와 업무시간 범위 조절도 가능합니다.",
                "카드를 드래그하여 순서를 변경할 수 있습니다. 선택한 도시와 기준 도시는 자동 저장됩니다.",
              ]
            : [
                "Check the base city time at the top and compare real-time clocks for all added cities below.",
                "Click \"Adjust Time\" and drag the slider to convert all city times simultaneously. You can also change the date.",
                "Click \"Change Base\" to switch the reference city to any city you prefer.",
                "Click \"Add City\" to add up to 10 cities from 150+ worldwide locations. Search in any language.",
                "Use \"Find Meeting Time\" to see overlapping business hours across all cities. Adjust work hours or enable flex mode.",
                "Drag cards to reorder. Your city selection and base city are automatically saved.",
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
                a: "네, 자동으로 반영됩니다. 미국, 유럽 등 서머타임을 적용하는 도시는 선택한 날짜 기준으로 자동 반영되며, DST 적용 중인 도시에는 '☀️ DST' 배지가 표시됩니다. 날짜를 변경하면 해당 날짜의 서머타임 적용 여부가 자동으로 바뀝니다.",
              },
              {
                q: "한국과 미국의 시차는 얼마나 되나요?",
                a: "한국(KST, UTC+9)과 미국 동부(EST, UTC-5)는 14시간 차이이며, 서머타임 적용 시 13시간입니다. 서부(PST, UTC-8)와는 17시간, 서머타임 시 16시간 차이입니다.",
              },
              {
                q: "기준 시간을 다른 도시로 바꿀 수 있나요?",
                a: "네, 상단의 '기준 변경' 버튼을 눌러 원하는 도시를 기준으로 설정할 수 있습니다. 슬라이더와 시차 표시가 모두 새 기준 도시 기반으로 변경됩니다.",
              },
              {
                q: "회의 시간 찾기에서 겹치는 시간이 없다고 나와요.",
                a: "한국과 미국처럼 시차가 큰 경우 일반 업무시간(9시~18시) 겹침이 불가능할 수 있습니다. '유연 근무(07~22시)' 모드를 켜거나 업무시간 범위를 넓혀보세요. 겹침이 없으면 가장 가까운 시간대를 주황색으로 추천해드립니다.",
              },
              {
                q: "최대 몇 개 도시까지 추가할 수 있나요?",
                a: "최대 10개 도시까지 추가할 수 있습니다. 전 세계 150개 이상의 주요 도시를 지원하며, 한국어와 영문 모두 검색 가능합니다.",
              },
            ]
          : [
              {
                q: "Does this world clock support Daylight Saving Time (DST)?",
                a: "Yes, DST is automatically detected based on the selected date. Cities currently in DST display a '☀️ DST' badge. Change the date to check DST status for any day of the year.",
              },
              {
                q: "What is the time difference between Korea and the US?",
                a: "Korea (KST, UTC+9) is 14 hours ahead of US Eastern Time (EST, UTC-5), or 13 hours during DST. The difference with Pacific Time (PST) is 17 hours, or 16 during DST.",
              },
              {
                q: "Can I change the base/reference city?",
                a: "Yes, click the 'Change Base' button at the top to select any city as your reference. The slider and time differences will adjust accordingly.",
              },
              {
                q: "The meeting finder shows no overlapping hours.",
                a: "For cities with large time differences (e.g., US and Korea), standard 9-18 business hours don't overlap. Enable 'Flex hours (7AM-10PM)' or widen the work hour range. When no overlap exists, the nearest time is shown in orange.",
              },
              {
                q: "How many cities can I add?",
                a: "You can add up to 10 cities from over 150 worldwide locations. Search by name in any language.",
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

      <ToolHowItWorks slug="world-clock" locale={locale} />
      <ToolDisclaimer slug="world-clock" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="world-clock"
        labels={dict.share}
      />
      <EmbedCodeButton slug="world-clock" lang={lang} labels={dict.embed} />

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
