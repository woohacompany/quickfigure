"use client";

import EmailSubscribeForm from "@/components/EmailSubscribeForm";

export default function EmailSubscribeBlog({ lang }: { lang: string }) {
  return (
    <div className="mt-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
      <EmailSubscribeForm lang={lang} source="blog" />
    </div>
  );
}
