import { revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import type { Post } from "../../payload-types";
import { postCacheTag, postsCacheTag } from "../../features/blog/cache-tags";

const immediateExpiration = { expire: 0 } as const;

function postSlugs(...documents: Array<Partial<Post> | null | undefined>): string[] {
  return [...new Set(documents
    .map((document) => document?.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0))];
}

export function invalidatePostCache(...documents: Array<Partial<Post> | null | undefined>): void {
  revalidateTag(postsCacheTag, immediateExpiration);

  for (const slug of postSlugs(...documents)) {
    revalidateTag(postCacheTag(slug), immediateExpiration);
  }
}

export const invalidatePostAfterChange: CollectionAfterChangeHook<Post> = ({ doc, previousDoc }) => {
  invalidatePostCache(doc, previousDoc);
  return doc;
};

export const invalidatePostAfterDelete: CollectionAfterDeleteHook<Post> = ({ doc }) => {
  invalidatePostCache(doc);
  return doc;
};
