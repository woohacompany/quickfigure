"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Variant = "homepage" | "blog" | "tool";

interface Props {
  lang: string;
  source: Variant;
}

const text = {
  en: {
    homepage: {
      title: "Get notified when new tools launch",
      subtitle: "New free tools and guides added weekly. Be the first to know.",
      disclaimer: "No spam, just new tool alerts. Unsubscribe anytime.",
    },
    blog: {
      title: "Found this helpful? Get new guide alerts",
      subtitle: "",
      disclaimer: "No spam. Unsubscribe anytime.",
    },
    tool: {
      title: "Get notified of new tools",
      subtitle: "",
      disclaimer: "No spam. Unsubscribe anytime.",
    },
    placeholder: "Enter your email",
    button: "Subscribe",
    submitting: "Subscribing...",
    success: "Subscribed! We'll send you new tool updates. 🎉",
    duplicate: "You're already subscribed! Thanks. 😊",
    error: "Subscription is being set up. Please try again later.",
    privacy: "By subscribing, you agree to our",
    privacyLink: "Privacy Policy",
  },
  ko: {
    homepage: {
      title: "새 도구가 나오면 알려드릴게요",
      subtitle: "매주 새로운 무료 도구와 실용 가이드가 추가됩니다. 이메일로 가장 먼저 받아보세요.",
      disclaimer: "스팸 없이, 새 도구 소식만 보내드립니다. 언제든 구독 취소 가능.",
    },
    blog: {
      title: "이 글이 도움이 되셨나요? 새 가이드 알림 받기",
      subtitle: "",
      disclaimer: "스팸 없이, 새 소식만 보내드립니다. 언제든 취소 가능.",
    },
    tool: {
      title: "새 도구 출시 알림 받기",
      subtitle: "",
      disclaimer: "스팸 없이, 새 소식만 보내드립니다. 언제든 취소 가능.",
    },
    placeholder: "이메일 주소를 입력하세요",
    button: "구독하기",
    submitting: "구독 중...",
    success: "구독 완료! 새 도구 소식을 보내드릴게요. 🎉",
    duplicate: "이미 구독 중이에요! 감사합니다. 😊",
    error: "구독 기능을 준비 중입니다. 잠시 후 다시 시도해주세요.",
    privacy: "구독 시",
    privacyLink: "개인정보처리방침",
  },
};

export default function EmailSubscribeForm({ lang, source }: Props) {
  const locale = lang === "ko" ? "ko" : "en";
  const t = text[locale];
  const variant = t[source];

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "duplicate" | "error">("idle");

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    setStatus("submitting");

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("email_subscribers").insert({
        email: email.toLowerCase().trim(),
        source,
        language: locale,
      });

      if (error) {
        console.error("[EmailSubscribe] Supabase error:", error.code, error.message, error.details, error.hint);
        if (error.code === "23505") {
          setStatus("duplicate");
        } else {
          setStatus("error");
        }
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch (err) {
      console.error("[EmailSubscribe] Exception:", err);
      setStatus("error");
    }
  }

  const statusMessage =
    status === "success" ? t.success :
    status === "duplicate" ? t.duplicate :
    status === "error" ? t.error : null;

  const isCompact = source !== "homepage";

  return (
    <div className={source === "homepage" ? "py-12 px-4" : "py-8 px-4"}>
      <div className={`max-w-xl mx-auto ${source === "homepage" ? "text-center" : "text-center sm:text-left"}`}>
        <h3 className={`font-bold ${isCompact ? "text-lg" : "text-xl sm:text-2xl"}`}>
          {variant.title}
        </h3>
        {variant.subtitle && (
          <p className="mt-2 text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
            {variant.subtitle}
          </p>
        )}

        {statusMessage ? (
          <p className={`mt-4 text-sm font-medium ${
            status === "error"
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {statusMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                required
                className="flex-1 px-4 py-3 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                type="submit"
                disabled={status === "submitting" || !isValidEmail(email)}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {status === "submitting" && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {status === "submitting" ? t.submitting : t.button}
              </button>
            </div>
          </form>
        )}

        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          {variant.disclaimer}
          {" · "}
          {t.privacy}{" "}
          <Link href={`/${lang}/privacy-policy`} className="underline hover:text-neutral-600 dark:hover:text-neutral-300">
            {t.privacyLink}
          </Link>
          {locale === "ko" ? "에 동의합니다." : "."}
        </p>
      </div>
    </div>
  );
}
