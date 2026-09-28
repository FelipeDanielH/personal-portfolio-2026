import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Posts } from "../collections/Posts";
import {
  invalidatePostAfterChange,
  invalidatePostAfterDelete,
} from "./cache-invalidation";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const revalidateTagMock = vi.mocked(revalidateTag);

function post(slug: string, status: "draft" | "published", contentMarkdown = "Contenido") {
  return { slug, _status: status, contentMarkdown };
}

describe("Post cache invalidation", () => {
  beforeEach(() => {
    revalidateTagMock.mockClear();
  });

  it("invalidates the list and detail when a Post is created as published", async () => {
    await invalidatePostAfterChange({
      doc: post("publicado-al-crear", "published"),
      operation: "create",
    } as never);

    expect(revalidateTagMock.mock.calls).toEqual([
      ["posts", { expire: 0 }],
      ["post:publicado-al-crear", { expire: 0 }],
    ]);
  });

  it("invalidates a previously visited draft slug when it is published", async () => {
    await invalidatePostAfterChange({
      doc: post("nuevo-articulo", "published"),
      previousDoc: post("nuevo-articulo", "draft"),
    } as never);

    expect(revalidateTagMock.mock.calls).toEqual([
      ["posts", { expire: 0 }],
      ["post:nuevo-articulo", { expire: 0 }],
    ]);
  });

  it("invalidates published content updates without duplicating its slug tag", async () => {
    await invalidatePostAfterChange({
      doc: post("articulo", "published", "Contenido nuevo"),
      previousDoc: post("articulo", "published", "Contenido anterior"),
    } as never);

    expect(revalidateTagMock.mock.calls).toEqual([
      ["posts", { expire: 0 }],
      ["post:articulo", { expire: 0 }],
    ]);
  });

  it("invalidates public caches when a published Post becomes a draft", async () => {
    await invalidatePostAfterChange({
      doc: post("articulo", "draft"),
      previousDoc: post("articulo", "published"),
    } as never);

    expect(revalidateTagMock.mock.calls).toEqual([
      ["posts", { expire: 0 }],
      ["post:articulo", { expire: 0 }],
    ]);
  });

  it("invalidates both detail entries when the slug changes", async () => {
    await invalidatePostAfterChange({
      doc: post("slug-b", "published"),
      previousDoc: post("slug-a", "published"),
    } as never);

    expect(revalidateTagMock.mock.calls).toEqual([
      ["posts", { expire: 0 }],
      ["post:slug-b", { expire: 0 }],
      ["post:slug-a", { expire: 0 }],
    ]);
  });

  it("invalidates the list and detail after deletion", async () => {
    await invalidatePostAfterDelete({ doc: post("articulo-eliminado", "published") } as never);

    expect(revalidateTagMock.mock.calls).toEqual([
      ["posts", { expire: 0 }],
      ["post:articulo-eliminado", { expire: 0 }],
    ]);
  });

  it("registers both invalidation hooks in the Posts collection", () => {
    expect(Posts.hooks?.afterChange).toContain(invalidatePostAfterChange);
    expect(Posts.hooks?.afterDelete).toContain(invalidatePostAfterDelete);
  });
});
