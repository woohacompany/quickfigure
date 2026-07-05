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
    ];
  },
};

export default nextConfig;
