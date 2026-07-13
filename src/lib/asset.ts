// Prefix a public asset path with the base path (needed for GitHub Pages, where
// the site is served under /tc_plant). next/image does not add basePath to the
// src of unoptimized images, so image sources must be wrapped with this.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE}${path}`;
}
