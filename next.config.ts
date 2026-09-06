import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

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
  images: {
    remotePatterns: [
      ...(supabaseMediaPattern ? [supabaseMediaPattern] : []),
    ],
  },
};

export default withPayload(nextConfig);
