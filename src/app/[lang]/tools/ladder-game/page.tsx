"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── 색상 팔레트 (참가자별) ── */
const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
  "#14B8A6", "#6366F1", "#E11D48", "#84CC16",
];

/* ── 타입 ── */
interface Rung { row: number; col: number; }
type Phase = "setup" | "ready" | "animating" | "done";
type Speed = "fast" | "normal" | "slow";

/* ── 프리셋 ── */
interface Preset {
  id: string;
  icon: string;
  label: { en: string; ko: string };
  participants: { en: string[]; ko: string[] };
  results: { en: string[]; ko: string[] };
}

const PRESETS: Preset[] = [
  {
    id: "winner",
    icon: "🎯",
    label: { en: "Winner/Loser", ko: "당첨/꽝" },
    participants: { en: ["Player 1", "Player 2", "Player 3", "Player 4"], ko: ["참가자1", "참가자2", "참가자3", "참가자4"] },
    results: { en: ["Winner!", "Nope", "Nope", "Nope"], ko: ["당첨!", "꽝", "꽝", "꽝"] },
  },
  {
    id: "order",
    icon: "🔢",
    label: { en: "Pick Order", ko: "순서 정하기" },
    participants: { en: ["Player 1", "Player 2", "Player 3", "Player 4"], ko: ["참가자1", "참가자2", "참가자3", "참가자4"] },
    results: { en: ["1st", "2nd", "3rd", "4th"], ko: ["1번", "2번", "3번", "4번"] },
  },
  {
    id: "penalty",
    icon: "🍺",
    label: { en: "Penalties", ko: "회식 벌칙" },
    participants: { en: ["Player 1", "Player 2", "Player 3", "Player 4"], ko: ["참가자1", "참가자2", "참가자3", "참가자4"] },
    results: { en: ["Sing a song", "Dance", "Buy coffee", "Do dishes"], ko: ["노래 부르기", "춤추기", "커피 쏘기", "설거지"] },
  },
  {
    id: "team",
    icon: "👥",
    label: { en: "Team Split", ko: "팀 배정" },
    participants: { en: ["Player 1", "Player 2", "Player 3", "Player 4"], ko: ["참가자1", "참가자2", "참가자3", "참가자4"] },
    results: { en: ["Team A", "Team A", "Team B", "Team B"], ko: ["A팀", "A팀", "B팀", "B팀"] },
  },
  {
    id: "lunch",
    icon: "🍜",
    label: { en: "Lunch Menu", ko: "점심 메뉴" },
    participants: { en: ["Player 1", "Player 2", "Player 3", "Player 4"], ko: ["참가자1", "참가자2", "참가자3", "참가자4"] },
    results: { en: ["Pizza", "Sushi", "Burgers", "Salad"], ko: ["치킨", "피자", "국밥", "떡볶이"] },
  },
  {
    id: "gift",
    icon: "🎁",
    label: { en: "Gift Exchange", ko: "선물 교환" },
    participants: { en: ["Player 1", "Player 2", "Player 3", "Player 4"], ko: ["참가자1", "참가자2", "참가자3", "참가자4"] },
    results: { en: ["Gift A", "Gift B", "Gift C", "Gift D"], ko: ["선물A", "선물B", "선물C", "선물D"] },
  },
];

/* ── 사다리 생성 알고리즘 ── */
function generateRungs(numCols: number, numRows: number): Rung[] {
  const rungs: Rung[] = [];
  // 각 행에서 가로선을 랜덤 배치 (인접 겹침 방지)
  for (let row = 0; row < numRows; row++) {
    const used = new Set<number>();
    for (let col = 0; col < numCols - 1; col++) {
      if (used.has(col) || used.has(col - 1)) continue;
      if (Math.random() < 0.4) {
        rungs.push({ row, col });
        used.add(col);
      }
    }
  }
  return rungs;
}

