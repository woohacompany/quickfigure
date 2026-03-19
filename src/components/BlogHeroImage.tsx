import type { ReactNode } from "react";
import type { BlogCategory } from "@/lib/blog";

const categoryConfig: Record<BlogCategory, { gradient: string; icon: ReactNode }> = {
  "text-tools": {
    gradient: "from-indigo-500 to-purple-600",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 sm:w-28 sm:h-28">
        <rect x="20" y="25" width="80" height="70" rx="6" fill="white" fillOpacity="0.15" />
        <rect x="20" y="25" width="80" height="14" rx="6" fill="white" fillOpacity="0.25" />
        <line x1="32" y1="52" x2="88" y2="52" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="62" x2="75" y2="62" stroke="white" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="72" x2="82" y2="72" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="82" x2="60" y2="82" stroke="white" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
        <text x="38" y="36" fill="white" fillOpacity="0.8" fontSize="11" fontWeight="bold" fontFamily="monospace">Aa</text>
      </svg>
    ),
  },
  "developer-tools": {
    gradient: "from-emerald-500 to-teal-600",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 sm:w-28 sm:h-28">
        <rect x="15" y="20" width="90" height="80" rx="8" fill="white" fillOpacity="0.15" />
        <rect x="15" y="20" width="90" height="16" rx="8" fill="white" fillOpacity="0.2" />
        <circle cx="28" cy="28" r="3" fill="#ff5f57" fillOpacity="0.8" />
        <circle cx="38" cy="28" r="3" fill="#febc2e" fillOpacity="0.8" />
        <circle cx="48" cy="28" r="3" fill="#28c840" fillOpacity="0.8" />
        <text x="25" y="55" fill="white" fillOpacity="0.7" fontSize="10" fontFamily="monospace">{"{"}</text>
        <text x="33" y="67" fill="#a5f3fc" fillOpacity="0.9" fontSize="10" fontFamily="monospace">&quot;key&quot;</text>
        <text x="67" y="67" fill="white" fillOpacity="0.5" fontSize="10" fontFamily="monospace">:</text>
        <text x="73" y="67" fill="#bef264" fillOpacity="0.9" fontSize="10" fontFamily="monospace">&quot;val&quot;</text>
        <text x="25" y="79" fill="white" fillOpacity="0.7" fontSize="10" fontFamily="monospace">{"}"}</text>
      </svg>
    ),
  },
  generators: {
    gradient: "from-amber-500 to-orange-600",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 sm:w-28 sm:h-28">
        <path d="M60 20 L66 42 L88 42 L70 56 L76 78 L60 64 L44 78 L50 56 L32 42 L54 42 Z" fill="white" fillOpacity="0.25" />
        <circle cx="60" cy="60" r="30" stroke="white" strokeOpacity="0.3" strokeWidth="2" fill="none" />
        <circle cx="60" cy="60" r="20" stroke="white" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        <circle cx="85" cy="30" r="5" fill="white" fillOpacity="0.15" />
        <circle cx="30" cy="85" r="8" fill="white" fillOpacity="0.1" />
        <circle cx="90" cy="80" r="4" fill="white" fillOpacity="0.15" />
      </svg>
    ),
  },
  finance: {
    gradient: "from-blue-500 to-cyan-600",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 sm:w-28 sm:h-28">
        <rect x="20" y="85" width="14" height="20" rx="2" fill="white" fillOpacity="0.3" />
        <rect x="38" y="65" width="14" height="40" rx="2" fill="white" fillOpacity="0.4" />
        <rect x="56" y="50" width="14" height="55" rx="2" fill="white" fillOpacity="0.5" />
        <rect x="74" y="35" width="14" height="70" rx="2" fill="white" fillOpacity="0.6" />
        <rect x="92" y="20" width="14" height="85" rx="2" fill="white" fillOpacity="0.7" />
        <path d="M22 80 Q45 55 60 50 Q80 40 100 20" stroke="white" strokeOpacity="0.8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="20" r="4" fill="white" fillOpacity="0.9" />
      </svg>
    ),
  },
  utility: {
    gradient: "from-violet-500 to-fuchsia-600",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 sm:w-28 sm:h-28">
        <rect x="25" y="30" width="70" height="60" rx="8" fill="white" fillOpacity="0.15" />
        <rect x="35" y="42" width="20" height="20" rx="4" fill="white" fillOpacity="0.3" />
        <rect x="65" y="42" width="20" height="20" rx="4" fill="white" fillOpacity="0.25" />
        <rect x="35" y="68" width="20" height="12" rx="4" fill="white" fillOpacity="0.2" />
        <rect x="65" y="68" width="20" height="12" rx="4" fill="white" fillOpacity="0.35" />
        <circle cx="45" cy="52" r="5" fill="white" fillOpacity="0.5" />
        <path d="M72 48 L78 48 L75 54 Z" fill="white" fillOpacity="0.5" />
      </svg>
    ),
  },
  lifestyle: {
    gradient: "from-rose-500 to-pink-600",
    icon: (
      <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 sm:w-28 sm:h-28">
        <path d="M60 95 C25 70 10 50 10 35 C10 20 22 10 37 10 C47 10 55 16 60 25 C65 16 73 10 83 10 C98 10 110 20 110 35 C110 50 95 70 60 95Z" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
        <circle cx="60" cy="52" r="15" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <circle cx="60" cy="48" r="5" fill="white" fillOpacity="0.3" />
        <line x1="60" y1="55" x2="60" y2="67" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
        <line x1="52" y1="60" x2="68" y2="60" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
      </svg>
    ),
  },
};

export default function BlogHeroImage({
  category,
  alt,
  size = "large",
  heroImage,
}: {
  category: BlogCategory;
  alt: string;
  size?: "large" | "small";
  heroImage?: string;
}) {
  const config = categoryConfig[category];
  const heightClass = size === "large" ? "h-56 sm:h-72" : "h-44";
  const imgSize = size === "large" ? "w=800&q=80" : "w=400&q=80";

  // Unsplash photo mode
  if (heroImage) {
    const src = `${heroImage}?${imgSize}&auto=format&fit=crop`;
    return (
      <div
        className={`w-full ${heightClass} rounded-lg relative overflow-hidden`}
        role="img"
        aria-label={alt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/10" />
      </div>
    );
  }

  // Fallback: gradient + icon
  return (
    <div
      className={`w-full ${heightClass} rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center relative overflow-hidden`}
      role="img"
      aria-label={alt}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white blur-2xl" />
        <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-white blur-3xl" />
      </div>
      <div className="relative z-10">{config.icon}</div>
    </div>
  );
}
