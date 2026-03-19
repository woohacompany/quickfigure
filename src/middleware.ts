import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "ko"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang.split(",").map((l) => l.split(";")[0].trim().substring(0, 2));
    for (const lang of preferred) {
      if (locales.includes(lang)) return lang;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // non-www → www 301 redirect (single hop, includes locale)
  if (host === "quickfigure.net") {
    const hasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );
    let dest = pathname;
    if (!hasLocale && !pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.includes(".")) {
      const locale = getLocale(request);
      dest = `/${locale}${pathname}`;
    }
    const url = new URL(`https://www.quickfigure.net${dest}${request.nextUrl.search}`);
    return NextResponse.redirect(url, 301);
  }

  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (hasLocale) return;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // files like favicon.ico, robots.txt, sitemap.xml
  ) {
    return;
  }

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
