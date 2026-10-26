import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploads do admin (currículo até 5 MB) passam por server actions.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  /* config options here */
};

export default nextConfig;
