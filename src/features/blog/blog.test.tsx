import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { normalizeTags, slugFromTitle, markdownImage } from "./editorial";
import { Markdown } from "./markdown";
import { allowedMediaURL, safeLinkURL } from "./urls";

const base = "https://example.supabase.co/storage/v1/object/public/media";

describe("Markdown blog", () => {
  it("normalizes slugs and deduplicates tags without changing their order", () => {
    expect(slugFromTitle("  ¿Qué aprendí con Next.js?  ")).toBe("que-aprendi-con-next-js");
    expect(normalizeTags([" React ", "react", " TypeScript ", "", "NEXT   JS"])).toEqual(["react", "typescript", "next js"]);
    expect(slugFromTitle("a".repeat(121))).toHaveLength(120);
  });

  it("keeps malicious alt text inside the generated Markdown image", () => {
    expect(markdownImage("x](javascript:alert(1))", `${base}/photo(1).png`)).toBe(`![x\\](javascript:alert(1))](${base}/photo%281%29.png)`);
  });

  it("rejects dangerous links and image origins, paths and credentials", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,hi", "//evil.test", "https://user:password@example.org", "java\nscript:alert(1)", "/\\evil.test"]) expect(safeLinkURL(url)).toBeUndefined();
    expect(safeLinkURL("/blog/hello")).toBe("/blog/hello");
    expect(allowedMediaURL(`${base}/photo.png`, base)).toBe(`${base}/photo.png`);
    for (const url of ["https://evil.test/photo.png", `${base}-other/photo.png`, `${base}/%2e%2e/private.png`, `${base}/photo.png?token=x`, `http://example.supabase.co/storage/v1/object/public/media/photo.png`]) expect(allowedMediaURL(url, base)).toBeUndefined();
  });

  it("renders GFM and code while suppressing raw HTML, scripts and foreign images", () => {
    const html = renderToStaticMarkup(<Markdown publicMediaBase={base} content={'## Título\n\n- Uno\n- Dos\n\n[Seguro](https://example.org)\n\n`inline`\n\n```js\nconst x = 1\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n![mal](https://evil.test/a.png)\n\n[mal](javascript:alert(1))\n\n<Component />'} />);
    expect(html).toContain("<h2>Título</h2>");
    expect(html).toContain("<li>Uno</li>");
    expect(html).toContain('<code class="language-js">');
    expect(html).toContain("<table>");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toMatch(/<script|onerror|javascript:|evil\.test|<Component/);
  });
});
