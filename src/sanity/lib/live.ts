import { defineLive } from "next-sanity/live";
import { sanityClient } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error("SANITY_API_READ_TOKEN es obligatorio cuando Sanity está configurado.");
}

export const { SanityLive, sanityFetch } = defineLive({
  client: sanityClient,
  serverToken: token,
  browserToken: token,
  strict: true,
});
