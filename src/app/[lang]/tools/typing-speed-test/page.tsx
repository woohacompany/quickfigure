"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Types ── */
type TestLang = "korean" | "english";
type Duration = 60 | 120 | 180;
type Phase = "idle" | "running" | "finished";
type Grade = "S" | "A" | "B" | "C" | "D";

/* ── Sentence Data ── */
const KOREAN_SENTENCES = [
  "오늘 날씨가 정말 좋아서 공원에 산책을 가기로 했습니다.",
  "커피 한 잔의 여유가 하루를 더 풍요롭게 만들어 줍니다.",
  "프로그래밍을 배우는 것은 새로운 언어를 배우는 것과 비슷합니다.",
  "서울의 지하철은 세계에서 가장 편리한 대중교통 중 하나입니다.",
  "건강한 식습관은 규칙적인 운동과 함께 건강의 기본입니다.",
  "독서는 마음의 양식이며 상상력을 키워주는 좋은 방법입니다.",
  "인공지능 기술의 발전이 우리의 일상생활을 크게 변화시키고 있습니다.",
  "한국의 사계절은 각각 고유한 아름다움을 가지고 있습니다.",
  "시간 관리를 잘하는 것이 성공의 가장 중요한 열쇠입니다.",
  "주말에 가족과 함께 영화를 보는 것은 즐거운 시간입니다.",
  "꾸준한 노력은 반드시 좋은 결과를 가져다 줍니다.",
  "온라인 쇼핑은 편리하지만 직접 보고 사는 것도 중요합니다.",
  "음악을 들으면 스트레스가 해소되고 기분이 좋아집니다.",
  "새해에는 새로운 목표를 세우고 실천하는 것이 중요합니다.",
  "요리를 배우면 건강한 식사를 직접 준비할 수 있습니다.",
  "매일 아침 일찍 일어나는 습관이 하루를 더 길게 만들어줍니다.",
  "외국어를 배우면 다른 문화를 이해하는 폭이 넓어집니다.",
  "좋은 친구는 인생에서 가장 소중한 보물 중 하나입니다.",
  "환경 보호를 위해 일회용품 사용을 줄이는 것이 필요합니다.",
  "기술의 발전으로 재택근무가 점점 보편화되고 있습니다.",
  "여행을 통해 새로운 경험과 추억을 만들 수 있습니다.",
  "규칙적인 수면은 건강과 집중력에 큰 영향을 미칩니다.",
  "도서관은 조용히 공부하기에 가장 좋은 장소입니다.",
  "봄이 오면 벚꽃이 피어 거리가 아름답게 변합니다.",
  "자전거를 타면 운동도 되고 환경도 보호할 수 있습니다.",
  "맛있는 음식을 먹으면 행복감이 높아진다는 연구 결과가 있습니다.",
  "스마트폰 없이 하루를 보내는 것은 생각보다 어렵습니다.",
  "취미 활동은 일상에 활력을 불어넣어 주는 중요한 요소입니다.",
  "대한민국은 빠른 인터넷 속도로 세계적으로 유명합니다.",
  "정리정돈을 잘하면 생활이 더 효율적이고 쾌적해집니다.",
  "가을의 단풍은 한국에서 가장 아름다운 자연 풍경 중 하나입니다.",
  "매일 조금씩 운동하면 건강을 오래 유지할 수 있습니다.",
  "좋은 습관을 만드는 데는 최소 삼십 일이 필요하다고 합니다.",
  "주말에는 충분한 휴식을 취해야 다음 주를 활기차게 시작할 수 있습니다.",
  "한국 음식은 건강에 좋은 재료를 많이 사용하는 것으로 알려져 있습니다.",
  "글을 잘 쓰려면 많이 읽고 많이 쓰는 연습이 필요합니다.",
  "지구 온난화는 전 세계적으로 심각한 환경 문제입니다.",
  "사진을 찍는 것은 소중한 순간을 기록하는 좋은 방법입니다.",
  "대중교통을 이용하면 교통 체증도 줄이고 환경도 보호할 수 있습니다.",
  "겨울에는 따뜻한 차 한 잔이 몸과 마음을 녹여줍니다.",
  "긍정적인 생각은 어려운 상황을 극복하는 데 큰 도움이 됩니다.",
  "컴퓨터 과학은 현대 사회에서 가장 중요한 학문 중 하나입니다.",
  "매일 감사하는 마음을 가지면 더 행복한 삶을 살 수 있습니다.",
  "한국의 전통 문화는 세계적으로 많은 관심을 받고 있습니다.",
  "팀워크는 혼자서는 할 수 없는 일을 가능하게 만들어줍니다.",
  "아침에 물 한 잔을 마시면 신진대사가 활발해집니다.",
  "새로운 도전을 두려워하지 않는 것이 성장의 시작입니다.",
  "공부할 때 집중력을 높이려면 조용한 환경이 중요합니다.",
  "한국어는 세계에서 가장 과학적인 문자 체계를 가지고 있습니다.",
  "작은 친절이 세상을 더 따뜻하게 만들 수 있습니다.",
];

