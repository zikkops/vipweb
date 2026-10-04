import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route is static (no API routes, middleware or server actions), so
  // the build emits a plain `out/` folder that any host serves directly — no
  // Node process required. The dashboard is static too: its pages talk to
  // Supabase from the browser.
  output: "export",

  // Apache/LiteSpeed serve directories best, so emit about/index.html
  // rather than about.html.
  trailingSlash: true,

  images: {
    // The image optimiser is a server feature and cannot run on a static
    // host. Sources are already sized WebP, so this costs very little.
    unoptimized: true,
  },
};

export default nextConfig;