/* ── 경로 추적 ── */
function tracePath(
  startCol: number,
  rungs: Rung[],
  numRows: number
): { col: number; row: number }[] {
  const path: { col: number; row: number }[] = [{ col: startCol, row: -1 }];
  let col = startCol;

  for (let row = 0; row < numRows; row++) {
    // 오른쪽으로 가는 가로선 있는지
    const right = rungs.find((r) => r.row === row && r.col === col);
    // 왼쪽에서 오는 가로선 있는지
    const left = rungs.find((r) => r.row === row && r.col === col - 1);

    if (right) {
      path.push({ col, row });
      col++;
      path.push({ col, row });
    } else if (left) {
      path.push({ col, row });
      col--;
      path.push({ col, row });
    } else {
      path.push({ col, row });
    }
  }
  path.push({ col, row: numRows });
  return path;
}

/* ── 메인 컴포넌트 ── */
export default function LadderGamePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("ladder-game");
  const isKo = locale === "ko";

  const title = isKo
    ? "사다리 타기 - 재미있는 온라인 사다리 게임"
    : "Ladder Game - Fun Online Random Picker";
  const description = isKo
    ? "온라인 사다리 타기로 순서, 당번, 벌칙을 정하세요. 애니메이션으로 결과 공개! 회식, 팀배정, 선물교환 등 다양하게 활용. 100% 무료."
    : "Use the ladder game to decide order, teams, or penalties. Animated results reveal! Perfect for parties, team building, gift exchange. 100% free.";

  /* ── state ── */
  const [numPlayers, setNumPlayers] = useState(4);
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: 4 }, (_, i) => (isKo ? `참가자${i + 1}` : `Player ${i + 1}`))
  );
  const [results, setResults] = useState<string[]>(() =>
    isKo ? ["당첨!", "꽝", "꽝", "꽝"] : ["Winner!", "Nope", "Nope", "Nope"]
  );
  const [phase, setPhase] = useState<Phase>("setup");
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [showRungs, setShowRungs] = useState(false);
  const [animatedPaths, setAnimatedPaths] = useState<Map<number, { col: number; row: number }[]>>(new Map());
  const [revealedResults, setRevealedResults] = useState<Map<number, number>>(new Map());
  const [soloMode, setSoloMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const NUM_ROWS = 12;

  /* ── 참가자 수 변경 ── */
  const updatePlayerCount = useCallback(
    (n: number) => {
      if (n < 2 || n > 12) return;
      setNumPlayers(n);
      setNames((prev) => {
        const arr = [...prev];
        while (arr.length < n) arr.push(isKo ? `참가자${arr.length + 1}` : `Player ${arr.length + 1}`);
        return arr.slice(0, n);
      });
      setResults((prev) => {
        const arr = [...prev];
        while (arr.length < n) arr.push(isKo ? "꽝" : "Nope");
        return arr.slice(0, n);
      });
      setPhase("setup");
    },
    [isKo]
  );

  /* ── 프리셋 적용 ── */
  function applyPreset(preset: Preset) {
    const p = preset.participants[locale];
    const r = preset.results[locale];
    setNumPlayers(p.length);
    setNames([...p]);
    setResults([...r]);
    setPhase("setup");
  }

  /* ── 사다리 만들기 ── */
  function buildLadder() {
    const newRungs = generateRungs(numPlayers, NUM_ROWS);
    setRungs(newRungs);
    setShowRungs(false);
    setAnimatedPaths(new Map());
    setRevealedResults(new Map());
    setShowConfetti(false);
    setPhase("ready");
  }

  /* ── Canvas 그리기 ── */
  const drawLadder = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      currentRungs: Rung[],
      showR: boolean,
      paths: Map<number, { col: number; row: number }[]>,
      revealed: Map<number, number>,
      n: number
    ) => {
      ctx.clearRect(0, 0, width, height);
      const padX = 40;
      const padTop = 50;
      const padBottom = 50;
      const colW = (width - padX * 2) / (n - 1 || 1);
      const rowH = (height - padTop - padBottom) / (NUM_ROWS + 1);

      const colX = (c: number) => padX + c * colW;
      const rowY = (r: number) => padTop + (r + 1) * rowH;

      // 세로선
      for (let c = 0; c < n; c++) {
        ctx.beginPath();
        ctx.strokeStyle = "#D4D4D4";
        ctx.lineWidth = 2;
        ctx.moveTo(colX(c), padTop);
        ctx.lineTo(colX(c), height - padBottom);
        ctx.stroke();
      }

      // 가로선 (rungs)
      if (showR) {
        for (const rung of currentRungs) {
          ctx.beginPath();
          ctx.strokeStyle = "#A3A3A3";
          ctx.lineWidth = 2;
          ctx.moveTo(colX(rung.col), rowY(rung.row));
          ctx.lineTo(colX(rung.col + 1), rowY(rung.row));
          ctx.stroke();
        }
      }

      // 애니메이션 경로
      paths.forEach((path, playerIdx) => {
        const color = COLORS[playerIdx % COLORS.length];
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i < path.length; i++) {
          const p = path[i];
          const x = colX(p.col);
          const y = p.row === -1 ? padTop : p.row === NUM_ROWS ? height - padBottom : rowY(p.row);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 현재 위치 표시 (마지막 점)
        if (path.length > 0) {
          const last = path[path.length - 1];
          const lx = colX(last.col);
          const ly = last.row === -1 ? padTop : last.row === NUM_ROWS ? height - padBottom : rowY(last.row);
          ctx.beginPath();
          ctx.arc(lx, ly, 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });

      // 참가자 이름 (상단)
      ctx.textAlign = "center";
      ctx.font = "bold 13px sans-serif";
      for (let c = 0; c < n; c++) {
        const color = COLORS[c % COLORS.length];
        ctx.fillStyle = color;
        ctx.fillText(names[c] || `P${c + 1}`, colX(c), padTop - 12);
      }

      // 결과 (하단)
      for (let c = 0; c < n; c++) {
        const revealedPlayer = [...revealed.entries()].find(([, destCol]) => destCol === c);
        if (revealedPlayer !== undefined) {
          const [pIdx] = revealedPlayer;
          ctx.fillStyle = COLORS[pIdx % COLORS.length];
          ctx.font = "bold 13px sans-serif";
        } else {
          ctx.fillStyle = "#737373";
          ctx.font = "13px sans-serif";
        }
        ctx.fillText(results[c] || "?", colX(c), height - padBottom + 25);
      }
    },
    [names, results, NUM_ROWS]
  );

  /* ── 렌더링 ── */
  useEffect(() => {
    if (phase === "setup") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive sizing
    const container = canvas.parentElement;
    if (container) {
      const w = container.clientWidth;
      const h = Math.max(450, Math.min(600, w * 0.8));
      canvas.width = w * 2; // retina
      canvas.height = h * 2;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(2, 2);
      drawLadder(ctx, w, h, rungs, showRungs, animatedPaths, revealedResults, numPlayers);
    }
  }, [phase, rungs, showRungs, animatedPaths, revealedResults, numPlayers, drawLadder]);

  /* ── 애니메이션 ── */
  const getSpeedMs = () => ({ fast: 500, normal: 1500, slow: 3000 }[speed]);

  function animatePlayer(playerIdx: number): Promise<number> {
    return new Promise((resolve) => {
      const fullPath = tracePath(playerIdx, rungs, NUM_ROWS);
      const totalMs = getSpeedMs();
      const stepMs = totalMs / fullPath.length;
      let step = 0;

      function tick() {
        step++;
        const partial = fullPath.slice(0, step + 1);
        setAnimatedPaths((prev) => new Map(prev).set(playerIdx, partial));

        // 가로선도 서서히 보여주기
        if (!showRungs) setShowRungs(true);

        if (step < fullPath.length - 1) {
          animRef.current = window.setTimeout(tick, stepMs) as unknown as number;
        } else {
          const destCol = fullPath[fullPath.length - 1].col;
          setRevealedResults((prev) => new Map(prev).set(playerIdx, destCol));
          resolve(destCol);
        }
      }
      tick();
    });
  }

  async function revealAll() {
    setPhase("animating");
    setShowRungs(true);
    setAnimatedPaths(new Map());
    setRevealedResults(new Map());

    for (let i = 0; i < numPlayers; i++) {
      await animatePlayer(i);
      await new Promise((r) => setTimeout(r, 200));
    }

    setPhase("done");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }

  async function revealOne(idx: number) {
    if (revealedResults.has(idx)) return;
    setPhase("animating");
    if (!showRungs) setShowRungs(true);
    await animatePlayer(idx);

    // 모두 공개됐는지 확인
    const newRevealed = new Map(revealedResults).set(idx, 0); // 임시
    if (newRevealed.size === numPlayers) {
      setPhase("done");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setPhase("ready");
    }
  }

  /* ── 리셋 ── */
  function reshuffle() {
    if (animRef.current) clearTimeout(animRef.current);
    buildLadder();
  }

  function resetAll() {
    if (animRef.current) clearTimeout(animRef.current);
    setPhase("setup");
    setRungs([]);
    setShowRungs(false);
    setAnimatedPaths(new Map());
    setRevealedResults(new Map());
    setShowConfetti(false);
  }

  /* ── 결과 복사 ── */
  function copyResults() {
    const lines: string[] = [];
    revealedResults.forEach((destCol, pIdx) => {
      lines.push(`${names[pIdx]} → ${results[destCol]}`);
    });
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  /* ── 카카오 공유 ── */
  function shareKakao() {
    const w = window as unknown as { Kakao?: { isInitialized: () => boolean; Share: { sendDefault: (p: unknown) => void } } };
    if (!w.Kakao || !w.Kakao.isInitialized()) return;
    const lines: string[] = [];
    revealedResults.forEach((destCol, pIdx) => {
      lines.push(`${names[pIdx]} → ${results[destCol]}`);
    });
    w.Kakao.Share.sendDefault({
      objectType: "text",
      text: `🪜 ${isKo ? "사다리 타기 결과" : "Ladder Game Result"}\n${lines.join("\n")}`,
      link: {
        mobileWebUrl: `https://www.quickfigure.net/${lang}/tools/ladder-game`,
        webUrl: `https://www.quickfigure.net/${lang}/tools/ladder-game`,
      },
    });
  }

  /* ── UI classes ── */
  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const btnPrimary =
    "px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer";
  const btnSecondary =
    "px-5 py-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer";

  /* ── FAQ ── */
  const faqItems = isKo
    ? [
        { q: "사다리 타기는 어떻게 작동하나요?", a: "참가자 수만큼 세로선이 생성되고, 그 사이에 랜덤으로 가로선(다리)이 배치됩니다. 위에서 아래로 내려가면서 가로선을 만나면 옆으로 이동하여 최종 결과에 도달합니다. 가로선은 완전 랜덤으로 생성되어 공정한 결과를 보장합니다." },
        { q: "최대 몇 명까지 참여할 수 있나요?", a: "2명부터 12명까지 참여할 수 있습니다. 참가자 이름과 결과를 자유롭게 수정할 수 있어 다양한 상황에 활용 가능합니다." },
        { q: "한 명씩 결과를 공개할 수 있나요?", a: "네! '한 명씩 타기' 모드를 활성화하면 참가자 이름을 클릭하여 한 명씩 결과를 공개할 수 있습니다. 회식이나 모임에서 긴장감을 연출하기 좋습니다." },
        { q: "결과를 공유할 수 있나요?", a: "네, 결과가 공개된 후 '결과 복사' 버튼으로 텍스트를 복사하거나, 카카오톡/페이스북/트위터로 직접 공유할 수 있습니다." },
      ]
    : [
        { q: "How does the ladder game work?", a: "Vertical lines are created for each participant, and random horizontal rungs are placed between them. Starting from the top, you move down and switch direction whenever you hit a horizontal rung, landing on a final result at the bottom. The rungs are randomly generated to ensure fair results." },
        { q: "How many players can participate?", a: "You can have 2 to 12 players. You can freely edit participant names and results to suit any occasion." },
        { q: "Can I reveal results one by one?", a: "Yes! Enable 'One by One' mode and click on a participant's name to reveal just their result. Great for building suspense at parties or team events." },
        { q: "Can I share the results?", a: "Yes, after results are revealed, use the 'Copy Results' button to copy text, or share directly via Kakao, Facebook, or Twitter." },
      ];

  const howToSteps = isKo
    ? [
        "참가자 수를 설정하고 이름을 입력하세요 (2~12명).",
        "결과 아이템을 입력하세요. 프리셋 버튼으로 빠르게 설정할 수도 있습니다.",
        "'사다리 만들기' 버튼을 클릭하면 랜덤 사다리가 생성됩니다.",
        "'결과 보기'를 클릭하면 애니메이션과 함께 결과가 공개됩니다.",
        "'한 명씩 타기' 모드로 한 명씩 결과를 공개할 수도 있습니다.",
      ]
    : [
        "Set the number of participants and enter names (2-12 players).",
        "Enter result items. Use preset buttons for quick setup.",
        "Click 'Build Ladder' to generate a random ladder.",
        "Click 'Reveal All' to see animated results for everyone.",
        "Use 'One by One' mode to reveal individual results for more suspense.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ── Header ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="ladder-game" locale={locale} />
      </header>

      {/* ── Preset Buttons ── */}
      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">
          {isKo ? "활용 예시" : "Quick Presets"}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              {preset.icon} {preset.label[locale]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Setup Panel ── */}
      {phase === "setup" && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          {/* 참가자 수 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "참가자 수" : "Number of Players"}
              <span className="text-neutral-400 text-xs ml-2">(2-12)</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updatePlayerCount(numPlayers - 1)}
                disabled={numPlayers <= 2}
                className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 text-lg font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-bold w-10 text-center">{numPlayers}</span>
              <button
                onClick={() => updatePlayerCount(numPlayers + 1)}
                disabled={numPlayers >= 12}
                className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 text-lg font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* 참가자 이름 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "참가자 이름" : "Player Names"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {names.slice(0, numPlayers).map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const arr = [...names];
                      arr[i] = e.target.value;
                      setNames(arr);
                    }}
                    className={inputClass}
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 결과 설정 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "결과 아이템" : "Result Items"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {results.slice(0, numPlayers).map((r, i) => (
                <input
                  key={i}
                  type="text"
                  value={r}
                  onChange={(e) => {
                    const arr = [...results];
                    arr[i] = e.target.value;
                    setResults(arr);
                  }}
                  className={inputClass}
                  maxLength={20}
                />
              ))}
            </div>
          </div>

          {/* 속도 설정 */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "애니메이션 속도" : "Animation Speed"}
            </label>
            <div className="flex gap-2">
              {(["fast", "normal", "slow"] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    speed === s
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {s === "fast"
                    ? isKo ? "빠르게" : "Fast"
                    : s === "normal"
                    ? isKo ? "보통" : "Normal"
                    : isKo ? "느리게" : "Slow"}
                </button>
              ))}
            </div>
          </div>

          {/* 한 명씩 타기 토글 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={soloMode}
              onChange={(e) => setSoloMode(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">
              {isKo ? "한 명씩 타기 모드 (클릭으로 개별 공개)" : "One by One Mode (click to reveal individually)"}
            </span>
          </label>

          {/* 사다리 만들기 버튼 */}
          <button onClick={buildLadder} className={btnPrimary}>
            {isKo ? "🪜 사다리 만들기" : "🪜 Build Ladder"}
          </button>
        </div>
      )}

      {/* ── Ladder Canvas ── */}
      {phase !== "setup" && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
          {/* 사다리 영역 */}
          <div className="relative w-full overflow-hidden rounded-md bg-white dark:bg-neutral-900">
            <canvas ref={canvasRef} className="w-full" />

            {/* Confetti */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 60}%`,
                      fontSize: `${12 + Math.random() * 14}px`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${0.5 + Math.random()}s`,
                    }}
                  >
                    {["🎉", "✨", "🎊", "⭐"][Math.floor(Math.random() * 4)]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 한 명씩 타기 - 참가자 버튼 */}
          {soloMode && (phase === "ready" || phase === "animating") && (
            <div>
              <p className="text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-400">
                {isKo ? "참가자를 클릭하여 결과를 공개하세요:" : "Click a player to reveal their result:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {names.slice(0, numPlayers).map((name, i) => (
                  <button
                    key={i}
                    onClick={() => revealOne(i)}
                    disabled={revealedResults.has(i) || phase === "animating"}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      revealedResults.has(i)
                        ? "bg-neutral-200 dark:bg-neutral-700 line-through"
                        : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: revealedResults.has(i)
                        ? undefined
                        : COLORS[i % COLORS.length] + "20",
                      borderColor: COLORS[i % COLORS.length],
                      borderWidth: 2,
                      color: revealedResults.has(i) ? "#999" : COLORS[i % COLORS.length],
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-3">
            {!soloMode && phase === "ready" && (
              <button
                onClick={revealAll}
                className={btnPrimary}
              >
                {isKo ? "🎬 결과 보기" : "🎬 Reveal All"}
              </button>
            )}
            {(phase === "ready" || phase === "done") && (
              <>
                <button onClick={reshuffle} className={btnSecondary}>
                  {isKo ? "🔀 다시 섞기" : "🔀 Reshuffle"}
                </button>
                <button onClick={resetAll} className={btnSecondary}>
                  {isKo ? "⬅️ 처음부터" : "⬅️ Start Over"}
                </button>
              </>
            )}
          </div>

          {/* 결과 표시 */}
          {phase === "done" && revealedResults.size > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {isKo ? "최종 결과" : "Final Results"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from(revealedResults.entries())
                  .sort((a, b) => a[0] - b[0])
                  .map(([pIdx, destCol]) => (
                    <div
                      key={pIdx}
                      className="rounded-md p-3 text-center"
                      style={{
                        backgroundColor: COLORS[pIdx % COLORS.length] + "15",
                        borderLeft: `3px solid ${COLORS[pIdx % COLORS.length]}`,
                      }}
                    >
                      <p className="text-xs font-medium" style={{ color: COLORS[pIdx % COLORS.length] }}>
                        {names[pIdx]}
                      </p>
                      <p className="text-sm font-bold mt-1">{results[destCol]}</p>
                    </div>
                  ))}
              </div>

              {/* 결과 복사 & 카카오 공유 */}
              <div className="flex flex-wrap gap-2">
                <button onClick={copyResults} className={btnSecondary}>
                  {copied ? (isKo ? "✅ 복사됨!" : "✅ Copied!") : (isKo ? "📋 결과 복사" : "📋 Copy Results")}
                </button>
                {isKo && (
                  <button onClick={shareKakao} className={btnSecondary}>
                    💬 카카오톡 공유
                  </button>
                )}
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
          {howToSteps.map((step, i) => (
            <li key={i}>{step}</li>
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
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              },
              {
                "@type": "WebApplication",
                name: title,
                description,
                url: `https://www.quickfigure.net/${lang}/tools/ladder-game`,
                applicationCategory: "GameApplication",
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
            href={`/${lang}/tools/random-number-generator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.randomNumberGenerator}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.randomNumberGeneratorDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/password-generator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.passwordGenerator}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.passwordGeneratorDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="ladder-game" locale={locale} />
      <ToolDisclaimer slug="ladder-game" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="ladder-game"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="ladder-game"
        lang={lang}
        labels={dict.embed}
      />

      {/* ── Related Blog Posts ── */}
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
