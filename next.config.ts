import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { sanity } from "next-sanity/live/cache-life";

function getSupabaseMediaPattern(): URL | undefined {
  const publicURL = process.env.SUPABASE_STORAGE_PUBLIC_URL?.trim();

  if (!publicURL) {
    return undefined;
  }

  return new URL(`${publicURL.replace(/\/+$/, "")}/**`);
}

const supabaseMediaPattern = getSupabaseMediaPattern();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  cacheLife: { default: sanity },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      ...(supabaseMediaPattern ? [supabaseMediaPattern] : []),
    ],
  },
};

export default withPayload(nextConfig);
