import { describe, expect, it } from "vitest";
import { publishedOrAuthenticated } from "./published-or-authenticated";

describe("publishedOrAuthenticated", () => {
  it("limits anonymous reads to published content", () => {
    expect(publishedOrAuthenticated({ req: { user: undefined } } as never)).toEqual({
      _status: { equals: "published" },
    });
  });

  it("allows authenticated users to read drafts", () => {
    expect(publishedOrAuthenticated({ req: { user: { id: 1 } } } as never)).toBe(true);
  });
});