const ENGLISH_SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the river bank.",
  "Programming is the art of telling a computer what to do step by step.",
  "A good morning routine can set the tone for a productive day ahead.",
  "Reading books regularly expands your vocabulary and improves writing skills.",
  "The internet has transformed how we communicate and access information daily.",
  "Exercise is important for both physical health and mental well-being.",
  "Learning a new language opens doors to different cultures and perspectives.",
  "Time management is one of the most valuable skills you can develop.",
  "Coffee shops have become popular places for remote work and studying.",
  "The beauty of nature can be found in the simplest things around us.",
  "Technology continues to evolve at an unprecedented pace every single year.",
  "Cooking at home is healthier and more economical than eating out every day.",
  "Music has the power to change our mood and bring people together.",
  "Setting clear goals is the first step toward achieving your dreams.",
  "Traveling helps you gain new perspectives and create lasting memories.",
  "A balanced diet combined with regular exercise leads to a healthier life.",
  "The sunrise paints the sky with beautiful shades of orange and pink.",
  "Good communication skills are essential for success in any career path.",
  "Practice makes perfect when it comes to developing any new skill.",
  "The ocean covers more than seventy percent of the earth surface area.",
  "Artificial intelligence is reshaping industries and creating new job opportunities.",
  "Writing in a journal every day can help you organize your thoughts clearly.",
  "Public transportation reduces traffic congestion and helps protect the environment.",
  "A smile can brighten someone day and create a positive atmosphere around you.",
  "Mountains offer breathtaking views and challenging trails for outdoor enthusiasts.",
  "Teamwork makes it possible to accomplish things no individual could do alone.",
  "The library is one of the best places to study and focus quietly.",
  "Healthy sleep habits are crucial for maintaining energy and concentration levels.",
  "Photography allows us to capture and preserve our most precious moments forever.",
  "Kindness costs nothing but means everything to the person who receives it.",
  "The development of smartphones has changed the way we live and work.",
  "Spring brings warm weather and beautiful flowers that bloom across the land.",
  "Critical thinking is a skill that helps you make better decisions every day.",
  "Water is essential for life and we should all try to conserve it.",
  "Learning to code can open up many career opportunities in the modern world.",
  "Autumn leaves create a colorful display that attracts visitors from around the world.",
  "A positive attitude can help you overcome challenges and achieve your goals.",
  "The history of our world is full of fascinating stories and discoveries.",
  "Volunteering is a great way to give back to your community and help others.",
  "Innovation drives progress and helps solve some of the biggest challenges we face.",
  "Breakfast is often called the most important meal of the day for good reason.",
  "Digital literacy is becoming increasingly important in our technology driven society.",
  "The stars in the night sky have inspired artists and scientists for centuries.",
  "Regular stretching can improve flexibility and reduce the risk of injury.",
  "Patience is a virtue that can lead to better outcomes in many situations.",
  "The power of habit shapes our daily lives more than we often realize.",
  "Sustainable living practices help protect our planet for future generations.",
  "Education is the most powerful weapon which you can use to change the world.",
  "Creative problem solving requires thinking outside the box and exploring new ideas.",
  "The simple act of listening can strengthen relationships and build trust over time.",
];

/* ── Grade Calculation ── */
function getGrade(wpm: number, testLang: TestLang): Grade {
  if (testLang === "korean") {
    if (wpm >= 500) return "S";
    if (wpm >= 400) return "A";
    if (wpm >= 300) return "B";
    if (wpm >= 200) return "C";
    return "D";
  }
  if (wpm >= 80) return "S";
  if (wpm >= 60) return "A";
  if (wpm >= 40) return "B";
  if (wpm >= 25) return "C";
  return "D";
}

