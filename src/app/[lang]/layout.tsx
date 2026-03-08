import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isValidLocale, locales, type Locale } from "@/lib/dictionaries";
import { TOOL_SLUGS } from "@/lib/tools";
import { blogPosts } from "@/lib/blog";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const t = getDictionary(lang);
  const otherLang: Locale = lang === "en" ? "ko" : "en";

  return (
    <div lang={lang} className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${lang}`} className="text-lg font-bold tracking-tight">
            QuickFigure
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href={`/${lang}`}
              className="text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-colors"
            >
              {t.nav.tools}
            </Link>
            <Link
              href={`/${lang}/blog`}
              className="text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-colors"
            >
              {t.blog.title}
            </Link>
            <Link
              href={`/${lang}/about`}
              className="text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-colors"
            >
              {t.nav.about}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-colors"
            >
              {t.nav.contact}
            </Link>
            <Link
              href={`/${otherLang}`}
              className="ml-2 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {t.langSwitch}
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Ad placeholder - top banner */}
        {/* <div className="max-w-5xl mx-auto px-4 py-2 text-center"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}
        {children}
      </main>

      {/* Trust Section */}
      <section className="mt-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{TOOL_SLUGS.length}+</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.trustSection.tools}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{blogPosts.length}+</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.trustSection.blog}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{t.trustSection.languagesValue}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.trustSection.languages}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bookmark Banner */}
      <div className="bg-blue-50 dark:bg-blue-950 border-y border-blue-100 dark:border-blue-900">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {t.bookmarkBanner.text}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-semibold mb-3">QuickFigure</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                {t.siteDescription}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-3">{t.footer.tools}</p>
              <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                <li>
                  <Link href={`/${lang}/tools/word-counter`} className="hover:text-foreground transition-colors">
                    {t.home.wordCounter}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/tools/json-formatter`} className="hover:text-foreground transition-colors">
                    {t.home.jsonFormatter}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/tools/compound-interest-calculator`} className="hover:text-foreground transition-colors">
                    {t.home.compoundInterest}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/tools/bmi-calculator`} className="hover:text-foreground transition-colors">
                    {t.home.bmiCalc}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/tools/calorie-calculator`} className="hover:text-foreground transition-colors">
                    {t.home.calorieCalc}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">{t.footer.legal}</p>
              <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                <li>
                  <Link href={`/${lang}/privacy-policy`} className="hover:text-foreground transition-colors">
                    {t.nav.privacy}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/terms-of-service`} className="hover:text-foreground transition-colors">
                    {t.nav.terms}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">{t.footer.company}</p>
              <ul className="space-y-2 text-neutral-500 dark:text-neutral-400">
                <li>
                  <Link href={`/${lang}/blog`} className="hover:text-foreground transition-colors">
                    {t.blog.title}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/about`} className="hover:text-foreground transition-colors">
                    {t.nav.about}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lang}/contact`} className="hover:text-foreground transition-colors">
                    {t.nav.contact}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} QuickFigure. {t.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
