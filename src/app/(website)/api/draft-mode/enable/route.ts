import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { sanityClient } from "@/sanity/lib/client";

const token = process.env.SANITY_API_READ_TOKEN;

const handler = token
  ? defineEnableDraftMode({ client: sanityClient.withConfig({ token }) })
  : { GET: async () => new Response("Sanity no está configurado", { status: 503 }) };

export const GET = handler.GET;
