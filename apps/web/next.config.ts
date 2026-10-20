import path from "node:path";
import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image; the root must be the monorepo so workspace deps are traced.
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  cacheComponents: true,
  partialPrefetching: true,
  // The browser talks to the API through this origin, so the session cookie stays same-site.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
