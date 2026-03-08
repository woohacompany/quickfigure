"use client";

import { useState, useEffect } from "react";

interface ShareButtonsProps {
  title: string;
  description: string;
  lang: string;
  slug: string;
  labels: {
    share: string;
    kakao: string;
    facebook: string;
    twitter: string;
    copyLink: string;
    copied: string;
  };
}

export default function ShareButtons({ title, description, lang, slug, labels }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [ogImage, setOgImage] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(`${origin}/${lang}/tools/${slug}`);
    setOgImage(`${origin}/og-image.png`);
  }, [lang, slug]);

  const shareText = `${title} - ${description}`;

  function handleKakao() {
    const w = window as typeof window & {
      Kakao?: {
        isInitialized: () => boolean;
        Share: { sendDefault: (config: Record<string, unknown>) => void };
      };
      __KAKAO_INIT__?: () => void;
    };
    // Try initializing if not yet done
    if (w.__KAKAO_INIT__) w.__KAKAO_INIT__();

    if (w.Kakao && w.Kakao.isInitialized()) {
      w.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: ogImage,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: lang === "ko" ? "바로가기" : "Open",
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      });
    }
  }

  function handleFacebook() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }

  function handleTwitter() {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 mt-6 flex-wrap">
      <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">{labels.share}</span>

      {/* KakaoTalk - ko only */}
      {lang === "ko" && (
        <button
          onClick={handleKakao}
          data-share="kakao"
          data-tool={slug}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#FEE500] text-[#191919] hover:bg-[#FDD800] transition-colors cursor-pointer"
          aria-label={labels.kakao}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.687 1.747 5.049 4.387 6.394l-.913 3.37a.3.3 0 0 0 .458.33l3.918-2.592c.68.097 1.38.148 2.09.148h.06C17.523 18.341 22 14.879 22 10.691 22 6.463 17.523 3 12 3" />
          </svg>
          {labels.kakao}
        </button>
      )}

      {/* Facebook */}
      <button
        onClick={handleFacebook}
        data-share="facebook"
        data-tool={slug}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors cursor-pointer"
        aria-label={labels.facebook}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        {labels.facebook}
      </button>

      {/* X (Twitter) */}
      <button
        onClick={handleTwitter}
        data-share="twitter"
        data-tool={slug}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
        aria-label={labels.twitter}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {labels.twitter}
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        data-share="copy-link"
        data-tool={slug}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        aria-label={labels.copyLink}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? labels.copied : labels.copyLink}
      </button>
    </div>
  );
}
