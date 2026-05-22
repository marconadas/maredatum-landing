import path from "node:path"
import type { NextConfig } from "next"

// Dual build:
//   - Default (Vercel): full Next.js app, serves page + /api/contact
//   - With NEXT_OUTPUT=export (cPanel): produces ./out static bundle
const isStatic = process.env.NEXT_OUTPUT === "export"

const nextConfig: NextConfig = {
  // Avoid picking up the parent worktree's package-lock.json as workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
  ...(isStatic
    ? {
        output: "export" as const,
        // The static export does not include a Next.js image optimizer.
        images: { unoptimized: true },
        // Apache (cPanel) serves index.html cleanly when trailingSlash is on.
        trailingSlash: true,
      }
    : {}),
}

export default nextConfig
