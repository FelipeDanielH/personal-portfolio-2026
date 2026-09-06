import { getPayload } from "payload";
import config from "../../../payload.config";
import { mapPost, mapPostSummary } from "./mapper";

export async function readPublishedPosts() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts", overrideAccess: false, draft: false, depth: 1,
    where: { _status: { equals: "published" } }, sort: ["-publishedAt", "-id"], pagination: false,
    select: { title: true, slug: true, excerpt: true, tags: true, publishedAt: true, updatedAt: true, createdAt: true, featuredImage: true },
  });
  return result.docs.map(mapPostSummary);
}

export async function readPublishedPost(slug: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts", overrideAccess: false, draft: false, depth: 1, limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
  });
  return result.docs[0] ? mapPost(result.docs[0]) : null;
}
