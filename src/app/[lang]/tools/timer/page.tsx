"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

type Tab = "countdown" | "stopwatch" | "pomodoro";

function padZero(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${padZero(h)}:${padZero(m)}:${padZero(s)}`;
}

function formatMsWithCenti(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${padZero(h)}:${padZero(m)}:${padZero(s)}.${padZero(cs)}`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "square";
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.stop(ctx.currentTime + 0.8);

    // Play 3 beeps
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 880;
      osc2.type = "square";
      gain2.gain.value = 0.3;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    }, 300);

    setTimeout(() => {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.value = 1100;
      osc3.type = "square";
      gain3.gain.value = 0.3;
      osc3.start();
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      osc3.stop(ctx.currentTime + 1);
    }, 600);
  } catch {
    // Web Audio API not supported
  }
}

export default function TimerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("timer");
  const isKo = locale === "ko";

  // --- Tab ---
  const [tab, setTab] = useState<Tab>("countdown");

  // --- Countdown ---
  const [cdHours, setCdHours] = useState(0);
  const [cdMinutes, setCdMinutes] = useState(5);
  const [cdSeconds, setCdSeconds] = useState(0);
  const [cdRemaining, setCdRemaining] = useState(0); // ms
  const [cdRunning, setCdRunning] = useState(false);
  const [cdFinished, setCdFinished] = useState(false);
  const cdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const cdEndTime = useRef(0);

  // --- Stopwatch ---
  const [swElapsed, setSwElapsed] = useState(0); // ms
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const swInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const swStartTime = useRef(0);
  const swAccumulated = useRef(0);

  // --- Pomodoro ---
  const [pomWorkMin, setPomWorkMin] = useState(25);
  const [pomBreakMin, setPomBreakMin] = useState(5);
  const [pomPhase, setPomPhase] = useState<"work" | "break">("work");
  const [pomRemaining, setPomRemaining] = useState(0); // ms
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSessions, setPomSessions] = useState(0);
  const [pomStarted, setPomStarted] = useState(false);
  const pomInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pomEndTime = useRef(0);

  // --- Fullscreen ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Text
  const title = isKo
    ? "온라인 타이머 & 스톱워치"
    : "Online Timer & Stopwatch";
  const description = isKo
    ? "카운트다운 타이머, 스톱워치, 뽀모도로 타이머를 무료로 사용하세요. 맞춤 타이머 설정, 랩 기록, 생산성 향상."
    : "Free online timer with countdown, stopwatch, and Pomodoro timer. Set custom timers, track laps, and boost productivity.";

  const tabLabels: Record<Tab, string> = {
    countdown: isKo ? "카운트다운" : "Countdown",
    stopwatch: isKo ? "스톱워치" : "Stopwatch",
    pomodoro: isKo ? "뽀모도로" : "Pomodoro",
  };

  // --- Countdown logic ---
  const cdStart = useCallback(() => {
    if (cdRunning) return;
    let totalMs = cdRemaining;
    if (totalMs <= 0) {
      totalMs = (cdHours * 3600 + cdMinutes * 60 + cdSeconds) * 1000;
      if (totalMs <= 0) return;
    }
    setCdFinished(false);
    cdEndTime.current = Date.now() + totalMs;
    setCdRunning(true);
    cdInterval.current = setInterval(() => {
      const remaining = cdEndTime.current - Date.now();
      if (remaining <= 0) {
        setCdRemaining(0);
        setCdRunning(false);
        setCdFinished(true);
        if (cdInterval.current) clearInterval(cdInterval.current);
        playBeep();
      } else {
        setCdRemaining(remaining);
      }
    }, 50);
  }, [cdRunning, cdRemaining, cdHours, cdMinutes, cdSeconds]);

  const cdPause = useCallback(() => {
    setCdRunning(false);
    if (cdInterval.current) clearInterval(cdInterval.current);
    const remaining = cdEndTime.current - Date.now();
    setCdRemaining(Math.max(0, remaining));
  }, []);

  const cdReset = useCallback(() => {
    setCdRunning(false);
    setCdFinished(false);
    if (cdInterval.current) clearInterval(cdInterval.current);
    setCdRemaining(0);
  }, []);

  // --- Stopwatch logic ---
  const swStart = useCallback(() => {
    if (swRunning) return;
    swStartTime.current = Date.now();
    setSwRunning(true);
    swInterval.current = setInterval(() => {
      setSwElapsed(swAccumulated.current + (Date.now() - swStartTime.current));
    }, 30);
  }, [swRunning]);

  const swPause = useCallback(() => {
    setSwRunning(false);
    if (swInterval.current) clearInterval(swInterval.current);
    swAccumulated.current += Date.now() - swStartTime.current;
    setSwElapsed(swAccumulated.current);
  }, []);

  const swReset = useCallback(() => {
    setSwRunning(false);
    if (swInterval.current) clearInterval(swInterval.current);
    swAccumulated.current = 0;
    setSwElapsed(0);
    setSwLaps([]);
  }, []);

  const swLap = useCallback(() => {
    if (!swRunning) return;
    setSwLaps((prev) => [
      swAccumulated.current + (Date.now() - swStartTime.current),
      ...prev,
    ]);
  }, [swRunning]);

  // --- Pomodoro logic ---
  const pomStartTimer = useCallback(
    (phase: "work" | "break", duration?: number) => {
      const totalMs =
        (duration ?? (phase === "work" ? pomWorkMin : pomBreakMin)) * 60 * 1000;
      pomEndTime.current = Date.now() + totalMs;
      setPomRemaining(totalMs);
      setPomPhase(phase);
      setPomRunning(true);
      setPomStarted(true);

      if (pomInterval.current) clearInterval(pomInterval.current);
      pomInterval.current = setInterval(() => {
        const remaining = pomEndTime.current - Date.now();
        if (remaining <= 0) {
          setPomRemaining(0);
          setPomRunning(false);
          if (pomInterval.current) clearInterval(pomInterval.current);
          playBeep();

          // Auto-switch
          if (phase === "work") {
            setPomSessions((prev) => prev + 1);
            // auto-start break after short delay
            setTimeout(() => {
              const breakMs = pomBreakMin * 60 * 1000;
              pomEndTime.current = Date.now() + breakMs;
              setPomRemaining(breakMs);
              setPomPhase("break");
              setPomRunning(true);
              pomInterval.current = setInterval(() => {
                const rem = pomEndTime.current - Date.now();
                if (rem <= 0) {
                  setPomRemaining(0);
                  setPomRunning(false);
                  if (pomInterval.current) clearInterval(pomInterval.current);
                  playBeep();
                  // auto-start work
                  setTimeout(() => {
                    const workMs = pomWorkMin * 60 * 1000;
                    pomEndTime.current = Date.now() + workMs;
                    setPomRemaining(workMs);
                    setPomPhase("work");
                    setPomRunning(true);
                    pomInterval.current = setInterval(() => {
                      const r = pomEndTime.current - Date.now();
                      if (r <= 0) {
                        setPomRemaining(0);
                        setPomRunning(false);
                        if (pomInterval.current)
                          clearInterval(pomInterval.current);
                        playBeep();
                        setPomSessions((prev) => prev + 1);
                      } else {
                        setPomRemaining(r);
                      }
                    }, 50);
                  }, 500);
                } else {
                  setPomRemaining(rem);
                }
              }, 50);
            }, 500);
          } else {
            // break ended, auto-start work
            setTimeout(() => {
              const workMs = pomWorkMin * 60 * 1000;
              pomEndTime.current = Date.now() + workMs;
              setPomRemaining(workMs);
              setPomPhase("work");
              setPomRunning(true);
              pomInterval.current = setInterval(() => {
                const r = pomEndTime.current - Date.now();
                if (r <= 0) {
                  setPomRemaining(0);
                  setPomRunning(false);
                  if (pomInterval.current) clearInterval(pomInterval.current);
                  playBeep();
                  setPomSessions((prev) => prev + 1);
                } else {
                  setPomRemaining(r);
                }
              }, 50);
            }, 500);
          }
        } else {
          setPomRemaining(remaining);
        }
      }, 50);
    },
    [pomWorkMin, pomBreakMin]
  );

  const pomPause = useCallback(() => {
    setPomRunning(false);
    if (pomInterval.current) clearInterval(pomInterval.current);
    const remaining = pomEndTime.current - Date.now();
    setPomRemaining(Math.max(0, remaining));
  }, []);

  const pomResume = useCallback(() => {
    if (pomRunning || pomRemaining <= 0) return;
    pomEndTime.current = Date.now() + pomRemaining;
    setPomRunning(true);
    pomInterval.current = setInterval(() => {
      const remaining = pomEndTime.current - Date.now();
      if (remaining <= 0) {
        setPomRemaining(0);
        setPomRunning(false);
        if (pomInterval.current) clearInterval(pomInterval.current);
        playBeep();
        if (pomPhase === "work") {
          setPomSessions((prev) => prev + 1);
        }
      } else {
        setPomRemaining(remaining);
      }
    }, 50);
  }, [pomRunning, pomRemaining, pomPhase]);

  const pomReset = useCallback(() => {
    setPomRunning(false);
    setPomStarted(false);
    if (pomInterval.current) clearInterval(pomInterval.current);
    setPomRemaining(0);
    setPomSessions(0);
    setPomPhase("work");
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (cdInterval.current) clearInterval(cdInterval.current);
      if (swInterval.current) clearInterval(swInterval.current);
      if (pomInterval.current) clearInterval(pomInterval.current);
    };
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // FAQ data
  const faqItems = isKo
    ? [
        {
          q: "뽀모도로 기법이란?",
          a: "뽀모도로 기법은 25분 집중 작업 후 5분 휴식을 반복하는 시간 관리 방법입니다. 프란체스코 시릴로가 1980년대에 개발했으며, 짧은 집중 시간과 규칙적인 휴식을 통해 생산성과 집중력을 높이는 데 효과적입니다.",
        },
        {
          q: "전체화면으로 사용 가능한가요?",
          a: "네, 타이머 영역의 전체화면 버튼을 클릭하면 전체화면 모드로 전환됩니다. 발표, 운동, 시험 등에서 큰 화면으로 시간을 확인할 때 유용합니다. ESC 키를 누르면 전체화면이 해제됩니다.",
        },
        {
          q: "모바일에서 알람이 울리나요?",
          a: "대부분의 모바일 브라우저에서 알람 소리가 지원됩니다. 다만 iOS Safari에서는 사용자가 먼저 화면을 터치한 후에야 소리가 재생됩니다. 볼륨이 켜져 있는지 확인하고, 무음 모드가 해제되어 있는지 확인해 주세요.",
        },
        {
          q: "뽀모도로 시간을 변경할 수 있나요?",
          a: "네, 뽀모도로 탭에서 작업 시간과 휴식 시간을 자유롭게 설정할 수 있습니다. 기본값은 25분 작업 / 5분 휴식이지만, 본인의 집중력과 업무 스타일에 맞게 조절하세요.",
        },
      ]
    : [
        {
          q: "What is the Pomodoro technique?",
          a: "The Pomodoro Technique is a time management method that alternates 25-minute focused work sessions with 5-minute breaks. Developed by Francesco Cirillo in the late 1980s, it helps improve productivity and concentration through short, structured intervals and regular rest periods.",
        },
        {
          q: "Can I use this timer in fullscreen?",
          a: "Yes, click the fullscreen button in the timer area to switch to fullscreen mode. This is useful for presentations, workouts, exams, or any situation where you need a large, visible countdown. Press ESC to exit fullscreen.",
        },
        {
          q: "Does the alarm work on mobile?",
          a: "The alarm sound is supported on most mobile browsers. However, on iOS Safari, the user must first interact with the page (tap or click) before audio can play. Make sure your volume is turned up and silent mode is off.",
        },
        {
          q: "Can I customize Pomodoro durations?",
          a: "Yes, you can customize both the work duration and break duration in the Pomodoro tab. The default is 25 minutes of work followed by a 5-minute break, but you can adjust these to suit your focus style and workflow.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "상단 탭에서 카운트다운, 스톱워치, 뽀모도로 중 원하는 모드를 선택하세요.",
        "카운트다운: 시간/분/초를 입력하고 시작 버튼을 누르면 타이머가 시작됩니다. 종료 시 알람이 울립니다.",
        "스톱워치: 시작 버튼을 눌러 시간을 측정하고, 랩 버튼으로 구간 기록을 남기세요.",
        "뽀모도로: 작업 시간과 휴식 시간을 설정한 후 시작하면, 작업-휴식 사이클이 자동으로 반복됩니다.",
        "전체화면 버튼을 눌러 큰 화면으로 타이머를 확인할 수 있습니다.",
      ]
    : [
        "Select your desired mode from the tabs: Countdown, Stopwatch, or Pomodoro.",
        "Countdown: Enter hours, minutes, and seconds, then press Start. An alarm sounds when the timer reaches zero.",
        "Stopwatch: Press Start to begin timing. Use the Lap button to record split times.",
        "Pomodoro: Set your work and break durations, then start. The timer automatically cycles between work and break periods.",
        "Use the fullscreen button to display the timer in a larger view for presentations or workouts.",
      ];

  // Progress for Pomodoro
  const pomTotalMs =
    (pomPhase === "work" ? pomWorkMin : pomBreakMin) * 60 * 1000;
  const pomProgress =
    pomTotalMs > 0 ? ((pomTotalMs - pomRemaining) / pomTotalMs) * 100 : 0;

  // Progress for Countdown
  const cdTotalMs = (cdHours * 3600 + cdMinutes * 60 + cdSeconds) * 1000;
  const cdProgress =
    cdTotalMs > 0 ? ((cdTotalMs - cdRemaining) / cdTotalMs) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div
        ref={containerRef}
        className={`rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5 ${
          isFullscreen
            ? "bg-white dark:bg-neutral-950 flex flex-col items-center justify-center min-h-screen"
            : ""
        }`}
      >
        {/* Tab selector */}
        <div className="flex gap-2 w-full">
          {(["countdown", "stopwatch", "pomodoro"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* ===== COUNTDOWN ===== */}
        {tab === "countdown" && (
          <div className="space-y-5">
            {/* Time inputs */}
            {!cdRunning && !cdFinished && cdRemaining <= 0 && (
              <div className="flex gap-3 items-end justify-center">
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "시" : "Hours"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={cdHours}
                    onChange={(e) =>
                      setCdHours(
                        Math.max(0, Math.min(99, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-20 p-3 text-center text-2xl rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-2xl font-bold pb-3">:</span>
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "분" : "Min"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={cdMinutes}
                    onChange={(e) =>
                      setCdMinutes(
                        Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-20 p-3 text-center text-2xl rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-2xl font-bold pb-3">:</span>
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "초" : "Sec"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={cdSeconds}
                    onChange={(e) =>
                      setCdSeconds(
                        Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-20 p-3 text-center text-2xl rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Quick presets */}
            {!cdRunning && !cdFinished && cdRemaining <= 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {[1, 3, 5, 10, 15, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCdHours(0);
                      setCdMinutes(m);
                      setCdSeconds(0);
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    {m} {isKo ? "분" : "min"}
                  </button>
                ))}
              </div>
            )}

            {/* Countdown display */}
            {(cdRunning || cdRemaining > 0 || cdFinished) && (
              <div className="text-center space-y-3">
                <p
                  className={`text-6xl sm:text-7xl font-mono font-bold tracking-tight ${
                    cdFinished
                      ? "text-red-500 animate-pulse"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {formatMs(cdRemaining)}
                </p>
                {/* Progress bar */}
                {cdTotalMs > 0 && (
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-200"
                      style={{
                        width: `${Math.min(100, cdProgress)}%`,
                      }}
                    />
                  </div>
                )}
                {cdFinished && (
                  <p className="text-lg font-semibold text-red-500">
                    {isKo ? "시간 종료!" : "Time's up!"}
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {!cdRunning && !cdFinished && cdRemaining <= 0 && (
                <button
                  onClick={cdStart}
                  className="px-6 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {isKo ? "시작" : "Start"}
                </button>
              )}
              {cdRunning && (
                <button
                  onClick={cdPause}
                  className="px-6 py-2.5 rounded-md bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                  {isKo ? "일시정지" : "Pause"}
                </button>
              )}
              {!cdRunning && cdRemaining > 0 && !cdFinished && (
                <button
                  onClick={cdStart}
                  className="px-6 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {isKo ? "재개" : "Resume"}
                </button>
              )}
              {(cdRunning || cdRemaining > 0 || cdFinished) && (
                <button
                  onClick={cdReset}
                  className="px-6 py-2.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                >
                  {isKo ? "초기화" : "Reset"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== STOPWATCH ===== */}
        {tab === "stopwatch" && (
          <div className="space-y-5">
            {/* Display */}
            <div className="text-center">
              <p className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {formatMsWithCenti(swElapsed)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {!swRunning && (
                <button
                  onClick={swStart}
                  className="px-6 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {swElapsed > 0
                    ? isKo
                      ? "재개"
                      : "Resume"
                    : isKo
                    ? "시작"
                    : "Start"}
                </button>
              )}
              {swRunning && (
                <>
                  <button
                    onClick={swPause}
                    className="px-6 py-2.5 rounded-md bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors cursor-pointer"
                  >
                    {isKo ? "일시정지" : "Pause"}
                  </button>
                  <button
                    onClick={swLap}
                    className="px-6 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {isKo ? "랩" : "Lap"}
                  </button>
                </>
              )}
              {(swElapsed > 0 || swLaps.length > 0) && (
                <button
                  onClick={swReset}
                  className="px-6 py-2.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                >
                  {isKo ? "초기화" : "Reset"}
                </button>
              )}
            </div>

            {/* Laps */}
            {swLaps.length > 0 && (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                      <th className="p-3 text-left text-neutral-600 dark:text-neutral-400 font-medium">
                        {isKo ? "랩" : "Lap"}
                      </th>
                      <th className="p-3 text-right text-neutral-600 dark:text-neutral-400 font-medium">
                        {isKo ? "구간 시간" : "Split Time"}
                      </th>
                      <th className="p-3 text-right text-neutral-600 dark:text-neutral-400 font-medium">
                        {isKo ? "전체 시간" : "Total Time"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {swLaps.map((lapTime, i) => {
                      const lapNum = swLaps.length - i;
                      const prevLap =
                        i < swLaps.length - 1 ? swLaps[i + 1] : 0;
                      const split = lapTime - prevLap;
                      return (
                        <tr
                          key={i}
                          className={
                            i < swLaps.length - 1
                              ? "border-b border-neutral-200 dark:border-neutral-700"
                              : ""
                          }
                        >
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            #{lapNum}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {formatMsWithCenti(split)}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {formatMsWithCenti(lapTime)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== POMODORO ===== */}
        {tab === "pomodoro" && (
          <div className="space-y-5">
            {/* Settings (only when not started) */}
            {!pomStarted && (
              <div className="flex gap-4 justify-center flex-wrap">
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "작업 (분)" : "Work (min)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={pomWorkMin}
                    onChange={(e) =>
                      setPomWorkMin(
                        Math.max(
                          1,
                          Math.min(120, parseInt(e.target.value) || 25)
                        )
                      )
                    }
                    className="w-20 p-3 text-center text-xl rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {isKo ? "휴식 (분)" : "Break (min)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={pomBreakMin}
                    onChange={(e) =>
                      setPomBreakMin(
                        Math.max(
                          1,
                          Math.min(60, parseInt(e.target.value) || 5)
                        )
                      )
                    }
                    className="w-20 p-3 text-center text-xl rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Phase indicator */}
            {pomStarted && (
              <div className="text-center">
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                    pomPhase === "work"
                      ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                      : "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                  }`}
                >
                  {pomPhase === "work"
                    ? isKo
                      ? "집중 시간"
                      : "Focus Time"
                    : isKo
                    ? "휴식 시간"
                    : "Break Time"}
                </span>
              </div>
            )}

            {/* Timer display */}
            <div className="text-center">
              <p
                className={`text-6xl sm:text-7xl font-mono font-bold tracking-tight ${
                  pomPhase === "work"
                    ? "text-red-500 dark:text-red-400"
                    : "text-green-500 dark:text-green-400"
                }`}
              >
                {pomStarted
                  ? formatMs(pomRemaining)
                  : formatMs(pomWorkMin * 60 * 1000)}
              </p>
            </div>

            {/* Progress bar */}
            {pomStarted && (
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-200 ${
                    pomPhase === "work"
                      ? "bg-red-500 dark:bg-red-400"
                      : "bg-green-500 dark:bg-green-400"
                  }`}
                  style={{
                    width: `${Math.min(100, pomProgress)}%`,
                  }}
                />
              </div>
            )}

            {/* Session counter */}
            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              {isKo ? "완료된 세션" : "Completed Sessions"}:{" "}
              <span className="font-semibold text-foreground">
                {pomSessions}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {!pomStarted && (
                <button
                  onClick={() => pomStartTimer("work")}
                  className="px-6 py-2.5 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  {isKo ? "시작" : "Start"}
                </button>
              )}
              {pomStarted && pomRunning && (
                <button
                  onClick={pomPause}
                  className="px-6 py-2.5 rounded-md bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                  {isKo ? "일시정지" : "Pause"}
                </button>
              )}
              {pomStarted && !pomRunning && pomRemaining > 0 && (
                <button
                  onClick={pomResume}
                  className="px-6 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {isKo ? "재개" : "Resume"}
                </button>
              )}
              {pomStarted && (
                <button
                  onClick={pomReset}
                  className="px-6 py-2.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                >
                  {isKo ? "초기화" : "Reset"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen button */}
        <div className="flex justify-end">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title={isKo ? "전체화면" : "Fullscreen"}
          >
            {isFullscreen
              ? isKo
                ? "전체화면 해제"
                : "Exit Fullscreen"
              : isKo
              ? "전체화면"
              : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToUseSteps.map((step: string, i: number) => (
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
            href={`/${lang}/tools/date-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.dateCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.dateCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="timer"
        labels={dict.share}
      />
      <EmbedCodeButton slug="timer" lang={lang} labels={dict.embed} />

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
