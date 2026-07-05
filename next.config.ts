import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // non-www → www for all paths EXCEPT /ads.txt.
        // Google's AdSense ads.txt crawler does not reliably follow this 308
        // redirect, which made AdSense report ads.txt as "not found". Excluding
        // it lets ads.txt serve directly (200) on both hosts.
        source: "/:path((?!ads\\.txt$).*)",
        has: [{ type: "host", value: "quickfigure.net" }],
        destination: "https://www.quickfigure.net/:path",
        permanent: true,
      },
      // Block all blog routes during AdSense review by 308-redirecting them to
      // the homepage. Blog data (src/lib/blog.ts) and page components stay in
      // the codebase — deleting these six entries fully restores the blog.
      // List page and sub-paths are listed separately so the list URL is
      // covered regardless of how :path* treats the zero-segment case.
      { source: "/ko/blog", destination: "/ko", permanent: true },
      { source: "/ko/blog/:path*", destination: "/ko", permanent: true },
      { source: "/en/blog", destination: "/en", permanent: true },
      { source: "/en/blog/:path*", destination: "/en", permanent: true },
      { source: "/blog", destination: "/ko", permanent: true },
      { source: "/blog/:path*", destination: "/ko", permanent: true },
    ];
  },
};

export default nextConfig;
