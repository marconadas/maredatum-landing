import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Avoid picking up the parent worktree's package-lock.json as workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
