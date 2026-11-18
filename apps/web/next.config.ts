import type { NextConfig } from "next";
import { STATIC_SECURITY_HEADERS } from "./src/server/security/security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@yigora/domain", "@yigora/ui", "@yigora/i18n"],
  async headers() {
    return [{ source: "/:path*", headers: [...STATIC_SECURITY_HEADERS] }];
  },
};

export default nextConfig;