function getGradeColor(grade: Grade): string {
  switch (grade) {
    case "S": return "text-yellow-500";
    case "A": return "text-green-500";
    case "B": return "text-blue-500";
    case "C": return "text-orange-500";
    case "D": return "text-red-500";
  }
}

function getGradeLabel(grade: Grade, isKo: boolean): string {
  const labels: Record<Grade, { en: string; ko: string }> = {
    S: { en: "Outstanding!", ko: "최고 수준!" },
    A: { en: "Excellent!", ko: "우수!" },
    B: { en: "Good", ko: "보통" },
    C: { en: "Average", ko: "연습 필요" },
    D: { en: "Keep Practicing", ko: "더 연습하세요" },
  };
  return isKo ? labels[grade].ko : labels[grade].en;
}

/* ── Shuffle ── */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateText(testLang: TestLang): string {
  const sentences = testLang === "korean" ? KOREAN_SENTENCES : ENGLISH_SENTENCES;
  return shuffleArray(sentences).slice(0, 15).join(" ");
}

/* ── Component ── */
export default function TypingSpeedTestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("typing-speed-test");
  const isKo = locale === "ko";

  const [testLang, setTestLang] = useState<TestLang>(isKo ? "korean" : "english");
  const [duration, setDuration] = useState<Duration>(60);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sampleText, setSampleText] = useState(() => generateText(isKo ? "korean" : "english"));
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [errors, setErrors] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Results
  const [resultWpm, setResultWpm] = useState(0);
  const [resultCpm, setResultCpm] = useState(0);
  const [resultAccuracy, setResultAccuracy] = useState(0);
  const [resultErrors, setResultErrors] = useState(0);
  const [resultGrade, setResultGrade] = useState<Grade>("D");

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase("idle");
    setTyped("");
    setTimeLeft(duration);
    setErrors(0);
    setSampleText(generateText(testLang));
  }, [duration, testLang]);

  useEffect(() => {
    reset();
  }, [testLang, duration, reset]);

  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60; // minutes
    const typedChars = typed.length;
    let correctChars = 0;
    let errorCount = 0;
    for (let i = 0; i < typedChars; i++) {
      if (typed[i] === sampleText[i]) {
        correctChars++;
      } else {
        errorCount++;
      }
    }
    const cpm = Math.round(correctChars / elapsed);
    const wpm = testLang === "korean"
      ? cpm // Korean: CPM is the standard metric
      : Math.round((correctChars / 5) / elapsed); // English: WPM = chars/5/min
    const accuracy = typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;
    const grade = getGrade(testLang === "korean" ? cpm : wpm, testLang);

    setResultWpm(testLang === "korean" ? cpm : wpm);
    setResultCpm(cpm);
    setResultAccuracy(accuracy);
    setResultErrors(errorCount);
    setResultGrade(grade);
    setPhase("finished");
  }, [typed, sampleText, testLang]);

  const startTest = useCallback(() => {
    setPhase("running");
    setTyped("");
    setErrors(0);
    setTimeLeft(duration);
    startTimeRef.current = Date.now();
    inputRef.current?.focus();
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, finishTest]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (phase !== "running") return;
    const value = e.target.value;
    // Don't allow typing beyond the sample text length
    if (value.length > sampleText.length) return;
    setTyped(value);

    // Count errors in real time
    let errCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== sampleText[i]) errCount++;
    }
    setErrors(errCount);

    // If typed all characters, finish
    if (value.length === sampleText.length) {
      finishTest();
    }
  }, [phase, sampleText, finishTest]);

  // Render the sample text with highlights
  const renderedText = useMemo(() => {
    const chars: { char: string; status: "pending" | "correct" | "wrong" | "current" }[] = [];
    for (let i = 0; i < sampleText.length; i++) {
      if (i < typed.length) {
        chars.push({
          char: sampleText[i],
          status: typed[i] === sampleText[i] ? "correct" : "wrong",
        });
      } else if (i === typed.length) {
        chars.push({ char: sampleText[i], status: "current" });
      } else {
        chars.push({ char: sampleText[i], status: "pending" });
      }
    }
    return chars;
  }, [sampleText, typed]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Real-time stats
  const liveStats = useMemo(() => {
    if (phase !== "running" || typed.length === 0) return { wpm: 0, cpm: 0, accuracy: 100 };
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    if (elapsed < 0.01) return { wpm: 0, cpm: 0, accuracy: 100 };
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === sampleText[i]) correct++;
    }
    const cpm = Math.round(correct / elapsed);
    const wpm = testLang === "korean" ? cpm : Math.round((correct / 5) / elapsed);
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    return { wpm, cpm, accuracy };
  }, [phase, typed, sampleText, testLang]);

  // Copy result
  const copyResult = () => {
    const text = isKo
      ? `타자 속도 테스트 결과\n${testLang === "korean" ? "타수" : "WPM"}: ${resultWpm}\n정확도: ${resultAccuracy}%\n등급: ${resultGrade}\nhttps://quickfigure.net/ko/tools/typing-speed-test`
      : `Typing Speed Test Result\n${testLang === "korean" ? "CPM" : "WPM"}: ${resultWpm}\nAccuracy: ${resultAccuracy}%\nGrade: ${resultGrade}\nhttps://quickfigure.net/en/tools/typing-speed-test`;
    navigator.clipboard.writeText(text);
  };

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "타자 속도 측정" : "Typing Speed Test",
    description: isKo
      ? "한국어/영어 타자 속도를 측정하세요. WPM, 정확도, 등급까지 확인."
      : "Test your typing speed. Measure WPM, accuracy, and get your grade.",
    url: `https://quickfigure.net/${lang}/tools/typing-speed-test`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        { q: "평균 타자 속도는 얼마인가요?", a: "한국어 기준 일반인 평균은 약 200~300타(CPM)입니다. 사무직 근로자는 300~400타, 전문 타이피스트는 500타 이상입니다." },
        { q: "WPM과 CPM의 차이는 무엇인가요?", a: "WPM(Words Per Minute)은 분당 단어 수로 주로 영문에 사용됩니다. CPM(Characters Per Minute)은 분당 타수로 한국어에 주로 사용됩니다. 영문 WPM은 보통 CPM/5로 계산합니다." },
        { q: "타자 속도를 빠르게 하려면 어떻게 해야 하나요?", a: "올바른 손 자세를 유지하고, 키보드를 보지 않는 터치 타이핑을 연습하세요. 매일 10~15분씩 꾸준히 연습하면 한 달 내에 눈에 띄는 향상을 볼 수 있습니다." },
        { q: "한글 타자에서 등급 기준은 어떻게 되나요?", a: "S등급: 500타 이상, A등급: 400~499타, B등급: 300~399타, C등급: 200~299타, D등급: 200타 미만입니다." },
        { q: "영문 타자에서 등급 기준은 어떻게 되나요?", a: "S등급: 80 WPM 이상, A등급: 60~79 WPM, B등급: 40~59 WPM, C등급: 25~39 WPM, D등급: 25 WPM 미만입니다." },
      ]
    : [
        { q: "What is the average typing speed?", a: "The average typing speed is about 40 WPM for most people. Office workers typically type 50-70 WPM, while professional typists can exceed 80 WPM." },
        { q: "What is the difference between WPM and CPM?", a: "WPM (Words Per Minute) measures typing speed in words, commonly used for English. CPM (Characters Per Minute) counts individual keystrokes, commonly used for Korean. English WPM is typically calculated as CPM divided by 5." },
        { q: "How can I improve my typing speed?", a: "Practice touch typing (typing without looking at the keyboard), maintain proper hand posture, and practice consistently for 10-15 minutes daily. You should see noticeable improvement within a month." },
        { q: "What do the grades mean?", a: "S: 80+ WPM (Outstanding), A: 60-79 WPM (Excellent), B: 40-59 WPM (Good), C: 25-39 WPM (Average), D: Below 25 WPM (Keep Practicing)." },
        { q: "Is this test accurate?", a: "Yes, our test measures your real-time input and calculates WPM/CPM based on correctly typed characters. The accuracy metric shows the percentage of characters typed correctly." },
      ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "타자 속도 측정 - 내 타자 실력은?" : "Typing Speed Test - How Fast Can You Type?"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "한국어/영어 타자 속도를 측정하세요. WPM, 정확도, 등급까지 확인. 100% 무료."
            : "Test your typing speed in English or Korean. Measure WPM, accuracy, and get your grade."}
        </p>
      </header>

      {/* Settings */}
      {phase !== "finished" && (
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              {isKo ? "언어" : "Language"}
            </label>
            <div className="flex gap-2">
              {([
                { value: "korean" as TestLang, label: isKo ? "한국어" : "Korean" },
                { value: "english" as TestLang, label: isKo ? "영어" : "English" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTestLang(opt.value); }}
                  disabled={phase === "running"}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    testLang === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  } ${phase === "running" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              {isKo ? "시간" : "Duration"}
            </label>
            <div className="flex gap-2">
              {([60, 120, 180] as Duration[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  disabled={phase === "running"}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    duration === d
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  } ${phase === "running" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {d / 60}{isKo ? "분" : "min"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer & Live Stats */}
      {phase === "running" && (
        <div className="mb-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{formatTime(timeLeft)}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isKo ? "남은 시간" : "Time Left"}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{liveStats.wpm}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {testLang === "korean" ? (isKo ? "타수(CPM)" : "CPM") : "WPM"}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{liveStats.accuracy}%</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isKo ? "정확도" : "Accuracy"}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-red-500">{errors}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isKo ? "오타" : "Errors"}
            </p>
          </div>
        </div>
      )}

      {/* Sample Text Display */}
      {phase !== "finished" && (
        <div className="mb-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 max-h-48 overflow-y-auto leading-relaxed font-mono text-base">
          {renderedText.map((c, i) => (
            <span
              key={i}
              className={
                c.status === "correct"
                  ? "text-green-600 dark:text-green-400"
                  : c.status === "wrong"
                  ? "text-white bg-red-500 rounded-sm"
                  : c.status === "current"
                  ? "border-b-2 border-blue-500 text-foreground"
                  : "text-neutral-400 dark:text-neutral-500"
              }
            >
              {c.char}
            </span>
          ))}
        </div>
      )}

      {/* Input Area */}
      {phase !== "finished" && (
        <div className="mb-6">
          {phase === "idle" ? (
            <button
              onClick={startTest}
              className="w-full py-4 rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isKo ? "테스트 시작" : "Start Test"}
            </button>
          ) : (
            <>
              <textarea
                ref={inputRef}
                value={typed}
                onChange={handleInput}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full h-32 p-4 rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-neutral-900 text-foreground font-mono text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={isKo ? "위의 문장을 여기에 입력하세요..." : "Start typing the text above here..."}
              />
              <button
                onClick={reset}
                className="mt-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {isKo ? "다시 시작" : "Reset"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {phase === "finished" && (
        <div className="mb-8 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="text-center mb-6">
            <p className={`text-6xl font-bold ${getGradeColor(resultGrade)}`}>
              {resultGrade}
            </p>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 mt-2">
              {getGradeLabel(resultGrade, isKo)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-2xl font-bold">{resultWpm}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {testLang === "korean" ? (isKo ? "타수(CPM)" : "CPM") : "WPM"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-2xl font-bold">{resultCpm}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">CPM</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-2xl font-bold">{resultAccuracy}%</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {isKo ? "정확도" : "Accuracy"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-2xl font-bold text-red-500">{resultErrors}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {isKo ? "오타 수" : "Errors"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isKo ? "다시 테스트" : "Try Again"}
            </button>
            <button
              onClick={copyResult}
              className="flex-1 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {isKo ? "결과 복사" : "Copy Result"}
            </button>
          </div>
        </div>
      )}

      <ShareButtons
        title={isKo ? "타자 속도 측정" : "Typing Speed Test"}
        description={isKo ? "한국어/영어 타자 속도를 측정하세요." : "Test your typing speed online."}
        lang={lang}
        slug="typing-speed-test"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="typing-speed-test"
        lang={lang}
        labels={dict.embed}
      />

      {/* How to Use */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="space-y-3 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "테스트 언어(한국어/영어)와 시간(1분/2분/3분)을 선택하세요.",
                "\"테스트 시작\" 버튼을 클릭하세요.",
                "화면에 표시된 문장을 보면서 입력창에 정확하게 타이핑하세요.",
                "실시간으로 타수, 정확도, 오타 수가 표시됩니다.",
                "시간이 끝나면 최종 결과와 등급(S/A/B/C/D)을 확인하세요.",
              ]
            : [
                "Choose your test language (English/Korean) and duration (1/2/3 minutes).",
                "Click the \"Start Test\" button.",
                "Type the displayed text as accurately and quickly as you can.",
                "Your WPM, accuracy, and error count are shown in real-time.",
                "When time runs out, view your final results and grade (S/A/B/C/D).",
              ]
          ).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
            >
              <h3 className="font-medium mb-2">{item.q}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Articles */}
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
