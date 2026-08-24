import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route here is static (no API routes, middleware or server actions),
  // so the build can emit a plain folder of HTML/CSS/JS in `out/` that any
  // host serves directly — no Node process required.
  output: "export",

  // Apache/LiteSpeed serve directories best, so emit about/index.html
  // rather than about.html.
  trailingSlash: true,

  images: {
    // The image optimiser is a server feature and cannot run on a static host.
    // Sources are already sized WebP, so this costs very little.
    unoptimized: true,
  },
};

export default nextConfig;
