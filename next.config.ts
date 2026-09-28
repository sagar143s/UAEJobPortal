import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "bcryptjs"],
  poweredByHeader: false,
};

export default nextConfig;
