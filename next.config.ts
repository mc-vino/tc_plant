import type { NextConfig } from "next";

// Static export for GitHub Pages is enabled only when STATIC_EXPORT=true
// (set in the Pages workflow), so local dev/build/start stay unchanged.
const staticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? { output: "export", images: { unoptimized: true }, trailingSlash: true }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
