"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Color conversion utilities ── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
  const c1 = 1 - r / 255, m1 = 1 - g / 255, y1 = 1 - b / 255;
  const k = Math.min(c1, m1, y1);
  return [
    Math.round(((c1 - k) / (1 - k)) * 100),
    Math.round(((m1 - k) / (1 - k)) * 100),
    Math.round(((y1 - k) / (1 - k)) * 100),
    Math.round(k * 100),
  ];
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return [
    Math.round(255 * (1 - c) * (1 - k)),
    Math.round(255 * (1 - m) * (1 - k)),
    Math.round(255 * (1 - y) * (1 - k)),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ColorPickerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.colorPicker;
  const relatedPosts = getPostsByTool("color-picker");

  const [hex, setHex] = useState("#3B82F6");
  const [copied, setCopied] = useState<string | null>(null);
  const [paletteType, setPaletteType] = useState<"complementary" | "analogous" | "triadic">("complementary");
  const [history, setHistory] = useState<string[]>([]);
  const [contrastFg, setContrastFg] = useState("#000000");
  const [contrastBg, setContrastBg] = useState("#FFFFFF");
  const lastColorRef = useRef(hex);

  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [cmykC, cmykM, cmykY, cmykK] = rgbToCmyk(r, g, b);

  function addToHistory(color: string) {
    if (color === lastColorRef.current) return;
    lastColorRef.current = color;
    setHistory((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 20);
    });
  }

  const updateFromHex = useCallback((newHex: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(newHex)) {
      setHex(newHex);
      addToHistory(newHex);
    }
  }, []);

  const updateFromRgb = useCallback((nr: number, ng: number, nb: number) => {
    const newHex = rgbToHex(nr, ng, nb);
    setHex(newHex);
    addToHistory(newHex);
  }, []);

  const updateFromHsl = useCallback((nh: number, ns: number, nl: number) => {
    const [nr, ng, nb] = hslToRgb(nh, ns, nl);
    const newHex = rgbToHex(nr, ng, nb);
    setHex(newHex);
    addToHistory(newHex);
  }, []);

  const updateFromCmyk = useCallback((nc: number, nm: number, ny: number, nk: number) => {
    const [nr, ng, nb] = cmykToRgb(nc, nm, ny, nk);
    const newHex = rgbToHex(nr, ng, nb);
    setHex(newHex);
    addToHistory(newHex);
  }, []);

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  }

  function getPalette(): string[] {
    if (paletteType === "complementary") {
      return [hex, rgbToHex(...hslToRgb((h + 180) % 360, s, l))];
    }
    if (paletteType === "analogous") {
      return [
        rgbToHex(...hslToRgb((h + 330) % 360, s, l)),
        hex,
        rgbToHex(...hslToRgb((h + 30) % 360, s, l)),
        rgbToHex(...hslToRgb((h + 60) % 360, s, l)),
      ];
    }
    return [hex, rgbToHex(...hslToRgb((h + 120) % 360, s, l)), rgbToHex(...hslToRgb((h + 240) % 360, s, l))];
  }

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
  const cmykStr = `cmyk(${cmykC}%, ${cmykM}%, ${cmykY}%, ${cmykK}%)`;

  // Contrast checker
  const fgRgb = hexToRgb(contrastFg) as [number, number, number];
  const bgRgb = hexToRgb(contrastBg) as [number, number, number];
  const ratio = contrastRatio(fgRgb, bgRgb);
  const ratioStr = ratio.toFixed(2);
  const passAANormal = ratio >= 4.5;
  const passAALarge = ratio >= 3;
  const passAAANormal = ratio >= 7;
  const passAAALarge = ratio >= 4.5;

  const inputCls = "w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const copyBtnCls = "px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer mt-4";

  const toolUrl = `https://www.quickfigure.net/${lang}/tools/color-picker`;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.title,
    url: toolUrl,
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: t.metaDescription,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqItems.map((item: { q: string; a: string }) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="color-picker" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Color Picker */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.pickColor}</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => { setHex(e.target.value); addToHistory(e.target.value); }}
              className="w-20 h-20 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700"
            />
            <div
              className="flex-1 h-20 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-sm font-mono"
              style={{ backgroundColor: hex, color: l > 55 ? "#000" : "#fff" }}
            >
              {hexStr}
            </div>
          </div>
        </div>

        {/* HEX Input */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.hex}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hexStr}
              onChange={(e) => updateFromHex(e.target.value)}
              className="flex-1 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => copyText(hexStr)}
              className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
              {copied === hexStr ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* RGB Inputs */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.rgb}</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.red}</label>
              <input type="number" min="0" max="255" value={r}
                onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, g, b)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.green}</label>
              <input type="number" min="0" max="255" value={g}
                onChange={(e) => updateFromRgb(r, parseInt(e.target.value) || 0, b)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.blue}</label>
              <input type="number" min="0" max="255" value={b}
                onChange={(e) => updateFromRgb(r, g, parseInt(e.target.value) || 0)}
                className={inputCls} />
            </div>
            <button onClick={() => copyText(rgbStr)} className={copyBtnCls}>
              {copied === rgbStr ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* HSL Inputs */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.hsl}</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.hue}</label>
              <input type="number" min="0" max="360" value={h}
                onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, s, l)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.saturation}</label>
              <input type="number" min="0" max="100" value={s}
                onChange={(e) => updateFromHsl(h, parseInt(e.target.value) || 0, l)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.lightness}</label>
              <input type="number" min="0" max="100" value={l}
                onChange={(e) => updateFromHsl(h, s, parseInt(e.target.value) || 0)}
                className={inputCls} />
            </div>
            <button onClick={() => copyText(hslStr)} className={copyBtnCls}>
              {copied === hslStr ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* CMYK Inputs */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.cmyk}</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.cyan}</label>
              <input type="number" min="0" max="100" value={cmykC}
                onChange={(e) => updateFromCmyk(parseInt(e.target.value) || 0, cmykM, cmykY, cmykK)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.magenta}</label>
              <input type="number" min="0" max="100" value={cmykM}
                onChange={(e) => updateFromCmyk(cmykC, parseInt(e.target.value) || 0, cmykY, cmykK)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.yellow}</label>
              <input type="number" min="0" max="100" value={cmykY}
                onChange={(e) => updateFromCmyk(cmykC, cmykM, parseInt(e.target.value) || 0, cmykK)}
                className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.key}</label>
              <input type="number" min="0" max="100" value={cmykK}
                onChange={(e) => updateFromCmyk(cmykC, cmykM, cmykY, parseInt(e.target.value) || 0)}
                className={inputCls} />
            </div>
            <button onClick={() => copyText(cmykStr)} className={copyBtnCls}>
              {copied === cmykStr ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* CSS Code Snippet */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.cssCode}</label>
          <div className="relative">
            <pre className="p-4 rounded-md bg-neutral-900 dark:bg-neutral-950 text-neutral-100 text-sm font-mono overflow-x-auto">
{`color: ${hexStr};
background-color: ${rgbStr};
background-color: ${hslStr};
/* CMYK: ${cmykStr} */`}
            </pre>
            <button
              onClick={() => copyText(`color: ${hexStr};\nbackground-color: ${rgbStr};\nbackground-color: ${hslStr};`)}
              className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-neutral-700 text-neutral-200 hover:bg-neutral-600 transition-colors cursor-pointer">
              {copied === `color: ${hexStr};\nbackground-color: ${rgbStr};\nbackground-color: ${hslStr};` ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.palette}</label>
          <div className="flex gap-2 mb-3">
            {(["complementary", "analogous", "triadic"] as const).map((type) => (
              <button key={type} onClick={() => setPaletteType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  paletteType === type
                    ? "bg-foreground text-background border-foreground"
                    : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}>
                {t[type]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {getPalette().map((color, i) => (
              <button key={i} onClick={() => { setHex(color); addToHistory(color); copyText(color.toUpperCase()); }}
                className="flex-1 h-20 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-end justify-center pb-2"
                style={{ backgroundColor: color }}
                title={color.toUpperCase()}
              >
                <span className="text-xs font-mono px-1 py-0.5 rounded bg-black/30 text-white">{color.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contrast Checker */}
        <div>
          <label className="text-sm font-medium block mb-3">{t.contrastChecker}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">{t.textColor}</label>
              <div className="flex gap-2">
                <input type="color" value={contrastFg} onChange={(e) => setContrastFg(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700" />
                <input type="text" value={contrastFg.toUpperCase()}
                  onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setContrastFg(e.target.value); }}
                  className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">{t.bgColor}</label>
              <div className="flex gap-2">
                <input type="color" value={contrastBg} onChange={(e) => setContrastBg(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700" />
                <input type="text" value={contrastBg.toUpperCase()}
                  onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setContrastBg(e.target.value); }}
                  className={inputCls} />
              </div>
            </div>
          </div>
          <div className="flex justify-center mb-3">
            <button
              onClick={() => { const tmp = contrastFg; setContrastFg(contrastBg); setContrastBg(tmp); }}
              className="px-4 py-1.5 rounded-full text-xs font-medium border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
              ↕ {t.swap}
            </button>
          </div>
          {/* Preview */}
          <div className="rounded-md p-4 mb-4 border border-neutral-200 dark:border-neutral-700" style={{ backgroundColor: contrastBg }}>
            <p className="text-lg font-semibold" style={{ color: contrastFg }}>{t.preview} - {t.normalText}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: contrastFg }}>{t.preview} - {t.largeText}</p>
          </div>
          {/* Ratio & WCAG results */}
          <div className="text-center mb-3">
            <span className="text-3xl font-bold">{ratioStr}:1</span>
            <span className="text-sm text-neutral-500 ml-2">{t.contrastRatio}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-neutral-200 dark:border-neutral-700 p-3">
              <div className="font-medium mb-2">{t.wcagAA}</div>
              <div className="flex justify-between">
                <span>{t.normalText}</span>
                <span className={`font-semibold ${passAANormal ? "text-green-600" : "text-red-500"}`}>{passAANormal ? t.pass : t.fail}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>{t.largeText}</span>
                <span className={`font-semibold ${passAALarge ? "text-green-600" : "text-red-500"}`}>{passAALarge ? t.pass : t.fail}</span>
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 dark:border-neutral-700 p-3">
              <div className="font-medium mb-2">{t.wcagAAA}</div>
              <div className="flex justify-between">
                <span>{t.normalText}</span>
                <span className={`font-semibold ${passAAANormal ? "text-green-600" : "text-red-500"}`}>{passAAANormal ? t.pass : t.fail}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>{t.largeText}</span>
                <span className={`font-semibold ${passAAALarge ? "text-green-600" : "text-red-500"}`}>{passAAALarge ? t.pass : t.fail}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3 justify-center">
            <button
              onClick={() => { setContrastFg(hex); }}
              className="px-3 py-1.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
              {locale === "ko" ? "현재 색상을 텍스트로" : "Use current as text"}
            </button>
            <button
              onClick={() => { setContrastBg(hex); }}
              className="px-3 py-1.5 rounded-full text-xs border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
              {locale === "ko" ? "현재 색상을 배경으로" : "Use current as bg"}
            </button>
          </div>
        </div>

        {/* Color History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{t.colorHistory}</label>
              <button onClick={() => setHistory([])}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer">
                {t.clearHistory}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((color, i) => (
                <button
                  key={`${color}-${i}`}
                  onClick={() => { setHex(color); }}
                  className="w-9 h-9 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  style={{ backgroundColor: color }}
                  title={color.toUpperCase()}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ToolHowItWorks slug="color-picker" locale={locale} />
      <ToolDisclaimer slug="color-picker" locale={locale} />

      <ShareButtons title={t.title} description={t.description} lang={lang} slug="color-picker" labels={dict.share} />
      <EmbedCodeButton slug="color-picker" lang={lang} labels={dict.embed} />

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faqItems.map((item: { q: string; a: string }, i: number) => (
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium flex items-center justify-between">
                {item.q}
                <span className="text-neutral-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t.relatedToolsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { slug: "qr-code-generator", icon: "📱", name: locale === "ko" ? "QR 코드 생성기" : "QR Code Generator" },
            { slug: "password-generator", icon: "🔐", name: locale === "ko" ? "비밀번호 생성기" : "Password Generator" },
            { slug: "json-formatter", icon: "📋", name: locale === "ko" ? "JSON 포맷터" : "JSON Formatter" },
          ].map((tool) => (
            <Link key={tool.slug} href={`/${lang}/tools/${tool.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
              <span className="text-2xl">{tool.icon}</span>
              <h3 className="mt-2 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
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
