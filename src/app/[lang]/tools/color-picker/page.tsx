"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

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

  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  const updateFromHex = useCallback((newHex: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(newHex)) setHex(newHex);
  }, []);

  const updateFromRgb = useCallback((nr: number, ng: number, nb: number) => {
    setHex(rgbToHex(nr, ng, nb));
  }, []);

  const updateFromHsl = useCallback((nh: number, ns: number, nl: number) => {
    const [nr, ng, nb] = hslToRgb(nh, ns, nl);
    setHex(rgbToHex(nr, ng, nb));
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Color Picker */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.pickColor}</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-16 h-16 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700"
            />
            <div
              className="flex-1 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700"
              style={{ backgroundColor: hex }}
            />
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
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.green}</label>
              <input type="number" min="0" max="255" value={g}
                onChange={(e) => updateFromRgb(r, parseInt(e.target.value) || 0, b)}
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.blue}</label>
              <input type="number" min="0" max="255" value={b}
                onChange={(e) => updateFromRgb(r, g, parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => copyText(rgbStr)}
              className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer mt-4">
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
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.saturation}</label>
              <input type="number" min="0" max="100" value={s}
                onChange={(e) => updateFromHsl(h, parseInt(e.target.value) || 0, l)}
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500">{t.lightness}</label>
              <input type="number" min="0" max="100" value={l}
                onChange={(e) => updateFromHsl(h, s, parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => copyText(hslStr)}
              className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer mt-4">
              {copied === hslStr ? t.copied : t.copy}
            </button>
          </div>
        </div>

        {/* CSS Code */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.cssCode}</label>
          <pre className="p-3 rounded-md bg-neutral-900 dark:bg-neutral-950 text-neutral-100 text-sm font-mono overflow-x-auto">
{`color: ${hexStr};
background-color: ${rgbStr};
background-color: ${hslStr};`}
          </pre>
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
              <button key={i} onClick={() => { setHex(color); copyText(color.toUpperCase()); }}
                className="flex-1 h-16 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                style={{ backgroundColor: color }}
                title={color.toUpperCase()}
              />
            ))}
          </div>
        </div>
      </div>

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="color-picker"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="color-picker"
        lang={lang}
        labels={dict.embed}
      />

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
