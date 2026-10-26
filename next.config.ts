import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploads do admin (currículo até 4 MB; a Vercel aceita até 4,5 MB) passam por server actions.
  experimental: { serverActions: { bodySizeLimit: '4.5mb' } },
  /* config options here */
};

export default nextConfig;
