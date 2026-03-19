"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import { supabase } from "@/lib/supabase";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Types ── */
interface RoomData {
  id: string;
  room_code: string;
  title: string;
  creator_name: string;
  dates: string[];
  time_range_start: number;
  time_range_end: number;
  time_slot_minutes: number;
}

interface Participant {
  id: string;
  nickname: string;
}

interface VoteMap {
  [participantId: string]: Set<string>; // "2026-03-20_09:00"
}

type Step = "create" | "join" | "vote" | "loading" | "expired";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data } = await supabase
      .from("schedule_rooms")
      .select("id")
      .eq("room_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  return generateRoomCode();
}

function buildTimeSlots(start: number, end: number, interval: number): string[] {
  const slots: string[] = [];
  for (let h = start; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (interval === 30) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

function formatDateLabel(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = locale === "ko"
    ? ["일", "월", "화", "수", "목", "금", "토"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()];
  return locale === "ko" ? `${month}/${day} ${dow}` : `${month}/${day} ${dow}`;
}

function slotKey(date: string, time: string) {
  return `${date}_${time}`;
}

/* ── Main Component ── */
export default function ScheduleFinderPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("schedule-finder");
  const isKo = locale === "ko";

  const title = isKo
    ? "일정 맞추기 - 다 같이 되는 시간 찾기"
    : "Schedule Finder - Find When Everyone's Free";
  const description = isKo
    ? "링크 하나로 모임 시간을 정하세요. 각자 가능한 시간을 드래그하면 모두에게 맞는 최적 시간을 자동으로 찾아줍니다. 가입 없이 무료."
    : "Share a link, everyone marks their availability, and find the perfect meeting time. No signup needed. 100% free.";

  /* ── State ── */
  const [step, setStep] = useState<Step>("create");
  const [room, setRoom] = useState<RoomData | null>(null);
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<VoteMap>({});
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Create room form
  const [roomTitle, setRoomTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [timeStart, setTimeStart] = useState(9);
  const [timeEnd, setTimeEnd] = useState(22);
  const [timeInterval, setTimeInterval] = useState<30 | 60>(30);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Join room form
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  // Drag state for voting grid
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<boolean>(true); // true = select, false = deselect
  const [mySelections, setMySelections] = useState<Set<string>>(new Set());
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastTouchedSlotRef = useRef<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Check URL for room code on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code && code.length === 6) {
      const upperCode = code.toUpperCase();
      setJoinCode(upperCode);
      // Pre-check room existence and expiry
      (async () => {
        const { data } = await supabase
          .from("schedule_rooms")
          .select("*")
          .eq("room_code", upperCode)
          .single();
        if (data && (!data.is_active || (data.expires_at && new Date(data.expires_at) < new Date()))) {
          setRoom({
            id: data.id, room_code: data.room_code, title: data.title,
            creator_name: data.creator_name, dates: data.dates,
            time_range_start: data.time_range_start, time_range_end: data.time_range_end,
            time_slot_minutes: data.time_slot_minutes,
          });
          setStep("expired");
          return;
        }
        setStep("join");
      })();
    }
  }, []);

  // Poll for updates when in vote step
  useEffect(() => {
    if (step !== "vote" || !room) return;
    const fetchData = async () => {
      try {
        const [pRes, vRes] = await Promise.all([
          supabase.from("schedule_participants").select("*").eq("room_id", room.id),
          supabase.from("schedule_votes").select("*").eq("room_id", room.id).eq("available", true),
        ]);
        if (pRes.data) setParticipants(pRes.data.map((p: { id: string; nickname: string }) => ({ id: p.id, nickname: p.nickname })));
        if (vRes.data) {
          const vm: VoteMap = {};
          for (const v of vRes.data) {
            if (!vm[v.participant_id]) vm[v.participant_id] = new Set();
            vm[v.participant_id].add(slotKey(v.date, v.time_slot));
          }
          setVotes(vm);
        }
      } catch {
        // Silently handle network errors during polling
      }
    };
    fetchData();
    pollRef.current = setInterval(fetchData, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, room]);

  /* ── Calendar ── */
  const renderCalendar = () => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayLabels = isKo
      ? ["일", "월", "화", "수", "목", "금", "토"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const monthName = new Date(year, month).toLocaleDateString(isKo ? "ko-KR" : "en-US", { year: "numeric", month: "long" });

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCalendarMonth(p => {
              const nm = p.month - 1;
              return nm < 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: nm };
            })}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="font-medium text-sm">{monthName}</span>
          <button
            onClick={() => setCalendarMonth(p => {
              const nm = p.month + 1;
              return nm > 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: nm };
            })}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {dayLabels.map(d => (
            <div key={d} className="py-1 font-medium text-neutral-500 dark:text-neutral-400">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dateObj = new Date(year, month, day);
            const isPast = dateObj < today;
            const isSelected = selectedDates.includes(dateStr);
            const isFull = selectedDates.length >= 14 && !isSelected;
            return (
              <button
                key={dateStr}
                disabled={isPast || isFull}
                onClick={() => {
                  setSelectedDates(prev =>
                    prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort()
                  );
                }}
                className={`py-1.5 rounded text-sm transition-colors ${
                  isPast ? "text-neutral-300 dark:text-neutral-700 cursor-not-allowed" :
                  isSelected ? "bg-blue-600 text-white font-semibold" :
                  isFull ? "text-neutral-400 cursor-not-allowed" :
                  "hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {selectedDates.length > 0 && (
          <p className="text-xs text-neutral-500 mt-2">
            {isKo ? `${selectedDates.length}일 선택됨 (최대 14일)` : `${selectedDates.length} day(s) selected (max 14)`}
          </p>
        )}
      </div>
    );
  };

  /* ── Create Room ── */
  const handleCreateRoom = async () => {
    if (!roomTitle.trim()) { setError(isKo ? "모임 이름을 입력하세요" : "Enter a meeting name"); return; }
    if (!creatorName.trim()) { setError(isKo ? "이름을 입력하세요" : "Enter your name"); return; }
    if (selectedDates.length === 0) { setError(isKo ? "날짜를 선택하세요" : "Select at least one date"); return; }
    setError("");
    setStep("loading");

    const code = await generateUniqueRoomCode();
    const { data: roomData, error: roomErr } = await supabase
      .from("schedule_rooms")
      .insert({
        room_code: code,
        title: roomTitle.trim(),
        creator_name: creatorName.trim(),
        dates: selectedDates,
        time_range_start: timeStart,
        time_range_end: timeEnd,
        time_slot_minutes: timeInterval,
      })
      .select()
      .single();

    if (roomErr || !roomData) {
      setError(isKo ? "방 생성에 실패했습니다. 다시 시도하세요." : "Failed to create room. Please try again.");
      setStep("create");
      return;
    }

    // Add creator as participant
    const { data: pData, error: pErr } = await supabase
      .from("schedule_participants")
      .insert({ room_id: roomData.id, nickname: creatorName.trim() })
      .select()
      .single();

    if (pErr || !pData) {
      setError(isKo ? "참가자 등록에 실패했습니다." : "Failed to register participant.");
      setStep("create");
      return;
    }

    setRoom({
      id: roomData.id,
      room_code: roomData.room_code,
      title: roomData.title,
      creator_name: roomData.creator_name,
      dates: roomData.dates,
      time_range_start: roomData.time_range_start,
      time_range_end: roomData.time_range_end,
      time_slot_minutes: roomData.time_slot_minutes,
    });
    setMyParticipant({ id: pData.id, nickname: pData.nickname });
    setMySelections(new Set());

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("code", code);
    window.history.replaceState({}, "", url.toString());

    setStep("vote");
  };

  /* ── Join Room ── */
  const handleJoinRoom = async () => {
    if (!joinCode.trim() || joinCode.trim().length !== 6) { setError(isKo ? "6자리 방 코드를 입력하세요" : "Enter a 6-digit room code"); return; }
    if (!joinName.trim()) { setError(isKo ? "이름을 입력하세요" : "Enter your name"); return; }
    setError("");
    setStep("loading");

    const { data: roomData, error: roomErr } = await supabase
      .from("schedule_rooms")
      .select("*")
      .eq("room_code", joinCode.trim().toUpperCase())
      .single();

    if (roomErr || !roomData) {
      setError(isKo ? "방을 찾을 수 없습니다. 코드를 확인하세요." : "Room not found. Check the code.");
      setStep("join");
      return;
    }

    // Check if room is expired
    if (!roomData.is_active || (roomData.expires_at && new Date(roomData.expires_at) < new Date())) {
      setRoom({
        id: roomData.id,
        room_code: roomData.room_code,
        title: roomData.title,
        creator_name: roomData.creator_name,
        dates: roomData.dates,
        time_range_start: roomData.time_range_start,
        time_range_end: roomData.time_range_end,
        time_slot_minutes: roomData.time_slot_minutes,
      });
      setStep("expired");
      return;
    }

    // Check for duplicate nickname
    const { data: existing } = await supabase
      .from("schedule_participants")
      .select("id")
      .eq("room_id", roomData.id)
      .eq("nickname", joinName.trim())
      .single();

    if (existing) {
      setError(isKo ? "이미 사용 중인 이름입니다" : "This name is already taken");
      setStep("join");
      return;
    }

    const { data: pData, error: pErr } = await supabase
      .from("schedule_participants")
      .insert({ room_id: roomData.id, nickname: joinName.trim() })
      .select()
      .single();

    if (pErr || !pData) {
      setError(isKo ? "참가에 실패했습니다." : "Failed to join.");
      setStep("join");
      return;
    }

    setRoom({
      id: roomData.id,
      room_code: roomData.room_code,
      title: roomData.title,
      creator_name: roomData.creator_name,
      dates: roomData.dates,
      time_range_start: roomData.time_range_start,
      time_range_end: roomData.time_range_end,
      time_slot_minutes: roomData.time_slot_minutes,
    });
    setMyParticipant({ id: pData.id, nickname: pData.nickname });
    setMySelections(new Set());
    setStep("vote");
  };

  /* ── Voting Grid Drag ── */
  const handleCellDown = useCallback((key: string) => {
    setIsDragging(true);
    lastTouchedSlotRef.current = key;
    const willSelect = !mySelections.has(key);
    setDragMode(willSelect);
    setMySelections(prev => {
      const next = new Set(prev);
      willSelect ? next.add(key) : next.delete(key);
      return next;
    });
  }, [mySelections]);

  const handleCellEnter = useCallback((key: string) => {
    if (!isDragging) return;
    if (lastTouchedSlotRef.current === key) return;
    lastTouchedSlotRef.current = key;
    setMySelections(prev => {
      const next = new Set(prev);
      dragMode ? next.add(key) : next.delete(key);
      return next;
    });
  }, [isDragging, dragMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    lastTouchedSlotRef.current = null;
  }, []);

  // Touch move handler for grid - finds cell under finger
  const handleGridTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cellKey = el?.getAttribute("data-slot");
    if (cellKey) handleCellEnter(cellKey);
  }, [isDragging, handleCellEnter]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseUp]);

  /* ── Save Votes ── */
  const handleSaveVotes = async () => {
    if (!room || !myParticipant) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      // Delete existing votes for this participant
      const { error: delErr } = await supabase.from("schedule_votes").delete().eq("participant_id", myParticipant.id);
      if (delErr) throw delErr;

      // Insert new votes
      const inserts = Array.from(mySelections).map(key => {
        const [date, time_slot] = key.split("_");
        return {
          room_id: room.id,
          participant_id: myParticipant.id,
          date,
          time_slot,
          available: true,
        };
      });

      if (inserts.length > 0) {
        const { error: insErr } = await supabase.from("schedule_votes").insert(inserts);
        if (insErr) throw insErr;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(isKo ? "저장에 실패했습니다. 다시 시도하세요." : "Failed to save. Please try again.");
    }

    setSaving(false);
  };

  /* ── Compute Results ── */
  const computeResults = () => {
    if (!room || participants.length === 0) return [];
    const timeSlots = buildTimeSlots(room.time_range_start, room.time_range_end, room.time_slot_minutes);
    const results: { key: string; date: string; time: string; count: number; names: string[] }[] = [];

    for (const date of room.dates) {
      for (const time of timeSlots) {
        const key = slotKey(date, time);
        const names: string[] = [];
        for (const p of participants) {
          if (votes[p.id]?.has(key)) {
            names.push(p.nickname);
          }
        }
        results.push({ key, date, time, count: names.length, names });
      }
    }
    return results;
  };

  const getTopSlots = () => {
    const results = computeResults();
    if (results.length === 0) return [];
    const maxCount = Math.max(...results.map(r => r.count));
    if (maxCount === 0) return [];
    return results
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  /* ── Copy Link ── */
  const getRoomShareUrl = () =>
    room ? `${window.location.origin}/${lang}/tools/schedule-finder?code=${room.room_code}` : "";

  const getRichShareText = () => {
    if (!room) return "";
    const url = getRoomShareUrl();
    return isKo
      ? `${room.creator_name}님이 '${room.title}' 일정을 만들었어요!\n방 코드: ${room.room_code}\n지금 참여하기: ${url}`
      : `${room.creator_name} created "${room.title}" schedule!\nRoom code: ${room.room_code}\nJoin now: ${url}`;
  };

  const copyLink = async () => {
    if (!room) return;
    const text = getRichShareText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Copy Result Text ── */
  const copyResultText = async () => {
    const top = getTopSlots();
    if (top.length === 0 || !room) return;
    const best = top[0];
    const text = isKo
      ? `${room.title}: ${formatDateLabel(best.date, "ko")} ${best.time} (${best.count}/${participants.length}명 가능) - QuickFigure`
      : `${room.title}: ${formatDateLabel(best.date, "en")} ${best.time} (${best.count}/${participants.length} available) - QuickFigure`;
    try { await navigator.clipboard.writeText(text); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Share Kakao ── */
  const shareKakao = () => {
    if (!room) return;
    const w = window as typeof window & {
      Kakao?: {
        isInitialized: () => boolean;
        Share: { sendDefault: (config: Record<string, unknown>) => void };
      };
      __KAKAO_INIT__?: () => boolean;
      __KAKAO_READY__?: boolean;
    };
    if (!w.__KAKAO_READY__ && w.__KAKAO_INIT__) w.__KAKAO_INIT__();
    if (!w.Kakao || !w.Kakao.isInitialized()) return;

    const url = getRoomShareUrl();
    const kakaoTitle = isKo
      ? `${room.title} 일정 투표`
      : `${room.title} - Schedule Poll`;
    const kakaoDesc = isKo
      ? `${room.creator_name}님이 일정을 만들었습니다. 지금 참여하세요!\n방 코드: ${room.room_code}`
      : `${room.creator_name} created a schedule poll. Join now!\nRoom code: ${room.room_code}`;
    w.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: kakaoTitle,
        description: kakaoDesc,
        imageUrl: `${window.location.origin}/og-image.png`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: isKo ? "일정 참여하기" : "Join Schedule", link: { mobileWebUrl: url, webUrl: url } }],
    });
  };

  /* ── Styles ── */
  const inputClass = "w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
  const btnPrimary = "px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const btnSecondary = "px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer";

  /* ── How to Steps ── */
  const howToSteps = isKo
    ? [
        "날짜와 시간 범위를 선택하고 방을 만드세요.",
        "생성된 링크를 친구들에게 공유하세요.",
        "각자 가능한 시간을 드래그로 선택하세요.",
        "모두에게 맞는 최적 시간을 자동으로 확인하세요.",
      ]
    : [
        "Pick dates and time range, then create a room.",
        "Share the generated link with friends.",
        "Everyone drags to mark their available times.",
        "See the best time that works for all automatically.",
      ];

  /* ── FAQ ── */
  const faqItems = isKo
    ? [
        { q: "일정 맞추기는 무료인가요?", a: "네, 완전 무료이며 회원가입도 필요 없습니다. 링크를 공유하기만 하면 누구나 참여할 수 있습니다." },
        { q: "최대 몇 명까지 참여할 수 있나요?", a: "인원 제한 없이 누구나 링크를 통해 참여할 수 있습니다. 방 코드만 있으면 됩니다." },
        { q: "방은 얼마나 유지되나요?", a: "방은 생성 후 7일간 유지됩니다. 이후 자동으로 만료됩니다." },
        { q: "투표를 수정할 수 있나요?", a: "네, 같은 이름으로 다시 접속하여 투표를 수정하고 저장할 수 있습니다." },
        { q: "when2meet과 뭐가 다른가요?", a: "QuickFigure 일정 맞추기는 한국어를 완벽 지원하고, 모바일에 최적화된 터치 드래그 인터페이스를 제공하며, 카카오톡 공유 기능을 지원합니다." },
      ]
    : [
        { q: "Is Schedule Finder free?", a: "Yes, it's completely free with no signup required. Just share the link and anyone can participate." },
        { q: "How many people can join?", a: "There's no limit on participants. Anyone with the room code or link can join." },
        { q: "How long does a room last?", a: "Rooms remain active for 7 days after creation, then automatically expire." },
        { q: "Can I change my votes?", a: "Yes, you can modify your availability selections and save again at any time." },
        { q: "How is this different from when2meet?", a: "Schedule Finder offers a modern, mobile-friendly interface with touch drag support, KakaoTalk sharing for Korean users, and a cleaner design." },
      ];

  /* ── Render: Voting Grid ── */
  const renderVotingGrid = () => {
    if (!room) return null;
    const timeSlots = buildTimeSlots(room.time_range_start, room.time_range_end, room.time_slot_minutes);
    const results = computeResults();
    const maxParticipants = participants.length || 1;

    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="min-w-[400px]">
          {/* Header: Dates */}
          <div className="flex">
            <div className="w-14 shrink-0" />
            {room.dates.map(date => (
              <div key={date} className="flex-1 text-center text-xs font-medium py-2 min-w-[52px]">
                {formatDateLabel(date, locale)}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            ref={gridRef}
            className="select-none"
            style={{ touchAction: showResults ? "auto" : "none" }}
            onMouseLeave={() => setHoveredSlot(null)}
            onTouchMove={showResults ? undefined : handleGridTouchMove}
          >
            {timeSlots.map(time => (
              <div key={time} className="flex">
                <div className="w-14 shrink-0 text-xs text-neutral-500 dark:text-neutral-400 pr-2 text-right leading-[44px]">
                  {time}
                </div>
                {room.dates.map(date => {
                  const key = slotKey(date, time);
                  const isMySelected = mySelections.has(key);
                  const result = results.find(r => r.key === key);
                  const count = result?.count ?? 0;
                  const ratio = count / maxParticipants;

                  if (showResults) {
                    const bgOpacity = count === 0 ? 0 : 0.15 + ratio * 0.85;
                    const isAll = count === maxParticipants && count > 0;
                    return (
                      <div
                        key={key}
                        className={`flex-1 min-w-[52px] h-11 border border-neutral-200 dark:border-neutral-700 relative group transition-colors ${
                          isAll ? "ring-1 ring-blue-500" : ""
                        }`}
                        style={{
                          backgroundColor: count > 0 ? `rgba(34, 197, 94, ${bgOpacity})` : undefined,
                        }}
                        onMouseEnter={() => setHoveredSlot(key)}
                        onMouseLeave={() => setHoveredSlot(null)}
                      >
                        {count > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-green-900 dark:text-green-100">
                            {count}
                          </span>
                        )}
                        {/* Tooltip */}
                        {hoveredSlot === key && result && result.names.length > 0 && (
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] whitespace-nowrap shadow-lg pointer-events-none">
                            {isKo ? "가능: " : "Available: "}{result.names.join(", ")} ({count}/{maxParticipants})
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={key}
                      className={`flex-1 min-w-[52px] h-11 border cursor-pointer transition-colors ${
                        isMySelected
                          ? "bg-blue-500 border-blue-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      }`}
                      onMouseDown={(e) => { e.preventDefault(); handleCellDown(key); }}
                      onMouseEnter={() => handleCellEnter(key)}
                      onTouchStart={() => { handleCellDown(key); }}
                      data-slot={key}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── Render: Top Results ── */
  const renderTopResults = () => {
    const top = getTopSlots();
    if (top.length === 0) return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {isKo ? "아직 투표가 없습니다." : "No votes yet."}
      </p>
    );

    const allAvail = top.filter(t => t.count === participants.length);
    return (
      <div className="space-y-3">
        {allAvail.length > 0 && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">
              {isKo ? "모두 가능한 시간" : "Everyone available"}
            </p>
            {allAvail.map(s => (
              <p key={s.key} className="text-sm font-medium text-green-800 dark:text-green-200">
                {formatDateLabel(s.date, locale)} {s.time}
              </p>
            ))}
          </div>
        )}
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          {isKo ? "추천 시간 TOP 5" : "Top 5 Recommended Times"}
        </p>
        {top.map((s, i) => (
          <div key={s.key} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? "bg-yellow-400 text-yellow-900" :
              i === 1 ? "bg-neutral-300 text-neutral-700" :
              i === 2 ? "bg-orange-300 text-orange-800" :
              "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
            }`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{formatDateLabel(s.date, locale)} {s.time}</p>
              <p className="text-xs text-neutral-500 truncate">{s.names.join(", ")}</p>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {s.count}/{participants.length}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">{description}</p>

      {/* Steps Guide */}
      {step === "create" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(isKo
            ? ["1. 날짜와 시간을 선택하고 방을 만드세요", "2. 생성된 링크를 친구들에게 공유하세요", "3. 각자 가능한 시간을 드래그하세요", "4. 모두에게 맞는 최적 시간을 확인하세요"]
            : ["1. Pick dates and times, create a room", "2. Share the link with friends", "3. Everyone drags their available times", "4. See the best time that works for all"]
          ).map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {step === "loading" && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Expired Room */}
      {step === "expired" && room && (
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <div className="text-5xl mb-4">&#8987;</div>
          <h2 className="text-xl font-bold">
            {isKo ? "이 방은 만료되었습니다" : "This room has expired"}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo
              ? `"${room.title}" 방은 7일이 지나 만료되었습니다. 새 방을 만들어주세요.`
              : `The room "${room.title}" has expired after 7 days. Please create a new room.`}
          </p>
          <button onClick={() => { setStep("create"); setRoom(null); setError(""); }} className={btnPrimary}>
            {isKo ? "새 방 만들기" : "Create New Room"}
          </button>
        </div>
      )}

      {/* STEP 1: Create Room */}
      {step === "create" && (
        <div className="space-y-6">
          <div className="flex gap-3 mb-4">
            <button className={btnPrimary} disabled>{isKo ? "방 만들기" : "Create Room"}</button>
            <button className={btnSecondary} onClick={() => { setStep("join"); setError(""); }}>
              {isKo ? "방 입장하기" : "Join Room"}
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isKo ? "모임 이름" : "Meeting Name"}
                </label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={e => setRoomTitle(e.target.value)}
                  placeholder={isKo ? "예: 3월 팀 회식" : "e.g., Team Lunch March"}
                  className={inputClass}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isKo ? "내 이름" : "Your Name"}
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={e => setCreatorName(e.target.value)}
                  placeholder={isKo ? "예: 유진" : "e.g., Eugene"}
                  className={inputClass}
                  maxLength={20}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isKo ? "시작 시간" : "Start Time"}
                  </label>
                  <select value={timeStart} onChange={e => setTimeStart(+e.target.value)} className={inputClass}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} disabled={i >= timeEnd}>{`${String(i).padStart(2, "0")}:00`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isKo ? "종료 시간" : "End Time"}
                  </label>
                  <select value={timeEnd} onChange={e => setTimeEnd(+e.target.value)} className={inputClass}>
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(i => (
                      <option key={i} value={i} disabled={i <= timeStart}>{`${String(i).padStart(2, "0")}:00`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isKo ? "시간 간격" : "Time Interval"}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTimeInterval(30)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      timeInterval === 30 ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    30{isKo ? "분" : "min"}
                  </button>
                  <button
                    onClick={() => setTimeInterval(60)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      timeInterval === 60 ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    1{isKo ? "시간" : "hr"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Calendar */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {isKo ? "날짜 선택" : "Select Dates"}
              </label>
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                {renderCalendar()}
              </div>
            </div>
          </div>

          <button onClick={handleCreateRoom} className={btnPrimary}>
            {isKo ? "방 만들기" : "Create Room"}
          </button>
        </div>
      )}

      {/* STEP 2: Join Room */}
      {step === "join" && (
        <div className="space-y-6 max-w-md">
          <div className="flex gap-3 mb-4">
            <button className={btnSecondary} onClick={() => { setStep("create"); setError(""); }}>
              {isKo ? "방 만들기" : "Create Room"}
            </button>
            <button className={btnPrimary} disabled>{isKo ? "방 입장하기" : "Join Room"}</button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {isKo ? "방 코드 (6자리)" : "Room Code (6 digits)"}
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="A3K9X2"
              className={`${inputClass} text-center text-lg tracking-widest font-mono`}
              maxLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {isKo ? "내 이름" : "Your Name"}
            </label>
            <input
              type="text"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              placeholder={isKo ? "예: 유진" : "e.g., Eugene"}
              className={inputClass}
              maxLength={20}
            />
          </div>
          <button onClick={handleJoinRoom} className={btnPrimary}>
            {isKo ? "참가하기" : "Join"}
          </button>
        </div>
      )}

      {/* STEP 3: Vote */}
      {step === "vote" && room && (
        <div className="space-y-6">
          {/* Room Info Bar */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800">
              <h2 className="font-semibold text-lg truncate">{room.title}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isKo ? `${room.creator_name}님이 생성` : `Created by ${room.creator_name}`}
                {" · "}
                {participants.length}{isKo ? "명 참가" : " participant(s)"}
              </p>
            </div>
            <div className="p-4 flex flex-col sm:flex-row items-center gap-3">
              {/* Room code prominent display */}
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "방 코드" : "Code"}</span>
                <span className="font-mono text-xl font-bold tracking-[0.2em]">{room.room_code}</span>
              </div>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                <button onClick={copyLink} className={btnSecondary}>
                  {copied ? (isKo ? "복사됨!" : "Copied!") : (isKo ? "링크 복사" : "Copy Link")}
                </button>
                {isKo && (
                  <button onClick={shareKakao} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FEE500] text-[#191919] text-sm font-medium hover:bg-[#FDD800] transition-colors cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.687 1.747 5.049 4.387 6.394l-.913 3.37a.3.3 0 0 0 .458.33l3.918-2.592c.68.097 1.38.148 2.09.148h.06C17.523 18.341 22 14.879 22 10.691 22 6.463 17.523 3 12 3" />
                    </svg>
                    카카오톡 공유
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Toggle: My Vote / Results */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowResults(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                !showResults ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {isKo ? "내 시간 선택" : "My Availability"}
            </button>
            <button
              onClick={() => setShowResults(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                showResults ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {isKo ? "결과 보기" : "View Results"} ({participants.length})
            </button>
          </div>

          {/* Grid */}
          {!showResults && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isKo ? "가능한 시간을 클릭하거나 드래그하세요. 다시 클릭하면 해제됩니다." : "Click or drag to select available times. Click again to deselect."}
            </p>
          )}
          {renderVotingGrid()}

          {/* Save Button (my vote) */}
          {!showResults && (
            <div className="flex items-center gap-3">
              <button onClick={handleSaveVotes} className={`${btnPrimary} ${saved ? "!bg-green-600 hover:!bg-green-700" : ""}`} disabled={saving}>
                {saving
                  ? (isKo ? "저장 중..." : "Saving...")
                  : saved
                  ? (isKo ? "저장 완료!" : "Saved!")
                  : (isKo ? "투표 저장" : "Save Vote")}
              </button>
              <span className="text-xs text-neutral-500">
                {mySelections.size}{isKo ? "개 선택됨" : " selected"}
              </span>
            </div>
          )}

          {/* Results Panel */}
          {showResults && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                {isKo ? "최적 시간 추천" : "Best Time Recommendations"}
              </h3>
              {renderTopResults()}
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={copyResultText} className={btnSecondary}>
                  {copied ? (isKo ? "복사됨!" : "Copied!") : (isKo ? "결과 복사" : "Copy Result")}
                </button>
                {isKo && (
                  <button onClick={shareKakao} className="px-4 py-2 rounded-lg bg-[#FEE500] text-[#191919] text-sm font-medium hover:bg-[#FDD800] transition-colors cursor-pointer">
                    카카오톡 공유
                  </button>
                )}
              </div>
              {/* Participants List */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  {isKo ? "참가자" : "Participants"} ({participants.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {participants.map(p => (
                    <span key={p.id} className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">
                      {p.nickname}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── How to Use ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {/* ── FAQ ── */}
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

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                mainEntity: faqItems.map(item => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              },
              {
                "@type": "WebApplication",
                name: title,
                description,
                url: `https://quickfigure.net/${lang}/tools/schedule-finder`,
                applicationCategory: "UtilitiesApplication",
                operatingSystem: "All",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
            ],
          }),
        }}
      />

      {/* ── Related Tools ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/dday-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.ddayCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.ddayCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/world-clock`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.worldClock}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.worldClockDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="schedule-finder"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="schedule-finder"
        lang={lang}
        labels={dict.embed}
      />

      {/* ── Related Blog Posts ── */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map(post => {
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
