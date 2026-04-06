import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "quickfigure.net" }],
        destination: "https://www.quickfigure.net/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
