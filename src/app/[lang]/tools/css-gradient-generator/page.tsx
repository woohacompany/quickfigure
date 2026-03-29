"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface ColorStop {
  color: string;
  position: number;
}

const PRESETS: { name: string; type: "linear" | "radial"; angle: number; stops: ColorStop[] }[] = [
  { name: "Sunset", type: "linear", angle: 135, stops: [{ color: "#f093fb", position: 0 }, { color: "#f5576c", position: 100 }] },
  { name: "Ocean", type: "linear", angle: 90, stops: [{ color: "#667eea", position: 0 }, { color: "#764ba2", position: 100 }] },
  { name: "Lime", type: "linear", angle: 135, stops: [{ color: "#d4fc79", position: 0 }, { color: "#96e6a1", position: 100 }] },
  { name: "Peach", type: "linear", angle: 90, stops: [{ color: "#ffecd2", position: 0 }, { color: "#fcb69f", position: 100 }] },
  { name: "Cool Blues", type: "linear", angle: 120, stops: [{ color: "#2193b0", position: 0 }, { color: "#6dd5ed", position: 100 }] },
  { name: "Warm Fire", type: "linear", angle: 45, stops: [{ color: "#f12711", position: 0 }, { color: "#f5af19", position: 100 }] },
  { name: "Purple Dream", type: "linear", angle: 135, stops: [{ color: "#a18cd1", position: 0 }, { color: "#fbc2eb", position: 100 }] },
  { name: "Fresh Mint", type: "linear", angle: 90, stops: [{ color: "#0cebeb", position: 0 }, { color: "#20e3b2", position: 50 }, { color: "#29ffc6", position: 100 }] },
  { name: "Night Sky", type: "linear", angle: 180, stops: [{ color: "#0f0c29", position: 0 }, { color: "#302b63", position: 50 }, { color: "#24243e", position: 100 }] },
  { name: "Rainbow", type: "linear", angle: 90, stops: [{ color: "#ff0000", position: 0 }, { color: "#ffff00", position: 25 }, { color: "#00ff00", position: 50 }, { color: "#0000ff", position: 75 }, { color: "#ff00ff", position: 100 }] },
  { name: "Radial Glow", type: "radial", angle: 0, stops: [{ color: "#f5f7fa", position: 0 }, { color: "#c3cfe2", position: 100 }] },
  { name: "Radial Sun", type: "radial", angle: 0, stops: [{ color: "#fceabb", position: 0 }, { color: "#f8b500", position: 100 }] },
];

const DIRECTION_PRESETS = [
  { label: "→", value: 90 },
  { label: "↓", value: 180 },
  { label: "←", value: 270 },
  { label: "↑", value: 0 },
  { label: "↘", value: 135 },
  { label: "↗", value: 45 },
  { label: "↙", value: 225 },
  { label: "↖", value: 315 },
];

function randomHex(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

export default function CssGradientPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.cssGradient;
  const relatedPosts = getPostsByTool("css-gradient-generator");

  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#667eea", position: 0 },
    { color: "#764ba2", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const gradientCSS = useCallback(() => {
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    }
    return `radial-gradient(circle, ${stopsStr})`;
  }, [gradientType, angle, stops]);

  const fullCSS = useCallback(() => {
    const grad = gradientCSS();
    if (gradientType === "linear") {
      const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
      return `background: ${grad};\nbackground: -webkit-linear-gradient(${angle}deg, ${stopsStr});`;
    }
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    return `background: ${grad};\nbackground: -webkit-radial-gradient(circle, ${stopsStr});`;
  }, [gradientType, angle, stops, gradientCSS]);

  function updateStop(index: number, field: "color" | "position", value: string | number) {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addStop() {
    if (stops.length >= 5) return;
    const lastPos = stops[stops.length - 1]?.position ?? 100;
    const newPos = Math.min(100, lastPos);
    setStops((prev) => [...prev, { color: randomHex(), position: newPos }]);
  }

  function removeStop(index: number) {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setStops([...preset.stops]);
  }

  function generateRandom() {
    const numStops = 2 + Math.floor(Math.random() * 3);
    const newStops: ColorStop[] = [];
    for (let i = 0; i < numStops; i++) {
      newStops.push({ color: randomHex(), position: Math.round((i / (numStops - 1)) * 100) });
    }
    setAngle(Math.floor(Math.random() * 360));
    setGradientType(Math.random() > 0.8 ? "radial" : "linear");
    setStops(newStops);
  }

  async function copyCSS() {
    try {
      await navigator.clipboard.writeText(fullCSS());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = fullCSS();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Preview */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.preview}</label>
          <div
            className="w-full h-48 rounded-lg border border-neutral-200 dark:border-neutral-700"
            style={{ background: gradientCSS() }}
          />
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setGradientType("linear")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              gradientType === "linear"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t.linear}
          </button>
          <button
            onClick={() => setGradientType("radial")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              gradientType === "radial"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t.radial}
          </button>
        </div>

        {/* Angle (linear only) */}
        {gradientType === "linear" && (
          <div>
            <label className="text-sm font-medium block mb-2">
              {t.angle}: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {DIRECTION_PRESETS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setAngle(d.value)}
                  className={`w-9 h-9 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                    angle === d.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Stops */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">{t.colorStops}</label>
            {stops.length < 5 && (
              <button
                onClick={addStop}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                + {t.addStop}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(i, "color", e.target.value)}
                  className="w-10 h-10 rounded-md border border-neutral-200 dark:border-neutral-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateStop(i, "color", v);
                  }}
                  className="w-24 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => updateStop(i, "position", Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-xs text-neutral-400 w-10 text-right">{stop.position}%</span>
                </div>
                {stops.length > 2 && (
                  <button
                    onClick={() => removeStop(i)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    {t.removeStop}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CSS Output */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.cssCode}</label>
          <div className="relative">
            <pre className="p-4 rounded-md bg-neutral-900 text-neutral-100 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {fullCSS()}
            </pre>
            <button
              onClick={copyCSS}
              className="absolute top-2 right-2 px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {copied ? t.copied : t.copyCss}
            </button>
          </div>
        </div>

        {/* Random Button */}
        <button
          onClick={generateRandom}
          className="px-5 py-2 rounded-md bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 font-medium hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors cursor-pointer"
        >
          {t.random}
        </button>
      </div>

      {/* Presets */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t.presets}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const stopsStr = preset.stops.map((s) => `${s.color} ${s.position}%`).join(", ");
            const bg =
              preset.type === "linear"
                ? `linear-gradient(${preset.angle}deg, ${stopsStr})`
                : `radial-gradient(circle, ${stopsStr})`;
            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer"
              >
                <div className="h-20" style={{ background: bg }} />
                <p className="text-xs font-medium py-2 px-2 text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">
                  {preset.name}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {t.faqItems.map((item: { q: string; a: string }, i: number) => (
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.faqItems.map((item: { q: string; a: string }) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* WebApplication JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t.title,
            description: t.description,
            url: `https://quickfigure.net/${locale}/tools/css-gradient-generator`,
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/color-picker`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.colorPicker}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.colorPickerDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/json-formatter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.jsonFormatter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.jsonFormatterDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="css-gradient-generator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="css-gradient-generator"
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
