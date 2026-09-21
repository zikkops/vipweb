import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const baseExtensions = ["tsx", "ts", "jsx", "js"];

export default function config(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // The daily-dues dashboard and its API are a local test backend for now.
    // Files named `*.dev.tsx` / `*.dev.ts` only count as pages and routes under
    // `next dev`, so the production build below never sees them and stays a
    // plain static export for Hostinger.
    pageExtensions: isDev
      ? [...baseExtensions, "dev.tsx", "dev.ts"]
      : baseExtensions,

    // Every public route is static (no API routes, middleware or server
    // actions), so the production build emits a plain `out/` folder that any
    // host serves directly — no Node process required. The dev server keeps
    // normal server mode so the test backend can run.
    ...(isDev ? {} : { output: "export" as const }),

    // Apache/LiteSpeed serve directories best, so emit about/index.html
    // rather than about.html.
    trailingSlash: true,

    images: {
      // The image optimiser is a server feature and cannot run on a static
      // host. Sources are already sized WebP, so this costs very little.
      unoptimized: true,
    },
  };
}
